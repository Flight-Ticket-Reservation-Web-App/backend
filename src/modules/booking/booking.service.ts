import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateBookingDto } from '@/modules/booking/dto/create-booking.dto';
import { PassengerType } from '@/modules/booking/dto/passenger-info.dto';
import { TripType, CabinClass } from '@/modules/flight/dto/search-flight.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class BookingService {
  constructor(private prisma: PrismaService) {}

  async create(createBookingDto: CreateBookingDto, userId: number) {
    const {
      tripType,
      outboundFlightId,
      returnFlightId,
      cabinClass,
      passengers,
    } = createBookingDto;

    // Validate flights and get their details
    const outboundFlight = await this.validateAndGetFlight(
      outboundFlightId,
      cabinClass,
    );
    let returnFlight;

    if (tripType === TripType.ROUND_TRIP) {
      if (!returnFlightId) {
        throw new BadRequestException('Return flight required for round trip');
      }
      returnFlight = await this.validateAndGetFlight(
        returnFlightId,
        cabinClass,
      );
    }

    // Validate seat availability
    await this.validateSeatAvailability(
      outboundFlight,
      cabinClass,
      passengers.length,
    );
    if (returnFlight) {
      await this.validateSeatAvailability(
        returnFlight,
        cabinClass,
        passengers.length,
      );
    }

    // Calculate total price
    const totalPrice = this.calculateTotalPrice(
      outboundFlight,
      returnFlight,
      cabinClass,
      passengers,
    );

    return this.prisma.$transaction(async (prisma) => {
      const booking = await prisma.bookings.create({
        data: {
          user_id: userId,
          booking_number: uuidv4(),
          total_amount: totalPrice,
          trip_type: tripType,
          cabin_class: cabinClass,
          status: 'CONFIRMED',
          booking_flights: {
            create: [
              {
                flight_type: outboundFlight.type,
                flight_id: outboundFlightId,
                flight_direction: 'OUTBOUND',
                flight_date: this.combineDateAndTime(
                  createBookingDto.departDate,
                  outboundFlight.depart_time,
                ),
                fare_amount: this.getFareAmount(outboundFlight, cabinClass),
              },
              ...(returnFlight
                ? [
                    {
                      flight_type: returnFlight.type,
                      flight_id: returnFlightId,
                      flight_direction: 'RETURN',
                      flight_date: this.combineDateAndTime(
                        createBookingDto.returnDate,
                        returnFlight.depart_time,
                      ),
                      fare_amount: this.getFareAmount(returnFlight, cabinClass),
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

      await this.updateFlightSeats(
        prisma,
        outboundFlightId,
        returnFlightId,
        cabinClass,
        passengers.length,
      );

      return booking;
    });
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
    returnFlight: any,
    cabinClass: CabinClass,
    passengers: any[],
  ) {
    const outboundFare = this.getFareAmount(outboundFlight, cabinClass);
    const returnFare = returnFlight
      ? this.getFareAmount(returnFlight, cabinClass)
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
    outboundFlightId: string,
    returnFlightId: string | undefined,
    cabinClass: CabinClass,
    passengerCount: number,
  ) {
    const seatField = this.getSeatField(cabinClass);

    const updateSeats = async (flightId: string) => {
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
    };

    await updateSeats(outboundFlightId);
    if (returnFlightId) {
      await updateSeats(returnFlightId);
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
    console.log('Raw inputs:', { date, time });

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

    console.log('Parsed dates:', {
      bookingDate: bookingDate.toISOString(),
      flightTime: flightTime.toISOString(),
    });

    // Combine date and time
    const combined = new Date(bookingDate);
    combined.setUTCHours(flightTime.getUTCHours());
    combined.setUTCMinutes(flightTime.getUTCMinutes());
    combined.setUTCSeconds(0);
    combined.setUTCMilliseconds(0);

    return combined;
  }
}
