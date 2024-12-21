import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
    const searchFields = ['airline_name', 'aircode'];
    const queryOptions = buildQueryOptions<
      Prisma.airlinesWhereInput,
      Prisma.airlinesOrderByWithRelationInput
    >(paginationDto, searchFields);

    const totalRecords = await this.prisma.airlines.count({
      where: queryOptions.where,
    });

    const data = await this.prisma.airlines.findMany({
      ...queryOptions,
    });

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

  async update(id: string, updateAirlineDto: UpdateAirlineDto) {
    try {
      const updatedAirline = await this.prisma.airlines.update({
        where: { aircode: id },
        data: updateAirlineDto,
      });
      return { message: 'Airline updated successfully', data: updatedAirline };
    } catch (error) {
      throw new BadRequestException(
        `Failed to update airline: ${error.message}`,
      );
    }
  }

  async remove(id: string) {
    try {
      // Check for associations in domestic_flights
      const domesticCount = await this.prisma.domestic_flights.count({
        where: { aircode: id },
      });

      // Check for associations in international_flights
      const internationalCount = await this.prisma.international_flights.count({
        where: { aircode: id },
      });

      // If associations exist, prevent deletion
      if (domesticCount > 0 || internationalCount > 0) {
        throw new ConflictException(
          'Cannot delete this airline because it is associated with existing flights.',
        );
      }

      // Proceed with deletion if no associations exist
      await this.prisma.airlines.delete({
        where: { aircode: id },
      });
      return { message: 'Airline deleted successfully' };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error; // Re-throw specific exceptions
      }
      throw new NotFoundException(`Failed to delete airline: ${error.message}`);
    }
  }
}
