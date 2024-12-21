import { Injectable } from '@nestjs/common';
import { CreateAirlineDto } from './dto/create-airline.dto';
import { UpdateAirlineDto } from './dto/update-airline.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { buildQueryOptions } from '@/utils/query';
import { Prisma } from '@prisma/client';

@Injectable()
export class AirlineService {
  constructor(private readonly prisma: PrismaService) {}

  findAll = async (paginationDto: PaginationDto) => {
    const searchFields = ['name', 'code']; // Replace with actual searchable fields for `airlines`
    const queryOptions = buildQueryOptions<
      Prisma.airlinesWhereInput,
      Prisma.airlinesOrderByWithRelationInput
    >(paginationDto, searchFields);

    // Count the total records for pagination metadata
    const totalRecords = await this.prisma.airlines.count({
      where: queryOptions.where,
    });

    // Fetch the data with pagination and filters
    const data = await this.prisma.airlines.findMany({
      ...queryOptions,
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalRecords / paginationDto.limit);
    const pagination = {
      currentPage: paginationDto.page,
      totalPages,
      totalRecords,
      limit: paginationDto.limit,
    };

    return { data, pagination };
  };

  async create(createAirlineDto: CreateAirlineDto) {
    const { aircode, airline_name } = createAirlineDto;
    return this.prisma.airlines.create({
      data: {
        aircode,
        airline_name,
      },
    });
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
