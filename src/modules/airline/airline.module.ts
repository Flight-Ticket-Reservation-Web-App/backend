import { Module } from '@nestjs/common';
import { AirlineService } from './airline.service';
import { AirlineController } from './airline.controller';
import { PrismaService } from '@/prisma/prisma.service';

@Module({
  controllers: [AirlineController],
  providers: [AirlineService, PrismaService],
})
export class AirlineModule {}
