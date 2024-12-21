/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { UpdateFlightDto } from './dto/update-flight.dto';
import { CreateFlightDto } from './dto/create-flight.dto';
import {
  calculateArrivalDate,
  combineDateAndTime,
  formatTimeOnly,
  validateAirportCode,
} from '@/utils/helper';
@Injectable()
export class FlightService {
  constructor(private readonly prisma: PrismaService) {}

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

  private async searchOneWayFlights(
    origin: string,
    destination: string,
    date: Date,
    passengers: number,
    cabinClass: CabinClass,
  ): Promise<FlightSearchResponseDto[]> {
    const weekday = date.getDay() === 0 ? 6 : date.getDay() - 1;

    // Fetch domestic and international flights with airline information
    const [domesticFlights, internationalFlights] = await Promise.all([
      this.prisma.domestic_flights.findMany({
        where: {
          origin,
          destination,
          depart_weekday: weekday,
        },
        include: {
          airlines: true, // Include airline details
        },
      }),
      this.prisma.international_flights.findMany({
        where: {
          origin,
          destination,
          depart_weekday: weekday,
        },
        include: {
          airlines: true, // Include airline details
        },
      }),
    ]);

    // Combine flights into a single array with type annotations
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

        // Skip if no seats available for the selected class
        if (availableSeats < passengers) {
          return null;
        }

        const economyFare = Number(flight.economy_fare);
        const businessFare = Number(flight.business_fare);

        // Skip if both fares are 0
        if (economyFare === 0 && businessFare === 0) {
          return null;
        }

        const departDateTime = combineDateAndTime(date, flight.depart_time);
        const arrivalDateTime = calculateArrivalDate(
          departDateTime,
          flight.duration,
          flight.arrival_weekday - flight.depart_weekday,
        );

        return {
          index: flight.id,
          origin: flight.origin,
          destination: flight.destination,
          departTime: formatTimeOnly(departDateTime),
          departDate: departDateTime.toISOString(),
          arrivalTime: formatTimeOnly(arrivalDateTime),
          arrivalDate: arrivalDateTime.toISOString(),
          duration: flight.duration,
          airline: flight.airlines?.airline_name || 'Unknown Airline', // Access airline_name from the airlines relation
          flightNo: flight.flight_no,
          availableSeats,
          economyFare: economyFare,
          businessFare: businessFare || null,
        } as FlightSearchResponseDto;
      })
      .filter((flight): flight is FlightSearchResponseDto => flight !== null);
  }

  async getBookings(paginationDto: PaginationDto) {
    const {
      search,
      page = 1,
      limit = 25,
      sortBy = 'flight_date',
      sortOrder = 'asc',
    } = paginationDto;

    const sortField = sortBy;
    const sortDirection = sortOrder === 'desc' ? 'desc' : 'asc';

    // Build the `where` clause
    const where: Prisma.booking_flightsWhereInput = search
      ? {
          OR: [
            {
              flight_type: 'DOMESTIC',
              flight_id: {
                in: await this.getFlightIdsBySearch('domestic_flights', search),
              },
            },
            {
              flight_type: 'INTERNATIONAL',
              flight_id: {
                in: await this.getFlightIdsBySearch(
                  'international_flights',
                  search,
                ),
              },
            },
            {
              booking: {
                booking_passengers: {
                  some: {
                    first_name: { contains: search, mode: 'insensitive' },
                  },
                },
              },
            },
          ],
        }
      : undefined;

    // Fetch all booking flights (unsorted) for enrichment
    const allBookingFlights = await this.prisma.booking_flights.findMany({
      where,
      include: {
        booking: {
          select: {
            id: true,
            booking_passengers: true,
          },
        },
      },
    });

    const enrichedFlights = await Promise.all(
      allBookingFlights.map(async (flight) => {
        let flightDetails;

        if (flight.flight_type === 'DOMESTIC') {
          flightDetails = await this.prisma.domestic_flights.findUnique({
            where: { id: flight.flight_id },
            select: {
              flight_no: true,
              airlines: {
                select: {
                  airline_name: true,
                  aircode: true,
                },
              },
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
              airlines: {
                select: {
                  airline_name: true,
                  aircode: true,
                },
              },
              origin: true,
              destination: true,
              depart_time: true,
              arrival_time: true,
            },
          });
        }

        if (!flightDetails) return null;

        const totalPassengers = flight.booking.booking_passengers.length;

        // Flatten airlines data
        const { airlines, ...flightData } = flightDetails;

        return {
          ...flightData,
          airline: airlines?.airline_name || 'Unknown Airline',
          aircode: airlines?.aircode || 'N/A',
          route: `${flightDetails.origin} - ${flightDetails.destination}`,
          departure: dayjs(flightDetails.depart_time).format('hh:mm A'),
          arrival: dayjs(flightDetails.arrival_time).format('hh:mm A'),
          date: dayjs(flight.flight_date).format('DD-MM-YY'),
          totalPassengers,
        };
      }),
    );

    // Filter out null results
    const validFlights = enrichedFlights.filter((flight) => flight !== null);

    // Perform sorting on the entire dataset
    const sortedFlights = validFlights.sort((a: any, b: any) => {
      const fieldA = a[sortField];
      const fieldB = b[sortField];
      if (fieldA < fieldB) return sortDirection === 'asc' ? -1 : 1;
      if (fieldA > fieldB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    // Paginate sorted results
    const paginatedFlights = sortedFlights.slice(
      (page - 1) * limit,
      page * limit,
    );

    // Count the total records
    const totalRecords = validFlights.length;

    return {
      data: paginatedFlights,
      meta: {
        currentPage: page,
        total: totalRecords,
        limit,
        totalPages: Math.ceil(totalRecords / limit),
      },
    };
  }

  private async getFlightIdsBySearch(
    flightType: 'domestic_flights' | 'international_flights',
    search: string,
  ): Promise<string[]> {
    const flights = await (flightType === 'domestic_flights'
      ? this.prisma.domestic_flights.findMany({
          where: {
            OR: [
              { flight_no: { contains: search, mode: 'insensitive' } },
              {
                airlines: {
                  airline_name: { contains: search, mode: 'insensitive' },
                },
              },
              { origin: { contains: search, mode: 'insensitive' } },
              { destination: { contains: search, mode: 'insensitive' } },
            ],
          },
          select: { id: true },
        })
      : this.prisma.international_flights.findMany({
          where: {
            OR: [
              { flight_no: { contains: search, mode: 'insensitive' } },
              {
                airlines: {
                  airline_name: { contains: search, mode: 'insensitive' },
                },
              },
              { origin: { contains: search, mode: 'insensitive' } },
              { destination: { contains: search, mode: 'insensitive' } },
            ],
          },
          select: { id: true },
        }));

    return flights.map((flight) => flight.id);
  }

  async getAllFlights(queryParams: PaginationDto) {
    const {
      page = 1,
      limit = 20,
      search,
      sortBy = 'depart_time',
      sortOrder = 'asc',
    } = queryParams;

    const defaultWeekday = new Date().getDay(); // Default to today's weekday

    // Query options for domestic flights
    const queryOptionsDomestic = buildQueryOptions<
      Prisma.domestic_flightsWhereInput,
      Prisma.domestic_flightsOrderByWithRelationInput
    >(
      { page, limit, search, sortBy, sortOrder },
      ['flight_no', 'origin', 'destination'], // Searchable fields
    );
    queryOptionsDomestic.where = {
      ...queryOptionsDomestic.where,
      depart_weekday: defaultWeekday,
    };

    // Query options for international flights
    const queryOptionsInternational = buildQueryOptions<
      Prisma.international_flightsWhereInput,
      Prisma.international_flightsOrderByWithRelationInput
    >(
      { page, limit, search, sortBy, sortOrder },
      ['flight_no', 'origin', 'destination'], // Searchable fields
    );
    queryOptionsInternational.where = {
      ...queryOptionsInternational.where,
      depart_weekday: defaultWeekday,
    };

    // Fetch domestic flights with airline data by joining on aircode
    const domesticFlights = await this.prisma.domestic_flights.findMany({
      where: queryOptionsDomestic.where,
      orderBy: queryOptionsDomestic.orderBy,
      include: {
        airlines: {
          select: {
            airline_name: true,
            aircode: true,
          },
        },
      },
    });

    // Fetch international flights with airline data by joining on aircode
    const internationalFlights =
      await this.prisma.international_flights.findMany({
        where: queryOptionsInternational.where,
        orderBy: queryOptionsInternational.orderBy,
        include: {
          airlines: {
            select: {
              airline_name: true,
              aircode: true,
            },
          },
        },
      });

    // Combine and format flight data
    const combinedFlights = [
      ...domesticFlights.map((flight) => ({
        type: 'DOMESTIC',
        airline: flight.airlines?.airline_name || 'Unknown Airline', // Fallback if no airline match
        airlineCode: flight.airlines?.aircode || 'Unknown Code',
        flightNo: flight.flight_no,
        departure: formatTimeOnly(flight.depart_time),
        arrival: formatTimeOnly(flight.arrival_time),
        duration: `${Math.floor(flight.duration / 60)}h ${flight.duration % 60}m`,
        origin: flight.origin,
        destination: flight.destination,
        price: flight.economy_fare.toNumber(),
      })),
      ...internationalFlights.map((flight) => ({
        type: 'INTERNATIONAL',
        airline: flight.airlines?.airline_name || 'Unknown Airline', // Fallback if no airline match
        airlineCode: flight.airlines?.aircode || 'Unknown Code',
        flightNo: flight.flight_no,
        departure: formatTimeOnly(flight.depart_time),
        arrival: formatTimeOnly(flight.arrival_time),
        duration: `${Math.floor(flight.duration / 60)}h ${flight.duration % 60}m`,
        origin: flight.origin,
        destination: flight.destination,
        price: flight.economy_fare.toNumber(),
      })),
    ];

    // Apply pagination
    const totalFlights = combinedFlights.length;
    const skip = (page - 1) * limit;
    const paginatedFlights = combinedFlights.slice(skip, skip + limit);

    return {
      data: paginatedFlights,
      meta: {
        currentPage: page,
        total: totalFlights,
        limit,
        totalPages: Math.ceil(totalFlights / limit),
      },
    };
  }

  async getFlightDetails(flightNo: string): Promise<any> {
    // Find flight in domestic flights
    const domesticFlight = await this.prisma.domestic_flights.findFirst({
      where: { flight_no: flightNo },
      include: {
        airlines: true, // Include airline details
      },
    });

    // If found in domestic flights, return it
    if (domesticFlight) {
      return {
        type: 'DOMESTIC',
        airline: domesticFlight.airlines?.airline_name || 'Unknown Airline',
        flightNo: domesticFlight.flight_no,
        origin: domesticFlight.origin,
        destination: domesticFlight.destination,
        departTime: formatTimeOnly(domesticFlight.depart_time),
        arrivalTime: formatTimeOnly(domesticFlight.arrival_time),
        duration: `${Math.floor(domesticFlight.duration / 60)}h ${domesticFlight.duration % 60}m`,
        economyFare: domesticFlight.economy_fare.toNumber(),
        businessFare: domesticFlight.business_fare.toNumber(),
        status: domesticFlight.status || 'Unknown',
      };
    }

    // Find flight in international flights
    const internationalFlight =
      await this.prisma.international_flights.findFirst({
        where: { flight_no: flightNo },
        include: {
          airlines: true, // Include airline details
        },
      });

    // If found in international flights, return it
    if (internationalFlight) {
      return {
        type: 'INTERNATIONAL',
        airline:
          internationalFlight.airlines?.airline_name || 'Unknown Airline',
        flightNo: internationalFlight.flight_no,
        origin: internationalFlight.origin,
        destination: internationalFlight.destination,
        departTime: formatTimeOnly(internationalFlight.depart_time),
        arrivalTime: formatTimeOnly(internationalFlight.arrival_time),
        duration: `${Math.floor(internationalFlight.duration / 60)}h ${internationalFlight.duration % 60}m`,
        economyFare: internationalFlight.economy_fare.toNumber(),
        businessFare: internationalFlight.business_fare.toNumber(),
        status: internationalFlight.status || 'Unknown',
      };
    }

    // If not found in either, throw an exception
    throw new BadRequestException(`Flight with flightNo ${flightNo} not found`);
  }

  async updateFlight(
    flightNo: string,
    updateFlightDto: UpdateFlightDto,
  ): Promise<any> {
    const { aircode, flightNoSuffix, origin, destination } = updateFlightDto;

    // Validate origin if provided
    if (origin) {
      await validateAirportCode(origin, 'origin');
    }

    // Validate destination if provided
    if (destination) {
      await validateAirportCode(destination, 'destination');
    }

    // Derive the new flight number if aircode or flightNoSuffix is provided
    let newFlightNo = flightNo;
    if (aircode || flightNoSuffix) {
      const updatedAircode = aircode || flightNo.slice(0, 2); // Default to the current flightNo prefix
      const updatedSuffix = flightNoSuffix || flightNo.slice(2); // Default to the current flightNo suffix
      newFlightNo = `${updatedAircode}${updatedSuffix}`;

      // Validate unique flight number if it differs from the current one
      if (newFlightNo !== flightNo) {
        await this.validateUniqueFlightNo(newFlightNo);
      }
    }

    // Update domestic or international flight
    const domesticFlight = await this.prisma.domestic_flights.findFirst({
      where: { flight_no: flightNo },
    });

    if (domesticFlight) {
      return this.prisma.domestic_flights.update({
        where: { id: domesticFlight.id },
        data: { ...updateFlightDto, flight_no: newFlightNo },
      });
    }

    const internationalFlight =
      await this.prisma.international_flights.findFirst({
        where: { flight_no: flightNo },
      });

    if (internationalFlight) {
      return this.prisma.international_flights.update({
        where: { id: internationalFlight.id },
        data: { ...updateFlightDto, flight_no: newFlightNo },
      });
    }

    throw new BadRequestException(
      `Flight with flightNo '${flightNo}' not found.`,
    );
  }

  async createFlight(createFlightDto: CreateFlightDto): Promise<any> {
    const { aircode, flightNoSuffix, origin, destination } = createFlightDto;

    // Validate origin and destination
    await validateAirportCode(origin, 'origin');
    await validateAirportCode(destination, 'destination');

    // Derive flightNo from aircode and flightNoSuffix
    const flightNo = `${aircode}${flightNoSuffix}`;

    // Validate unique flight number
    await this.validateUniqueFlightNo(flightNo);

    // Get origin and destination airports
    const originAirport = await this.prisma.airports.findUnique({
      where: { code: origin },
    });
    const destinationAirport = await this.prisma.airports.findUnique({
      where: { code: destination },
    });

    // Check if both airports are in the same country
    const isDomestic = originAirport?.country === destinationAirport?.country;

    if (isDomestic) {
      const {
        aircode,
        flightNoSuffix,
        departure_time,
        arrival_time,
        ...flightData
      } = createFlightDto;
      return this.prisma.domestic_flights.create({
        data: {
          flight_no: flightNo,
          depart_time: new Date(departure_time),
          arrival_time: new Date(arrival_time),
          depart_weekday: new Date(departure_time).getDay(),
          arrival_weekday: new Date(arrival_time).getDay(),
          duration: Math.round(
            (new Date(arrival_time).getTime() -
              new Date(departure_time).getTime()) /
              60000,
          ),
          origin: origin,
          destination: destination,
          economy_fare: new Prisma.Decimal(flightData.economy_fare),
          business_fare: new Prisma.Decimal(flightData.business_fare),
          first_fare: new Prisma.Decimal(0),
          economy_seats: 180,
          business_seats: 20,
          first_seats: 0,
          available_economy_seats: 180,
          available_business_seats: 20,
          available_first_seats: 0,
          status: 'SCHEDULED',
          airlines: {
            connect: {
              aircode: aircode,
            },
          },
        },
      });
    } else {
      const {
        aircode,
        flightNoSuffix,
        departure_time,
        arrival_time,
        economy_fare,
        business_fare,
        ...flightData
      } = createFlightDto;
      return this.prisma.international_flights.create({
        data: {
          flight_no: flightNo,
          depart_time: new Date(departure_time),
          arrival_time: new Date(arrival_time),
          depart_weekday: new Date(departure_time).getDay(),
          arrival_weekday: new Date(arrival_time).getDay(),
          duration: Math.round(
            (new Date(arrival_time).getTime() -
              new Date(departure_time).getTime()) /
              60000,
          ),
          economy_fare: new Prisma.Decimal(economy_fare),
          business_fare: new Prisma.Decimal(business_fare),
          first_fare: new Prisma.Decimal(0),
          economy_seats: 180,
          business_seats: 20,
          first_seats: 0,
          available_economy_seats: 180,
          available_business_seats: 20,
          available_first_seats: 0,
          ...flightData,
          airlines: {
            connect: {
              aircode: aircode,
            },
          },
        },
      });
    }
  }
  async validateUniqueFlightNo(flightNo: string): Promise<void> {
    const existingFlight =
      (await this.prisma.domestic_flights.findFirst({
        where: { flight_no: flightNo },
      })) ||
      (await this.prisma.international_flights.findFirst({
        where: { flight_no: flightNo },
      }));

    if (existingFlight) {
      throw new BadRequestException(
        `Flight number '${flightNo}' already exists.`,
      );
    }
  }
}
