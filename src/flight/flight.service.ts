import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
}
