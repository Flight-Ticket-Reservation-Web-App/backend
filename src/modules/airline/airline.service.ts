import { Injectable } from '@nestjs/common';
import { CreateAirlineDto } from './dto/create-airline.dto';
import { UpdateAirlineDto } from './dto/update-airline.dto';

@Injectable()
export class AirlineService {
  create(createAirlineDto: CreateAirlineDto) {
    return 'This action adds a new airline';
  }

  findAll() {
    return `This action returns all airline`;
  }

  findOne(id: number) {
    return `This action returns a #${id} airline`;
  }

  update(id: number, updateAirlineDto: UpdateAirlineDto) {
    return `This action updates a #${id} airline`;
  }

  remove(id: number) {
    return `This action removes a #${id} airline`;
  }
}
