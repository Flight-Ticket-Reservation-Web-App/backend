import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateBookingDto } from '@/modules/booking/dto/create-booking.dto';
import { v4 as uuidv4 } from 'uuid';
import { TicketService } from '@/modules/ticket/ticket.service';
import { BookingHistoryDto } from '@/modules/booking/dto/booking-history.dto';
import { BookingHistoryQueryDto } from '@/modules/booking/dto/booking-history-query.dto';
import {
  SortOrder,
  CabinClass,
  TripType,
  PassengerType,
  BookingStatus,
} from '@/common/enums';

@Injectable()
export class BookingService {
  constructor(
    private prisma: PrismaService,
    private ticketService: TicketService,
  ) {}

  async create(createBookingDto: CreateBookingDto, userId: number) {
    const { tripType, outboundFlight, returnFlight, passengers } =
      createBookingDto;

    // Validate flights and get their details
    const outboundFlightDetails = await this.validateAndGetFlight(
      outboundFlight.flightId,
      outboundFlight.cabinClass,
    );

    let returnFlightDetails;
    if (tripType === TripType.ROUND_TRIP) {
      if (!returnFlight) {
        throw new BadRequestException('Return flight required for round trip');
      }
      returnFlightDetails = await this.validateAndGetFlight(
        returnFlight.flightId,
        returnFlight.cabinClass,
      );
    }

    // Validate seat availability
    await this.validateSeatAvailability(
      outboundFlightDetails,
      outboundFlight.cabinClass,
      passengers.length,
    );

    if (returnFlightDetails) {
      await this.validateSeatAvailability(
        returnFlightDetails,
        returnFlight.cabinClass,
        passengers.length,
      );
    }

    // Calculate total price
    const totalPrice = this.calculateTotalPrice(
      outboundFlightDetails,
      outboundFlight.cabinClass,
      returnFlightDetails,
      returnFlight?.cabinClass,
      passengers,
    );

    return await this.prisma.$transaction(
      async (prisma) => {
        const booking = await prisma.bookings.create({
          data: {
            user_id: userId,
            booking_number: uuidv4(),
            total_amount: totalPrice,
            trip_type: tripType,
            cabin_class: `${outboundFlight.cabinClass}${returnFlight ? '/' + returnFlight.cabinClass : ''}`,
            status: 'CONFIRMED',
            booking_flights: {
              create: [
                {
                  flight_type: outboundFlightDetails.type,
                  flight_id: outboundFlight.flightId,
                  flight_direction: 'OUTBOUND',
                  flight_date: this.combineDateAndTime(
                    outboundFlight.date,
                    outboundFlightDetails.depart_time,
                  ),
                  fare_amount: this.getFareAmount(
                    outboundFlightDetails,
                    outboundFlight.cabinClass,
                  ),
                },
                ...(returnFlightDetails
                  ? [
                      {
                        flight_type: returnFlightDetails.type,
                        flight_id: returnFlight.flightId,
                        flight_direction: 'RETURN',
                        flight_date: this.combineDateAndTime(
                          returnFlight.date,
                          returnFlightDetails.depart_time,
                        ),
                        fare_amount: this.getFareAmount(
                          returnFlightDetails,
                          returnFlight.cabinClass,
                        ),
                      },
                    ]
                  : []),
              ],
            },
            booking_passengers: {
              create: passengers.map((p) => ({
                first_name: p.firstName,
                last_name: p.lastName,
                type: p.type,
                gender: p.gender,
                dob: new Date(p.dob),
                passport_number: p.passportNumber,
                passport_expiry: p.passportExpiry
                  ? new Date(p.passportExpiry)
                  : null,
                nationality: p.nationality,
              })),
            },
          },
          include: {
            booking_flights: true,
            booking_passengers: true,
          },
        });

        // Update seats for outbound flight
        await this.updateFlightSeats(
          prisma,
          outboundFlight.flightId,
          outboundFlight.cabinClass,
          passengers.length,
        );

        // Update seats for return flight if exists
        if (returnFlight) {
          await this.updateFlightSeats(
            prisma,
            returnFlight.flightId,
            returnFlight.cabinClass,
            passengers.length,
          );
        }

        // Generate tickets after booking creation
        const ticketResult = await this.ticketService.generateTickets(
          prisma,
          booking.id,
          booking.booking_passengers,
          booking.booking_flights,
          booking.cabin_class,
        );

        // Send emails after transaction completes
        setImmediate(() => {
          this.ticketService
            .sendTicketEmails(ticketResult.userEmail, ticketResult.ticketData)
            .catch((err) =>
              console.error('Failed to send ticket emails:', err),
            );
        });

        return booking;
      },
      {
        timeout: 10000, // Extend timeout to 10 seconds
      },
    );
  }

