import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { SearchFlightDto } from '@/modules/flight/dto/search-flight.dto';
import { FlightSearchResponseDto } from '@/modules/flight/dto/flight-search-response.dto';
import {
  domestic_flights,
  international_flights,
  Prisma,
} from '@prisma/client';
import { CabinClass, TripType } from '@/common/enums';
import dayjs from 'dayjs';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { buildQueryOptions } from '@/utils/query';
@Injectable()
export class FlightService {
  constructor(private readonly prisma: PrismaService) {}

  // Domestic Flights
  async findAllDomestic(): Promise<domestic_flights[]> {
    return this.prisma.domestic_flights.findMany();
  }

  async findOneDomestic(id: string): Promise<domestic_flights> {
    return this.prisma.domestic_flights.findUnique({ where: { id } });
  }

  async createDomestic(flight: domestic_flights): Promise<domestic_flights> {
    return this.prisma.domestic_flights.create({ data: flight });
  }

  async updateDomestic(
    id: string,
    flight: domestic_flights,
  ): Promise<domestic_flights> {
    return this.prisma.domestic_flights.update({
      where: { id },
      data: flight,
    });
  }

  async deleteDomestic(id: string): Promise<domestic_flights> {
    return this.prisma.domestic_flights.delete({ where: { id } });
  }

  // International Flights
  async findAllInternational(): Promise<international_flights[]> {
    return this.prisma.international_flights.findMany();
  }

  async findOneInternational(id: string): Promise<international_flights> {
    return this.prisma.international_flights.findUnique({ where: { id } });
  }

  async createInternational(
    flight: international_flights,
  ): Promise<international_flights> {
    return this.prisma.international_flights.create({ data: flight });
  }

  async updateInternational(
    id: string,
    flight: international_flights,
  ): Promise<international_flights> {
    return this.prisma.international_flights.update({
      where: { id },
      data: flight,
    });
  }

  async deleteInternational(id: string): Promise<international_flights> {
    return this.prisma.international_flights.delete({ where: { id } });
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
    const weekday = date.getDay() === 0 ? 6 : date.getDay() - 1;

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

    const allFlights = [
      ...domesticFlights.map((f) => ({ ...f, type: 'DOMESTIC' })),
      ...internationalFlights.map((f) => ({ ...f, type: 'INTERNATIONAL' })),
    ];

    return allFlights
      .map((flight) => {
        // Get available seats based on selected cabin class
        let availableSeats: number;
        switch (cabinClass) {
          case CabinClass.ECONOMY:
            availableSeats = flight.available_economy_seats;
            break;
          case CabinClass.BUSINESS:
            availableSeats = flight.available_business_seats;
            break;
          default:
            availableSeats = flight.available_economy_seats;
        }

        // Skip if no seats available for selected class
        if (availableSeats < passengers) {
          return null;
        }

        const economyFare = Number(flight.economy_fare);
        const businessFare = Number(flight.business_fare);

        // Skip if both fares are 0
        if (economyFare === 0 && businessFare === 0) {
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
          index: flight.id,
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
          economyFare: economyFare,
          businessFare: businessFare || null,
        } as FlightSearchResponseDto;
      })
      .filter((flight): flight is FlightSearchResponseDto => flight !== null);
  }

  private combineDateAndTime(date: Date, time: Date): Date {
    const combined = new Date(date);
    combined.setUTCHours(time.getUTCHours());
    combined.setUTCMinutes(time.getUTCMinutes()); // Fix: Was using hours instead of minutes
    combined.setUTCSeconds(0);
    combined.setUTCMilliseconds(0);
    return combined;
  }

  private calculateArrivalDate(
    departDate: Date,
    duration: number,
    daysDiff: number,
  ): Date {
    const arrivalDate = new Date(departDate);
    arrivalDate.setMinutes(arrivalDate.getMinutes() + duration);
    return arrivalDate;
  }

  async getBookings(paginationDto: PaginationDto) {
    // Define searchable fields for the `search` parameter
    const searchFields = [
      'flight_no',
      'airline',
      'origin',
      'destination',
      'booking.booking_passengers.first_name', // Adjust as needed for passengers
    ];

    // Build query options
    const { where, orderBy, skip, take } = buildQueryOptions<
      Prisma.booking_flightsWhereInput,
      Prisma.booking_flightsOrderByWithRelationInput
    >(paginationDto, searchFields);

    // Fetch booking flights with the built query options
    const bookingFlights = await this.prisma.booking_flights.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        booking: {
          select: {
            id: true,
            booking_passengers: true, // Fetch passengers for total count
          },
        },
      },
    });

    const enrichedFlights = await Promise.all(
      bookingFlights.map(async (flight) => {
        let flightDetails;

        // Fetch flight details from domestic or international table
        if (flight.flight_type === 'DOMESTIC') {
          flightDetails = await this.prisma.domestic_flights.findUnique({
            where: { id: flight.flight_id },
            select: {
              flight_no: true,
              airline: true,
              origin: true,
              destination: true,
              depart_time: true,
              arrival_time: true,
            },
          });
        } else if (flight.flight_type === 'INTERNATIONAL') {
          flightDetails = await this.prisma.international_flights.findUnique({
            where: { id: flight.flight_id },
            select: {
              flight_no: true,
              airline: true,
              origin: true,
              destination: true,
              depart_time: true,
              arrival_time: true,
            },
          });
        }

        if (!flightDetails) {
          return null; // Handle missing flight details gracefully
        }

        // Calculate total passengers for this flight
        const totalPassengers = flight.booking.booking_passengers.length;

        // Format time for departure and arrival in 12-hour format with AM/PM
        const departure = dayjs(flightDetails.depart_time).format('hh:mm A');
        const arrival = dayjs(flightDetails.arrival_time).format('hh:mm A');

        // Format date as dd-mm-yy
        const date = dayjs(flight.flight_date).format('DD-MM-YY');

        return {
          flight_no: flightDetails.flight_no,
          airline: flightDetails.airline,
          route: `${flightDetails.origin} - ${flightDetails.destination}`,
          departure,
          arrival,
          date,
          totalPassengers,
        };
      }),
    );

    return {
      data: enrichedFlights.filter((flight) => flight !== null), // Exclude null results
      meta: {
        currentPage: paginationDto.page,
        total: await this.prisma.booking_flights.count({ where }),
        limit: paginationDto.limit,
      },
    };
  }
}
