import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { MailerService } from '@nestjs-modules/mailer';
import { FlightStatusResponseDto } from '@/modules/ticket/dto/flight-status-response.dto';
import { FlightStatus } from '@/modules/ticket/dto/flight-status-response.dto';
import { TicketFlightDetailsDto } from './dto/ticket-flight-details.dto';

@Injectable()
export class TicketService {
  constructor(
    private prisma: PrismaService,
    private mailerService: MailerService,
  ) {}

  async generateTickets(
    prisma: Prisma.TransactionClient,
    bookingId: number,
    passengers: any[],
    flightDetails: any[],
    cabinClass: string,
  ) {
    try {
      // Get booking with user info first
      const booking = await prisma.bookings.findUnique({
        where: { id: bookingId },
        include: { user: true },
      });

      if (!booking?.user?.email) {
        throw new BadRequestException('Booking user email not found');
      }

      // Create all tickets in one batch
      const ticketData = [];
      for (const passenger of passengers) {
        for (const flight of flightDetails) {
          ticketData.push({
            ticket_number: `TKT-${uuidv4().slice(0, 8)}`,
            booking_id: bookingId,
            passenger_id: passenger.id,
            flight_id: flight.flight_id,
            seat_number: await this.assignSeatNumber(
              flight.flight_id,
              cabinClass,
            ),
            gate: await this.assignGate(),
            barcode: `BAR-${uuidv4().slice(0, 8)}`,
            status: 'CONFIRMED',
          });
        }
      }

      // Batch create tickets
      const tickets = await prisma.tickets.createMany({
        data: ticketData,
      });

      // Return created tickets for email sending
      return {
        ticketCount: tickets.count,
        userEmail: booking.user.email,
        ticketData,
      };
    } catch (error) {
      throw new BadRequestException(
        'Failed to generate tickets: ' + error.message,
      );
    }
  }

