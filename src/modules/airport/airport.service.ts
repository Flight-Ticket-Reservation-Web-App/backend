import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateAirportDto } from '@/modules/airport/dto/create-airport.dto';
import { UpdateAirportDto } from '@/modules/airport/dto/update-airport.dto';
import { AirportQueryDto } from '@/modules/airport/dto/fetch-airport.dto';
import { buildQueryOptions } from '@/utils/query';
import { Prisma } from '@prisma/client';

@Injectable()
export class AirportService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAirportDto: CreateAirportDto) {
    return await this.prisma.airports.create({
      data: createAirportDto,
    });
  }

  async findAll(query: AirportQueryDto) {
    const searchFields = ['airport', 'code', 'city', 'country'];
    const { where, orderBy, skip, take } = buildQueryOptions<
      Prisma.airportsFindManyArgs['where'],
      Prisma.airportsOrderByWithRelationInput[]
    >(query, searchFields);

    const [data, totalRecords] = await Promise.all([
      this.prisma.airports.findMany({ where, orderBy, skip, take }),
      this.prisma.airports.count({ where }),
    ]);

    return {
      data,
      pagination: {
        totalRecords,
        totalPages: Math.ceil(totalRecords / take),
        currentPage: Math.floor(skip / take) + 1,
        limit: take,
      },
    };
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
