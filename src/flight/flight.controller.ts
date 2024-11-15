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
import { Flight } from './entities/flight.entity';
import { Role } from 'src/role/role.decorator';

@Role('admin')
@Controller('admin/flights')
export class FlightController {
  constructor(private readonly flightService: FlightService) {}

  @Get()
  findAll(): Promise<Flight[]> {
    return this.flightService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<Flight> {
    return this.flightService.findOne(id);
  }

  @Post()
  create(@Body() flight: Flight): Promise<Flight> {
    return this.flightService.create(flight);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() flight: Flight): Promise<any> {
    return this.flightService.update(id, flight);
  }

  @Delete(':id')
  delete(@Param('id') id: number): Promise<any> {
    return this.flightService.delete(id);
  }
}
