import { Injectable } from '@nestjs/common';
import { CreateAirportDto } from './dto/create-airport.dto';
import { UpdateAirportDto } from './dto/update-airport.dto';

@Injectable()
export class AirportService {
  create(createAirportDto: CreateAirportDto) {
    return 'This action adds a new airport';
  }

  findAll() {
    return `This action returns all airport`;
  }

  findOne(id: number) {
    return `This action returns a #${id} airport`;
  }

  update(id: number, updateAirportDto: UpdateAirportDto) {
    return `This action updates a #${id} airport`;
  }

  remove(id: number) {
    return `This action removes a #${id} airport`;
  }
}
