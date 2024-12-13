import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { AirportService } from '@/modules/airport/airport.service';
import { CreateAirportDto } from '@/modules/airport/dto/create-airport.dto';
import { UpdateAirportDto } from '@/modules/airport/dto/update-airport.dto';
import { Public } from '@/decorator/public-decorator';
import { AirportQueryDto } from '@/modules/airport/dto/fetch-airport.dto';

@Public()
@Controller('airport')
export class AirportController {
  constructor(private readonly airportService: AirportService) {}

  @Post()
  create(@Body() createAirportDto: CreateAirportDto) {
    return this.airportService.create(createAirportDto);
  }

  @Get()
  findAll(@Query() query: AirportQueryDto) {
    return this.airportService.findAll(query);
  }

  @Get(':code')
  findOne(@Param('code') code: string) {
    return this.airportService.findOne(code);
  }

  @Patch(':code')
  update(
    @Param('code') code: string,
    @Body() updateAirportDto: UpdateAirportDto,
  ) {
    return this.airportService.update(code, updateAirportDto);
  }

  @Delete(':code')
  remove(@Param('code') code: string) {
    return this.airportService.remove(code);
  }
}
