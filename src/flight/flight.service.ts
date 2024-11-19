import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { SearchFlightDto, TripType, CabinClass } from './dto/search-flight.dto';
import { FlightSearchResponseDto } from './dto/flight-search-response.dto';
import { DomesticFlight } from './entities/domestic-flights.entity';
import { InternationalFlight } from './entities/international-flights.entity';

@Injectable()
export class FlightService {
  constructor(
    @InjectRepository(DomesticFlight)
    private readonly domesticFlightRepository: Repository<DomesticFlight>,
    @InjectRepository(InternationalFlight)
    private readonly internationalFlightRepository: Repository<InternationalFlight>,
  ) {}

  // Domestic Flights
  findAllDomestic(): Promise<DomesticFlight[]> {
    return this.domesticFlightRepository.find();
  }

  findOneDomestic(id: number): Promise<DomesticFlight> {
    return this.domesticFlightRepository.findOne({ where: { id } });
  }

  createDomestic(flight: DomesticFlight): Promise<DomesticFlight> {
    return this.domesticFlightRepository.save(flight);
  }

  updateDomestic(id: number, flight: DomesticFlight): Promise<any> {
    return this.domesticFlightRepository.update(id, flight);
  }

  deleteDomestic(id: number): Promise<any> {
    return this.domesticFlightRepository.delete(id);
  }

  // International Flights
  findAllInternational(): Promise<InternationalFlight[]> {
    return this.internationalFlightRepository.find();
  }

  findOneInternational(index: number): Promise<InternationalFlight> {
    return this.internationalFlightRepository.findOne({ where: { index } });
  }

  createInternational(
    flight: InternationalFlight,
  ): Promise<InternationalFlight> {
    return this.internationalFlightRepository.save(flight);
  }

  updateInternational(
    index: number,
    flight: InternationalFlight,
  ): Promise<any> {
    return this.internationalFlightRepository.update(index, flight);
  }

  deleteInternational(index: number): Promise<any> {
    return this.internationalFlightRepository.delete(index);
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

    // Validate dates for round trips
    if (tripType === TripType.ROUND_TRIP) {
        if (!returnDate) {
            throw new BadRequestException('Return date is required for round trips');
        }
        
        // Convert dates to timestamps for comparison
        const departTimestamp = new Date(departDate).getTime();
        const returnTimestamp = new Date(returnDate).getTime();
        
        if (returnTimestamp <= departTimestamp) {
            throw new BadRequestException('Return date must be after departure date');
        }
    }

    // Get outbound flights
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

    // Get return flights
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
    const weekday = date.getDay();

    // Search in both domestic and international repositories
    const [domesticFlights, internationalFlights] = await Promise.all([
      this.domesticFlightRepository.find({
        where: {
          origin,
          destination,
          depart_weekday: weekday,
        },
      }),
      this.internationalFlightRepository.find({
        where: {
          origin,
          destination,
          depart_weekday: weekday,
        },
      }),
    ]);

    const allFlights = [...domesticFlights, ...internationalFlights];

    return allFlights.map(flight => {
      let availableSeats: number;
      let fare: number;

      switch (cabinClass) {
        case CabinClass.ECONOMY:
          availableSeats = flight.economy_seats;
          fare = flight.economy_fare;
          break;
        case CabinClass.BUSINESS:
          availableSeats = flight.business_seats;
          fare = flight.business_fare;
          break;
        case CabinClass.FIRST:
          availableSeats = flight.first_seats;
          fare = flight.first_fare;
          break;
      }

      if (availableSeats < passengers) {
        return null;
      }

      const departDateTime = this.combineDateAndTime(date, flight.depart_time);
      const arrivalDateTime = this.calculateArrivalDate(
        departDateTime,
        flight.duration,
        flight.arrival_weekday - flight.depart_weekday,
      );

      return {
        index: this.isDomesticFlight(flight) ? flight.id : flight.index,
        origin: flight.origin,
        destination: flight.destination,
        departTime: flight.depart_time,
        departDate: departDateTime,
        arrivalTime: flight.arrival_time,
        arrivalDate: arrivalDateTime,
        duration: flight.duration,
        airline: flight.airline,
        flightNo: flight.flight_no,
        availableSeats,
        fare: fare * passengers,
      };
    }).filter(flight => flight !== null);
  }

  private combineDateAndTime(date: Date, time: string): Date {
    const [hours, minutes] = time.split(':');
    const combined = new Date(date);
    combined.setHours(parseInt(hours, 10));
    combined.setMinutes(parseInt(minutes, 10));
    return combined;
  }

  private calculateArrivalDate(
    departDate: Date,
    duration: number,
    daysDiff: number,
  ): Date {
    const arrivalDate = new Date(departDate);
    arrivalDate.setMinutes(arrivalDate.getMinutes() + duration);
    arrivalDate.setDate(arrivalDate.getDate() + daysDiff);
    return arrivalDate;
  }

  // Add this helper function in flight.service.ts
  private isDomesticFlight(flight: DomesticFlight | InternationalFlight): flight is DomesticFlight {
    return 'id' in flight;
  }
}
