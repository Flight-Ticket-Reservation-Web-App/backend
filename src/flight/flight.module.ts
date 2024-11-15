import { Module } from '@nestjs/common';
import { FlightService } from './flight.service';
import { FlightController } from './flight.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DomesticFlight } from './entities/domestic-flights.entity';
import { InternationalFlight } from './entities/international-flights.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DomesticFlight, InternationalFlight])],
  controllers: [FlightController],
  providers: [FlightService],
})
export class FlightModule {}
