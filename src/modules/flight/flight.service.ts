import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { domestic_flights, international_flights } from '@prisma/client';

@Injectable()
export class FlightService {
  constructor(private readonly prisma: PrismaService) {}

  // Domestic Flights
  async findAllDomestic(): Promise<domestic_flights[]> {
    return this.prisma.domestic_flights.findMany();
  }

  async findOneDomestic(index: number): Promise<domestic_flights> {
    return this.prisma.domestic_flights.findUnique({ where: { index } });
  }

  async createDomestic(flight: domestic_flights): Promise<domestic_flights> {
    return this.prisma.domestic_flights.create({ data: flight });
  }

  async updateDomestic(
    index: number,
    flight: domestic_flights,
  ): Promise<domestic_flights> {
    return this.prisma.domestic_flights.update({
      where: { index },
      data: flight,
    });
  }

  async deleteDomestic(index: number): Promise<domestic_flights> {
    return this.prisma.domestic_flights.delete({ where: { index } });
  }

  // International Flights
  async findAllInternational(): Promise<international_flights[]> {
    return this.prisma.international_flights.findMany();
  }

  async findOneInternational(index: number): Promise<international_flights> {
    return this.prisma.international_flights.findUnique({ where: { index } });
  }

  async createInternational(
    flight: international_flights,
  ): Promise<international_flights> {
    return this.prisma.international_flights.create({ data: flight });
  }

  async updateInternational(
    index: number,
    flight: international_flights,
  ): Promise<international_flights> {
    return this.prisma.international_flights.update({
      where: { index },
      data: flight,
    });
  }

  async deleteInternational(index: number): Promise<international_flights> {
    return this.prisma.international_flights.delete({ where: { index } });
  }
}
