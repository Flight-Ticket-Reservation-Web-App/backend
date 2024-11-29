import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FlightService } from '@/modules/flight/flight.service';
import { SearchFlightDto } from '@/modules/flight/dto/search-flight.dto';

@Controller('flights')
export class FlightController {
  constructor(private readonly flightService: FlightService) {}

  @Post('api/search')
  @HttpCode(HttpStatus.OK)
  async searchFlights(
    @Body(
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