  // Send emails separately after transaction completes
  async sendTicketEmails(userEmail: string, tickets: any[]) {
    for (const ticket of tickets) {
      try {
        // Get passenger info
        const passenger = await this.prisma.booking_passengers.findUnique({
          where: { id: ticket.passenger_id },
        });

        // Get flight info from both booking_flights and flight details
        const [bookingFlight, flightDetails] = await Promise.all([
          this.prisma.booking_flights.findFirst({
            where: {
              booking_id: ticket.booking_id,
              flight_id: ticket.flight_id,
            },
          }),
          this.getFlightDetails(ticket.flight_id),
        ]);

        if (!passenger || !bookingFlight || !flightDetails) {
          throw new Error(
            `Information not found for ticket ${ticket.ticket_number}`,
          );
        }

        // Format flight date properly
        const formatDate = (date: Date) => {
          // Convert UTC to local date and format as dd-mm-yyyy
          return date
            .toLocaleDateString('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              timeZone: 'UTC', // Preserve UTC time
            })
            .split('/')
            .join('-');
        };

        await this.mailerService.sendMail({
          to: userEmail,
          subject: 'Your QAirline Flight Ticket',
          template: './ticket',
          context: {
            ticketNumber: ticket.ticket_number,
            passengerName: `${passenger.first_name} ${passenger.last_name}`,
            seatNumber: ticket.seat_number,
            gate: ticket.gate,
            barcode: ticket.barcode,
            // Flight details
            flightId: ticket.flight_id,
            flightNo: flightDetails.flight_no,
            airline: flightDetails.airline,
            flightDate: formatDate(new Date(bookingFlight.flight_date)),
            origin: flightDetails.origin,
            destination: flightDetails.destination,
          },
        });
      } catch (err) {
        console.error(
          `Failed to send ticket email for ticket ${ticket.ticket_number}:`,
          err,
        );
      }
    }
  }

  async sendBookingCancellationEmail(
    userEmail: string,
    bookingNumber: string,
    totalAmount: number,
  ) {
    try {
      // Get all cancelled tickets for this booking
      const tickets = await this.prisma.tickets.findMany({
        where: {
          booking: { booking_number: bookingNumber },
          status: 'CANCELLED',
        },
        include: {
          passenger: true,
          booking: {
            include: { booking_flights: true },
          },
        },
      });

      await this.mailerService.sendMail({
        to: userEmail,
        subject: 'Your QAirline Booking Cancellation Confirmation',
        template: './booking-cancelled',
        context: {
          bookingNumber,
          totalAmount,
          cancellationDate: new Date().toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          }),
          tickets: tickets.map((ticket) => ({
            ticketNumber: ticket.ticket_number,
            passengerName: `${ticket.passenger.first_name} ${ticket.passenger.last_name}`,
            flightId: ticket.flight_id,
          })),
        },
      });
    } catch (err) {
      console.error(
        `Failed to send cancellation email for booking ${bookingNumber}:`,
        err,
      );
    }
  }

  async checkFlightStatus(
    ticketNumber: string,
  ): Promise<FlightStatusResponseDto> {
    // Get ticket with flight info through booking
    const ticket = await this.prisma.tickets.findUnique({
      where: { ticket_number: ticketNumber },
      include: {
        booking: {
          include: {
            booking_flights: true,
          },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket ${ticketNumber} not found`);
    }

    // Get flight details
    const flightId = ticket.flight_id;
    const prefix = flightId.charAt(0).toUpperCase();
    const numericId = flightId.slice(1);
    let flight;

    if (prefix === 'D') {
      flight = await this.prisma.domestic_flights.findUnique({
        where: { id: `D${numericId}` },
      });
    } else if (prefix === 'I') {
      flight = await this.prisma.international_flights.findUnique({
        where: { id: `I${numericId}` },
      });
    }

    if (!flight) {
      throw new NotFoundException(`Flight ${flightId} not found`);
    }

    // Format date
    const flightDate = new Date(ticket.booking.booking_flights[0].flight_date);
    const formattedDate = flightDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC',
    });

    return {
      ticketNumber: ticket.ticket_number,
      flightId: ticket.flight_id,
      status:
        flight.delay_duration > 0 ? FlightStatus.DELAYED : FlightStatus.ON_TIME,
      flightDate: formattedDate,
      delayDuration:
        flight.delay_duration > 0 ? flight.delay_duration : undefined,
      gate: ticket.gate,
    };
  }

  async getFlightDetailsByTicket(
    ticketNumber: string,
  ): Promise<TicketFlightDetailsDto> {
    // First find the basic ticket
    const basicTicket = await this.prisma.tickets.findUnique({
      where: { ticket_number: ticketNumber },
    });

    if (!basicTicket) {
      throw new NotFoundException(`Ticket ${ticketNumber} not found`);
    }

    // Then get the full ticket details with all relations
    const ticketDetails = await this.prisma.tickets.findUnique({
      where: { ticket_number: ticketNumber },
      include: {
        passenger: {
          select: {
            first_name: true,
            last_name: true,
          },
        },
        booking: {
          select: {
            cabin_class: true,
            booking_flights: {
              where: {
                flight_id: basicTicket.flight_id,
              },
            },
          },
        },
      },
    });

    // Get flight details based on flight_id prefix
    const flightId = basicTicket.flight_id;
    const prefix = flightId.charAt(0).toUpperCase();
    const numericId = flightId.slice(1);

    let flightDetails;
    if (prefix === 'D') {
      flightDetails = await this.prisma.domestic_flights.findUnique({
        where: { id: `D${numericId}` },
      });
    } else if (prefix === 'I') {
      flightDetails = await this.prisma.international_flights.findUnique({
        where: { id: `I${numericId}` },
      });
    }

    if (!flightDetails) {
      throw new NotFoundException(`Flight ${flightId} not found`);
    }

    const bookingFlight = ticketDetails.booking.booking_flights[0];
    const flightDate = bookingFlight.flight_date;

    // Create a new Date object combining flight date with departure time
    const departDateTime = new Date(flightDate);
    departDateTime.setUTCHours(flightDetails.depart_time.getUTCHours());
    departDateTime.setUTCMinutes(flightDetails.depart_time.getUTCMinutes());

    // Calculate arrival time based on departure time and duration
    const arrivalDateTime = this.calculateArrivalTime(
      departDateTime,
      flightDetails.duration,
    );

    return {
      ticketNumber: ticketDetails.ticket_number,
      flightId: flightId,
      airline: flightDetails.airline,
      flightNo: flightDetails.flight_no,
      origin: flightDetails.origin,
      destination: flightDetails.destination,
      departDate: departDateTime,
      departTime: this.formatTimeOnly(departDateTime),
      arrivalDate: arrivalDateTime, 
      arrivalTime: this.formatTimeOnly(arrivalDateTime),
      duration: flightDetails.duration,
      gate: flightDetails.gate,
      status: this.determineFlightStatus(flightDetails.delay_duration),
      delayDuration: flightDetails.delay_duration || undefined,
      passengerName: `${ticketDetails.passenger.first_name} ${ticketDetails.passenger.last_name}`,
      seatNumber: ticketDetails.seat_number,
      cabinClass: ticketDetails.booking.cabin_class,
    };
  }

  private formatTimeOnly(date: Date): string {
    // Format time as HH:mm in 24-hour format, preserving the original hours
    return `${String(date.getUTCHours()).padStart(2, '0')}:${String(date.getUTCMinutes()).padStart(2, '0')}`;
  }

  private calculateArrivalTime(
    departTime: Date,
    durationMinutes: number,
  ): Date {
    // Create a new date object to avoid modifying the original
    const arrivalTime = new Date(departTime);

    // Calculate hours and minutes from duration
    const hoursToAdd = Math.floor(durationMinutes / 60);
    const minutesToAdd = durationMinutes % 60;

    // Add hours and minutes
    arrivalTime.setUTCHours(arrivalTime.getUTCHours() + hoursToAdd);
    arrivalTime.setUTCMinutes(arrivalTime.getUTCMinutes() + minutesToAdd);

    return arrivalTime;
  }

  private determineFlightStatus(delayDuration?: number): FlightStatus {
    return delayDuration && delayDuration > 0
      ? FlightStatus.DELAYED
      : FlightStatus.ON_TIME;
  }

  private async assignSeatNumber(
    flightId: string,
    cabinClass: string,
  ): Promise<string> {
    const prefix =
      cabinClass === 'ECONOMY' ? 'Y' : cabinClass === 'BUSINESS' ? 'B' : 'F';
    return `${prefix}${Math.floor(Math.random() * 30)}${String.fromCharCode(65 + Math.floor(Math.random() * 6))}`;
  }

  private async assignGate(): Promise<string> {
    return `G${Math.floor(Math.random() * 20 + 1)}`;
  }

  private async getFlightDetails(flightId: string) {
    const prefix = flightId.charAt(0).toUpperCase();
    const numericId = flightId.slice(1);

    if (prefix === 'D') {
      return await this.prisma.domestic_flights.findUnique({
        where: { id: `D${numericId}` },
      });
    } else if (prefix === 'I') {
      return await this.prisma.international_flights.findUnique({
        where: { id: `I${numericId}` },
      });
    }
    return null;
  }
}
