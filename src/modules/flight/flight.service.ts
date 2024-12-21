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
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class FlightService {
  constructor(
    private prisma: PrismaService,
    private mailerService: MailerService,
  ) {}

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

      if (returnTimestamp < departTimestamp) {
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

  async updateFlightDelay(flightId: string, delayDuration: number) {
    const prefix = flightId.charAt(0).toUpperCase();
    const numericId = flightId.slice(1);
    let flight;

    // Update flight delay
    if (prefix === 'D') {
      flight = await this.prisma.domestic_flights.update({
        where: { id: `D${numericId}` },
        data: { delay_duration: delayDuration },
      });
    } else if (prefix === 'I') {
      flight = await this.prisma.international_flights.update({
        where: { id: `I${numericId}` },
        data: { delay_duration: delayDuration },
      });
    } else {
      throw new BadRequestException('Invalid flight ID format');
    }

    // Find affected active bookings and notify users
    const now = new Date();
    const affectedBookings = await this.prisma.bookings.findMany({
      where: {
        status: 'CONFIRMED', // Only get active bookings
        booking_flights: {
          some: {
            flight_id: flightId,
            flight_date: {
              gt: now, // Only future flights
            },
          },
        },
      },
      include: {
        user: true,
        booking_flights: {
          where: {
            flight_id: flightId,
          },
        },
      },
    });

    // Send notifications
    for (const booking of affectedBookings) {
      try {
        const flightDate = booking.booking_flights[0].flight_date;
        const formattedDate = new Date(flightDate).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'UTC',
        });

        await this.mailerService.sendMail({
          to: booking.user.email,
          subject: 'Flight Delay Notification',
          template: './flight-delay',
          context: {
            bookingNumber: booking.booking_number,
            flightId: flightId,
            flightDate: formattedDate,
            delayDuration: delayDuration,
          },
        });
      } catch (err) {
        console.error(
          `Failed to send delay notification for booking ${booking.booking_number}:`,
          err,
        );
      }
    }

    return flight;
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
          airline: flight.airlines?.airline_name || 'Unknown Airline', // Access airline_name from the airlines relation
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
              airlines: true, // Assuming airlines is a string for domestic flights
              origin: true,
              destination: true,
              depart_time: true,
              arrival_time: true,
            },
          });
        } else if (flight.flight_type === 'INTERNATIONAL') {
          const internationalFlightDetails =
            await this.prisma.international_flights.findUnique({
              where: { id: flight.flight_id },
              select: {
                flight_no: true,
                origin: true,
                destination: true,
                depart_time: true,
                arrival_time: true,
                airlines: {
                  select: {
                    airline_name: true, // Retrieve the airline_name
                  },
                },
              },
            });

          if (internationalFlightDetails) {
            const { airlines, ...rest } = internationalFlightDetails; // Destructure airlines
            flightDetails = {
              ...rest,
              airline: airlines?.airline_name, // Extract only airline_name
            };
          }
        }

        if (!flightDetails) return null;

        const totalPassengers = flight.booking.booking_passengers.length;

        // Prepare the final flight details with only the airline_name
        return {
          ...flightDetails,
          airline: flightDetails.airline, // Include only the airline_name here
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
        departure: this.formatTimeOnly(flight.depart_time),
        arrival: this.formatTimeOnly(flight.arrival_time),
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
        departure: this.formatTimeOnly(flight.depart_time),
        arrival: this.formatTimeOnly(flight.arrival_time),
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
        departTime: this.formatTimeOnly(domesticFlight.depart_time),
        arrivalTime: this.formatTimeOnly(domesticFlight.arrival_time),
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
        departTime: this.formatTimeOnly(internationalFlight.depart_time),
        arrivalTime: this.formatTimeOnly(internationalFlight.arrival_time),
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
      await this.validateAirportCode(origin, 'origin');
    }

    // Validate destination if provided
    if (destination) {
      await this.validateAirportCode(destination, 'destination');
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

  async validateAirportCode(
    code: string,
    type: 'origin' | 'destination',
  ): Promise<void> {
    const airportExists = await this.prisma.airports.findUnique({
      where: { code },
    });

    if (!airportExists) {
      throw new BadRequestException(`${type} code '${code}' is not valid.`);
    }
  }

  async createFlight(createFlightDto: CreateFlightDto): Promise<any> {
    const { aircode, flightNoSuffix, origin, destination } = createFlightDto;

    // Validate origin and destination
    await this.validateAirportCode(origin, 'origin');
    await this.validateAirportCode(destination, 'destination');

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
        departureTime,
        arrivalTime,
        ...flightData
      } = createFlightDto;
      return this.prisma.domestic_flights.create({
        data: {
          flight_no: flightNo,
          depart_time: new Date(departureTime),
          arrival_time: new Date(arrivalTime),
          depart_weekday: new Date(departureTime).getDay(),
          arrival_weekday: new Date(arrivalTime).getDay(),
          duration: Math.round(
            (new Date(arrivalTime).getTime() -
              new Date(departureTime).getTime()) /
              60000,
          ),
          origin: origin,
          destination: destination,
          economy_fare: new Prisma.Decimal(flightData.economyFare),
          business_fare: new Prisma.Decimal(flightData.businessFare),
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
        departureTime,
        arrivalTime,
        economyFare,
        businessFare,
        ...flightData
      } = createFlightDto;
      return this.prisma.international_flights.create({
        data: {
          flight_no: flightNo,
          depart_time: new Date(departureTime),
          arrival_time: new Date(arrivalTime),
          depart_weekday: new Date(departureTime).getDay(),
          arrival_weekday: new Date(arrivalTime).getDay(),
          duration: Math.round(
            (new Date(arrivalTime).getTime() -
              new Date(departureTime).getTime()) /
              60000,
          ),
          economy_fare: new Prisma.Decimal(economyFare),
          business_fare: new Prisma.Decimal(businessFare),
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

  // async validateAircodeAndAirports(
  //   origin: string,
  //   destination: string,
  // ): Promise<void> {
  //   // Check if origin and destination codes exist in the airports table
  //   const [originExists, destinationExists] = await Promise.all([
  //     this.prisma.airports.findUnique({ where: { code: origin } }),
  //     this.prisma.airports.findUnique({ where: { code: destination } }),
  //   ]);

  //   if (!originExists) {
  //     throw new BadRequestException(`Origin code '${origin}' is not valid.`);
  //   }

  //   if (!destinationExists) {
  //     throw new BadRequestException(
  //       `Destination code '${destination}' is not valid.`,
  //     );
  //   }
  // }
}
