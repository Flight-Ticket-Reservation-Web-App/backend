import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
  ) {}

  findAll(): Promise<Booking[]> {
    return this.bookingRepository.find({ relations: ['user', 'flight'] });
  }

  findOne(id: number): Promise<Booking> {
    return this.bookingRepository.findOne({
      where: { id },
      relations: ['user', 'flight'],
    });
  }

  create(booking: Booking): Promise<Booking> {
    return this.bookingRepository.save(booking);
  }

  update(id: number, booking: Booking): Promise<any> {
    return this.bookingRepository.update(id, booking);
  }

  delete(id: number): Promise<any> {
    return this.bookingRepository.delete(id);
  }
}
