import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SearchFlightDto, TripType, CabinClass } from './dto/search-flight.dto';
import { FlightSearchResponseDto } from './dto/flight-search-response.dto';
import { domestic_flights, international_flights } from '@prisma/client';

@Injectable()
export class FlightService {
  constructor(private readonly prisma: PrismaService) {}

  // Domestic Flights
  async findAllDomestic(): Promise<domestic_flights[]> {
    return this.prisma.domestic_flights.findMany();
  }

  async findOneDomestic(id: number): Promise<domestic_flights> {
    return this.prisma.domestic_flights.findUnique({ where: { id } });
  }

  async createDomestic(flight: domestic_flights): Promise<domestic_flights> {
    return this.prisma.domestic_flights.create({ data: flight });
  }

  async updateDomestic(
    id: number,
    flight: domestic_flights,
  ): Promise<domestic_flights> {
    return this.prisma.domestic_flights.update({
      where: { id },
      data: flight,
    });
  }

  async deleteDomestic(id: number): Promise<domestic_flights> {
    return this.prisma.domestic_flights.delete({ where: { id } });
  }

  // International Flights
  async findAllInternational(): Promise<international_flights[]> {
    return this.prisma.international_flights.findMany();
  }

  async findOneInternational(index: number): Promise<international_flights> {
    return this.prisma.international_flights.findUnique({ where: { index } });
  }

  async createInternational(
    flight: international_flights,
  ): Promise<international_flights> {
    return this.prisma.international_flights.create({ data: flight });
  }

  async updateInternational(
    index: number,
    flight: international_flights,
  ): Promise<international_flights> {
    return this.prisma.international_flights.update({
      where: { index },
      data: flight,
    });
  }

  async deleteInternational(index: number): Promise<international_flights> {
    return this.prisma.international_flights.delete({ where: { index } });
  }

  async searchFlights(searchParams: SearchFlightDto): Promise<{
    outboundFlights: FlightSearchResponseDto[];
    returnFlights?: FlightSearchResponseDto[];
  }> {
    const {
      origin,
      destination,
      departDate,
      returnDate,
      passengers,
      cabinClass,
      tripType,
    } = searchParams;

    if (tripType === TripType.ROUND_TRIP) {
      if (!returnDate) {
        throw new BadRequestException(
          'Return date is required for round trips',
        );
      }

      const departTimestamp = new Date(departDate).getTime();
      const returnTimestamp = new Date(returnDate).getTime();

      if (returnTimestamp <= departTimestamp) {
        throw new BadRequestException(
          'Return date must be after departure date',
        );
      }
    }

    const outboundFlights = await this.searchOneWayFlights(
      origin,
      destination,
      departDate,
      passengers,
      cabinClass,
    );

    if (tripType === TripType.ONE_WAY) {
      return { outboundFlights };
    }

    const returnFlights = await this.searchOneWayFlights(
      destination,
      origin,
      returnDate,
      passengers,
      cabinClass,
    );

    return { outboundFlights, returnFlights };
  }

  private formatTimeOnly(date: Date): string {
    const utcHours = date.getUTCHours();
    const utcMinutes = date.getUTCMinutes();

    return `${utcHours.toString().padStart(2, '0')}:${utcMinutes.toString().padStart(2, '0')}`;
  }

  private async searchOneWayFlights(
    origin: string,
    destination: string,
    date: Date,
    passengers: number,
    cabinClass: CabinClass,
  ): Promise<FlightSearchResponseDto[]> {
    const weekday = date.getDay();

    const [domesticFlights, internationalFlights] = await Promise.all([
      this.prisma.domestic_flights.findMany({
        where: {
          origin,
          destination,
          depart_weekday: weekday,
        },
      }),
      this.prisma.international_flights.findMany({
        where: {
          origin,
          destination,
          depart_weekday: weekday,
        },
      }),
    ]);

    const allFlights = [...domesticFlights, ...internationalFlights];

    return allFlights
      .map((flight) => {
        let availableSeats: number;
        let fare: number;

        switch (cabinClass) {
          case CabinClass.ECONOMY:
            availableSeats = flight.available_economy_seats;
            fare = Number(flight.economy_fare);
            break;
          case CabinClass.BUSINESS:
            availableSeats = flight.available_business_seats;
            fare = Number(flight.business_fare);
            break;
          case CabinClass.FIRST:
            availableSeats = flight.available_first_seats;
            fare = Number(flight.first_fare);
            break;
        }

        if (availableSeats < passengers) {
          return null;
        }

        const departDateTime = this.combineDateAndTime(
          date,
          flight.depart_time,
        );
        const arrivalDateTime = this.calculateArrivalDate(
          departDateTime,
          flight.duration,
          flight.arrival_weekday - flight.depart_weekday,
        );

        return {
          index: 'id' in flight ? flight.id : flight.index,
          origin: flight.origin,
          destination: flight.destination,
          departTime: this.formatTimeOnly(departDateTime),
          departDate: departDateTime.toISOString(),
          arrivalTime: this.formatTimeOnly(arrivalDateTime),
          arrivalDate: arrivalDateTime.toISOString(),
          duration: flight.duration,
          airline: flight.airline,
          flightNo: flight.flight_no,
          availableSeats,
          fare: fare * passengers,
        } as FlightSearchResponseDto;
      })
      .filter((flight): flight is FlightSearchResponseDto => flight !== null);
  }

  private combineDateAndTime(date: Date, time: Date): Date {
    // Create new date object from search date
    const combined = new Date(date);
    // Set time components
    combined.setUTCHours(time.getUTCHours());
    combined.setUTCHours(time.getUTCHours());
    combined.setUTCMinutes(time.getUTCHours());
    combined.setUTCSeconds(0);
    combined.setUTCMilliseconds(0);
    return combined;
  }

  private calculateArrivalDate(
    departDate: Date,
    duration: number,
    daysDiff: number,
  ): Date {
    // Create new date object to avoid modifying original
    const arrivalDate = new Date(departDate);

    // Add duration in minutes
    arrivalDate.setMinutes(arrivalDate.getMinutes() + duration);

    // Only add days difference if the arrival time hasn't already crossed to next day
    // Check if adding duration already pushed us to next day
    const crossedMidnight = arrivalDate.getDate() !== departDate.getDate();
    if (!crossedMidnight && daysDiff > 0) {
      arrivalDate.setDate(arrivalDate.getDate() + daysDiff);
    }

    return arrivalDate;
  }
}
