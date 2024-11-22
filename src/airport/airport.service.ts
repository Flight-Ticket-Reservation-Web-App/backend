import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAirportDto } from './dto/create-airport.dto';
import { UpdateAirportDto } from './dto/update-airport.dto';

@Injectable()
export class AirportService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAirportDto: CreateAirportDto) {
    return await this.prisma.airports.create({
      data: createAirportDto,
    });
  }

  async findAll() {
    return await this.prisma.airports.findMany();
  }

  async findOne(code: string) {
    return await this.prisma.airports.findUnique({
      where: { code },
    });
  }

  async update(code: string, updateAirportDto: UpdateAirportDto) {
    return await this.prisma.airports.update({
      where: { code },
      data: updateAirportDto,
    });
  }

  async remove(code: string) {
    return await this.prisma.airports.delete({
      where: { code },
    });
  }
}
