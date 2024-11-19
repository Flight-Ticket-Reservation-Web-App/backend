import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { FlightService } from './flight.service';
import { DomesticFlight } from './entities/domestic-flights.entity';
import { InternationalFlight } from './entities/international-flights.entity';
import { Role } from 'src/role/role.decorator';

@Role('admin')
@Controller('admin/flights')
export class AdminFlightController {
  constructor(private readonly flightService: FlightService) {}

  // Domestic Flights
  @Get('domestic')
  findAllDomestic(): Promise<DomesticFlight[]> {
    return this.flightService.findAllDomestic();
  }

  @Get('domestic/:id')
  findOneDomestic(@Param('id') id: number): Promise<DomesticFlight> {
    return this.flightService.findOneDomestic(id);
  }

  @Post('domestic')
  createDomestic(@Body() flight: DomesticFlight): Promise<DomesticFlight> {
    return this.flightService.createDomestic(flight);
  }

  @Put('domestic/:id')
  updateDomestic(
    @Param('id') id: number,
    @Body() flight: DomesticFlight,
  ): Promise<any> {
    return this.flightService.updateDomestic(id, flight);
  }

  @Delete('domestic/:id')
  deleteDomestic(@Param('id') id: number): Promise<any> {
    return this.flightService.deleteDomestic(id);
  }

  // International Flights
  @Get('international')
  findAllInternational(): Promise<InternationalFlight[]> {
    return this.flightService.findAllInternational();
  }

  @Get('international/:index')
  findOneInternational(
    @Param('index') index: number,
  ): Promise<InternationalFlight> {
    return this.flightService.findOneInternational(index);
  }

  @Post('international')
  createInternational(
    @Body() flight: InternationalFlight,
  ): Promise<InternationalFlight> {
    return this.flightService.createInternational(flight);
  }

  @Put('international/:index')
  updateInternational(
    @Param('index') index: number,
    @Body() flight: InternationalFlight,
  ): Promise<any> {
    return this.flightService.updateInternational(index, flight);
  }

  @Delete('international/:index')
  deleteInternational(@Param('index') index: number): Promise<any> {
    return this.flightService.deleteInternational(index);
  }
}
