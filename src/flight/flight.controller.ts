import { Controller, Get, Query, ValidationPipe } from '@nestjs/common';
import { FlightService } from './flight.service';
import { SearchFlightDto } from './dto/search-flight.dto';
import { FlightSearchResponseDto } from './dto/flight-search-response.dto';

@Controller('flights')
export class FlightController {
  constructor(private readonly flightService: FlightService) {}

  @Get('search')
  async searchFlights(
    @Query(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    )
    searchParams: SearchFlightDto,
  ) {
    return this.flightService.searchFlights(searchParams);
  }
}