  private async validateAndGetFlight(flightId: string, cabinClass: CabinClass) {
    const prefix = flightId.charAt(0).toUpperCase();
    const numericId = flightId.slice(1);

    let flight;

    if (prefix === 'D') {
      // Search domestic flights
      flight = await this.prisma.domestic_flights.findUnique({
        where: { id: `D${numericId}` },
      });

      if (flight) {
        flight = { ...flight, type: 'DOMESTIC' };
      }
    } else if (prefix === 'I') {
      // Search international flights
      flight = await this.prisma.international_flights.findUnique({
        where: { id: `I${numericId}` },
      });

      if (flight) {
        flight = { ...flight, type: 'INTERNATIONAL' };
      }
    }

    if (!flight) {
      throw new BadRequestException(`Flight ${flightId} not found`);
    }

    // Validate if the cabin class is available for this flight
    const fare = this.getFareAmount(flight, cabinClass);
    if (fare === 0) {
      throw new BadRequestException(
        `${cabinClass} class is not available for flight ${flightId}`,
      );
    }

    return flight;
  }

  private async validateSeatAvailability(
    flight: any,
    cabinClass: CabinClass,
    passengerCount: number,
  ) {
    let availableSeats: number;

    switch (cabinClass) {
      case CabinClass.ECONOMY:
        availableSeats = flight.available_economy_seats;
        break;
      case CabinClass.BUSINESS:
        availableSeats = flight.available_business_seats;
        break;
      case CabinClass.FIRST:
        availableSeats = flight.available_first_seats;
        break;
    }

    if (availableSeats < passengerCount) {
      throw new BadRequestException(
        `Not enough ${cabinClass.toLowerCase()} seats available on flight ${flight.id}. Available: ${availableSeats}, Requested: ${passengerCount}`,
      );
    }
  }

  private calculateTotalPrice(
    outboundFlight: any,
    outboundCabinClass: CabinClass,
    returnFlight: any,
    returnCabinClass: CabinClass,
    passengers: any[],
  ) {
    const outboundFare = this.getFareAmount(outboundFlight, outboundCabinClass);
    const returnFare = returnFlight
      ? this.getFareAmount(returnFlight, returnCabinClass)
      : 0;

    return passengers.reduce((total, passenger) => {
      const fare = outboundFare + returnFare;
      return (
        total + (passenger.type === PassengerType.CHILD ? fare * 0.75 : fare)
      );
    }, 0);
  }

  private getFareAmount(flight: any, cabinClass: CabinClass) {
    switch (cabinClass) {
      case CabinClass.ECONOMY:
        return Number(flight.economy_fare);
      case CabinClass.BUSINESS:
        return Number(flight.business_fare);
      case CabinClass.FIRST:
        return Number(flight.first_fare);
    }
  }

  private async updateFlightSeats(
    prisma: any,
    flightId: string,
    cabinClass: CabinClass,
    passengerCount: number,
  ) {
    const seatField = this.getSeatField(cabinClass);

    const prefix = flightId.charAt(0).toUpperCase();
    const numericId = flightId.slice(1);

    if (prefix === 'D') {
      await prisma.domestic_flights.update({
        where: { id: `D${numericId}` },
        data: { [seatField]: { decrement: passengerCount } },
      });
    } else if (prefix === 'I') {
      await prisma.international_flights.update({
        where: { id: `I${numericId}` },
        data: { [seatField]: { decrement: passengerCount } },
      });
    }
  }

  private getSeatField(cabinClass: CabinClass) {
    switch (cabinClass) {
      case CabinClass.ECONOMY:
        return 'available_economy_seats';
      case CabinClass.BUSINESS:
        return 'available_business_seats';
      case CabinClass.FIRST:
        return 'available_first_seats';
    }
  }

