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
import { domestic_flights, international_flights } from '@prisma/client';
import { Role } from 'src/role/role.decorator';

@Role('admin')
@Controller('admin/flights')
export class FlightController {
  constructor(private readonly flightService: FlightService) {}

  // Domestic Flights
  @Get('domestic')
  findAllDomestic(): Promise<domestic_flights[]> {
    return this.flightService.findAllDomestic();
  }

  @Get('domestic/:id')
  findOneDomestic(@Param('id') id: number): Promise<domestic_flights> {
    return this.flightService.findOneDomestic(id);
  }

  @Post('domestic')
  createDomestic(@Body() flight: domestic_flights): Promise<domestic_flights> {
    return this.flightService.createDomestic(flight);
  }

  @Put('domestic/:id')
  updateDomestic(
    @Param('id') id: number,
    @Body() flight: domestic_flights,
  ): Promise<domestic_flights> {
    return this.flightService.updateDomestic(id, flight);
  }

  @Delete('domestic/:id')
  deleteDomestic(@Param('id') id: number): Promise<domestic_flights> {
    return this.flightService.deleteDomestic(id);
  }

  // International Flights
  @Get('international')
  findAllInternational(): Promise<international_flights[]> {
    return this.flightService.findAllInternational();
  }

  @Get('international/:index')
  findOneInternational(
    @Param('index') index: number,
  ): Promise<international_flights> {
    return this.flightService.findOneInternational(index);
  }

  @Post('international')
  createInternational(
    @Body() flight: international_flights,
  ): Promise<international_flights> {
    return this.flightService.createInternational(flight);
  }

  @Put('international/:index')
  updateInternational(
    @Param('index') index: number,
    @Body() flight: international_flights,
  ): Promise<international_flights> {
    return this.flightService.updateInternational(index, flight);
  }

  @Delete('international/:index')
  deleteInternational(
    @Param('index') index: number,
  ): Promise<international_flights> {
    return this.flightService.deleteInternational(index);
  }
}
