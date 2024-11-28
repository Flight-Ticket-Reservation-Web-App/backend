// src/booking/booking.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { PassengerType } from './dto/passenger-info.dto';
import { TripType, CabinClass } from '../flight/dto/search-flight.dto';
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

    // Validate flight exists and has enough seats
    const outboundFlight = await this.validateAndGetFlight(outboundFlightId);
    let returnFlight;

    if (tripType === TripType.ROUND_TRIP) {
      if (!returnFlightId) {
        throw new BadRequestException('Return flight required for round trip');
      }
      returnFlight = await this.validateAndGetFlight(returnFlightId);
    }

    // Calculate total price
    const totalPrice = this.calculateTotalPrice(
      outboundFlight,
      returnFlight,
      cabinClass,
      passengers,
    );

    // Start transaction
    return this.prisma.$transaction(async (prisma) => {
      // Create booking
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
                flight_type: 'DOMESTIC',
                flight_id: parseInt(outboundFlightId),
                flight_direction: 'OUTBOUND',
                flight_date: outboundFlight.depart_time,
                fare_amount: this.getFareAmount(outboundFlight, cabinClass),
              },
              ...(returnFlight
                ? [
                    {
                      flight_type: 'DOMESTIC',
                      flight_id: parseInt(returnFlightId),
                      flight_direction: 'RETURN',
                      flight_date: returnFlight.depart_time,
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
              dob: new Date(p.dob), // Convert to Date object
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

      // Update flight seats
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

  private async validateAndGetFlight(flightId: string) {
    const flight = await this.prisma.domestic_flights.findUnique({
      where: { id: parseInt(flightId) },
    });

    if (!flight) {
      throw new BadRequestException(`Flight ${flightId} not found`);
    }

    return flight;
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

    await prisma.domestic_flights.update({
      where: { id: parseInt(outboundFlightId) },
      data: { [seatField]: { decrement: passengerCount } },
    });

    if (returnFlightId) {
      await prisma.domestic_flights.update({
        where: { id: parseInt(returnFlightId) },
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
}
