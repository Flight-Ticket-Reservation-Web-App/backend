import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AirportService } from './airport.service';
import { CreateAirportDto } from './dto/create-airport.dto';
import { UpdateAirportDto } from './dto/update-airport.dto';

@Controller('airport')
export class AirportController {
  constructor(private readonly airportService: AirportService) {}

  @Post()
  create(@Body() createAirportDto: CreateAirportDto) {
    return this.airportService.create(createAirportDto);
  }

  @Get()
  findAll() {
    return this.airportService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.airportService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAirportDto: UpdateAirportDto) {
    return this.airportService.update(+id, updateAirportDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.airportService.remove(+id);
  }
}
