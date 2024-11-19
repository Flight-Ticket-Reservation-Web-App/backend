import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlightController } from './flight.controller';
import { AdminFlightController } from './admin-flight.controller';
import { FlightService } from './flight.service';
import { DomesticFlight } from './entities/domestic-flights.entity';
import { InternationalFlight } from './entities/international-flights.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DomesticFlight, InternationalFlight])],
  controllers: [FlightController, AdminFlightController],
  providers: [FlightService],
})
export class FlightModule {}
