import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Flight } from './entities/flight.entity';

@Injectable()
export class FlightService {
  constructor(
    @InjectRepository(Flight)
    private readonly flightRepository: Repository<Flight>,
  ) {}

  findAll(): Promise<Flight[]> {
    return this.flightRepository.find();
  }

  findOne(id: number): Promise<Flight> {
    return this.flightRepository.findOne({ where: { id } });
  }

  create(flight: Flight): Promise<Flight> {
    return this.flightRepository.save(flight);
  }

  update(id: number, flight: Flight): Promise<any> {
    return this.flightRepository.update(id, flight);
  }

  delete(id: number): Promise<any> {
    return this.flightRepository.delete(id);
  }
}
