import { Module } from '@nestjs/common';
import { AirlineService } from './airline.service';
import { AirlineController } from './airline.controller';

@Module({
  controllers: [AirlineController],
  providers: [AirlineService],
})
export class AirlineModule {}