  private combineDateAndTime(date: Date, time: Date): Date {
    // console.log('Raw inputs:', { date, time });

    // Ensure date is valid
    const bookingDate = new Date(date);
    if (isNaN(bookingDate.getTime())) {
      throw new BadRequestException(`Invalid booking date: ${date}`);
    }

    // Handle flight time which comes from db as Time(6)
    let flightTime: Date;
    if (typeof time === 'string') {
      flightTime = new Date(`1970-01-01T${time}`);
    } else {
      flightTime = new Date(time);
    }

    if (isNaN(flightTime.getTime())) {
      throw new BadRequestException(`Invalid flight time: ${time}`);
    }

    // console.log('Parsed dates:', {
    //   bookingDate: bookingDate.toISOString(),
    //   flightTime: flightTime.toISOString(),
    // });

    // Combine date and time
    const combined = new Date(bookingDate);
    combined.setUTCHours(flightTime.getUTCHours());
    combined.setUTCMinutes(flightTime.getUTCMinutes());
    combined.setUTCSeconds(0);
    combined.setUTCMilliseconds(0);

    // console.log('Combined date and time:', {
    //   raw: combined,
    //   iso: combined.toISOString(),
    //   utc: combined.toUTCString(),
    // });

    return combined;
  }

  //

  async getBookingHistory(
    userId: number,
    query: BookingHistoryQueryDto,
  ): Promise<{ data: BookingHistoryDto[]; total: number; pages: number }> {
    const { status, tripType, sortOrder = SortOrder.DESC, page = 1, limit = 10 } = query;

    const skip = (page - 1) * limit;

    const whereClause = {
      user_id: userId,
      ...(status && { status }),
      ...(tripType && { trip_type: tripType }),
    };

    const total = await this.prisma.bookings.count({
      where: whereClause,
    });

    const pages = Math.ceil(total / limit);

    const bookings = await this.prisma.bookings.findMany({
      where: whereClause,
      include: {
        booking_flights: true,
        booking_passengers: {
          include: {
            tickets: {
              select: {
                ticket_number: true,
                flight_id: true,
              },
            },
          },
        },
      },
      orderBy: {
        created_at: sortOrder,
      },
      skip,
      take: limit,
    });

    const data = bookings.map((booking) => ({
      id: booking.id,
      bookingNumber: booking.booking_number,
      totalAmount: Number(booking.total_amount),
      tripType: booking.trip_type,
      cabinClass: booking.cabin_class,
      status: booking.status,
      createdAt: booking.created_at,
      flights: booking.booking_flights.map((flight) => ({
        flightId: flight.flight_id,
        flightType: flight.flight_type,
        flightDirection: flight.flight_direction,
        flightDate: flight.flight_date,
        fareAmount: Number(flight.fare_amount),
      })),
      passengers: booking.booking_passengers.map((passenger) => ({
        firstName: passenger.first_name,
        lastName: passenger.last_name,
        type: passenger.type as PassengerType,
        gender: passenger.gender,
        passportNumber: passenger.passport_number || undefined,
        tickets: passenger.tickets.map((ticket) => ({
          ticketNumber: ticket.ticket_number,
          flightId: ticket.flight_id,
        })),
      })),
    }));

    return { data, total, pages };
  }

