import { Module } from '@nestjs/common';
import { FlightService } from '@/modules/flight/flight.service';
import { FlightController } from '@/modules/flight/flight.controller';
import { PrismaService } from '@/prisma/prisma.service';

@Module({
  imports: [],
  controllers: [FlightController],
  providers: [FlightService, PrismaService],
})
export class FlightModule {}