  async getBookingByNumber(
    bookingNumber: string,
    userId: number,
  ): Promise<BookingHistoryDto> {
    const booking = await this.prisma.bookings.findUnique({
      where: {
        booking_number: bookingNumber,
        user_id: userId,
      },
      include: {
        booking_flights: true,
        booking_passengers: {
          include: {
            tickets: {
              select: {
                ticket_number: true,
                flight_id: true,
              },
            },
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException(`Booking #${bookingNumber} not found`);
    }

    return {
      id: booking.id,
      bookingNumber: booking.booking_number,
      totalAmount: Number(booking.total_amount),
      tripType: booking.trip_type,
      cabinClass: booking.cabin_class,
      status: booking.status,
      createdAt: booking.created_at,
      flights: booking.booking_flights.map((flight) => ({
        flightId: flight.flight_id,
        flightType: flight.flight_type,
        flightDirection: flight.flight_direction,
        flightDate: flight.flight_date,
        fareAmount: Number(flight.fare_amount),
      })),
      passengers: booking.booking_passengers.map((passenger) => ({
        firstName: passenger.first_name,
        lastName: passenger.last_name,
        type: passenger.type as PassengerType,
        gender: passenger.gender,
        passportNumber: passenger.passport_number || undefined,
        tickets: passenger.tickets.map((ticket) => ({
          ticketNumber: ticket.ticket_number,
          flightId: ticket.flight_id,
        })),
      })),
    };
  }

  async cancelBooking(
    bookingNumber: string,
    userId: number,
  ): Promise<BookingHistoryDto> {
    // Execute in transaction to ensure all updates succeed or fail together
    return await this.prisma.$transaction(async (prisma) => {
      // Get booking with flights and validate
      const booking = await prisma.bookings.findUnique({
        where: {
          booking_number: bookingNumber,
          user_id: userId,
        },
        include: {
          booking_flights: true,
          booking_passengers: true,
          user: true, // Include user information to get email
        },
      });

      if (!booking) {
        throw new NotFoundException(`Booking #${bookingNumber} not found`);
      }

      if (booking.status === BookingStatus.CANCELLED) {
        throw new BadRequestException('Booking is already cancelled');
      }

      // Calculate flight dates to check if cancellation is allowed
      const now = new Date();
      const hasUpcomingFlights = booking.booking_flights.some(
        (flight) => new Date(flight.flight_date) > now,
      );

      if (!hasUpcomingFlights) {
        throw new BadRequestException(
          'Cannot cancel booking - all flights have departed',
        );
      }

      // Update booking status
      const updatedBooking = await prisma.bookings.update({
        where: { booking_number: bookingNumber },
        data: {
          status: BookingStatus.CANCELLED,
          tickets: {
            updateMany: {
              where: { booking_id: booking.id },
              data: { status: 'CANCELLED' },
            },
          },
        },
        include: {
          booking_flights: true,
          booking_passengers: {
            include: {
              tickets: {
                select: {
                  ticket_number: true,
                  flight_id: true,
                },
              },
            },
          },
        },
      });

      // Restore seats for each flight
      for (const flight of booking.booking_flights) {
        const cabinClass =
          booking.cabin_class.split('/')[
            flight.flight_direction === 'OUTBOUND' ? 0 : 1
          ];
        const seatField = this.getSeatField(cabinClass as CabinClass);
        const prefix = flight.flight_id.charAt(0).toUpperCase();
        const numericId = flight.flight_id.slice(1);

        if (prefix === 'D') {
          await prisma.domestic_flights.update({
            where: { id: `D${numericId}` },
            data: {
              [seatField]: { increment: booking.booking_passengers.length },
            },
          });
        } else if (prefix === 'I') {
          await prisma.international_flights.update({
            where: { id: `I${numericId}` },
            data: {
              [seatField]: { increment: booking.booking_passengers.length },
            },
          });
        }
      }

      // Send cancellation email after successful update
      setImmediate(() => {
        this.ticketService
          .sendBookingCancellationEmail(
            booking.user.email,
            bookingNumber,
            Number(booking.total_amount),
          )
          .catch((err) =>
            console.error('Failed to send cancellation email:', err),
          );
      });

      return {
        id: updatedBooking.id,
        bookingNumber: updatedBooking.booking_number,
        totalAmount: Number(updatedBooking.total_amount),
        tripType: updatedBooking.trip_type,
        cabinClass: updatedBooking.cabin_class,
        status: updatedBooking.status,
        createdAt: updatedBooking.created_at,
        flights: updatedBooking.booking_flights.map((flight) => ({
          flightId: flight.flight_id,
          flightType: flight.flight_type,
          flightDirection: flight.flight_direction,
          flightDate: flight.flight_date,
          fareAmount: Number(flight.fare_amount),
        })),
        passengers: updatedBooking.booking_passengers.map((passenger) => ({
          firstName: passenger.first_name,
          lastName: passenger.last_name,
          type: passenger.type as PassengerType,
          gender: passenger.gender,
          passportNumber: passenger.passport_number || undefined,
          tickets: passenger.tickets.map((ticket) => ({
            ticketNumber: ticket.ticket_number,
            flightId: ticket.flight_id,
          })),
        })),
      };
    });
  }
}
