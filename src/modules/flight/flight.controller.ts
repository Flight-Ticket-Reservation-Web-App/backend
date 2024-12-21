import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  HttpCode,
  HttpStatus,
  Get,
  Query,
} from '@nestjs/common';
import { FlightService } from '@/modules/flight/flight.service';
import { SearchFlightDto } from '@/modules/flight/dto/search-flight.dto';
import { Public } from '@/decorator/public-decorator';
import { PaginationDto } from '@/common/dto/pagination.dto';

@Controller('flights')
export class FlightController {
  constructor(private readonly flightService: FlightService) {}

  @Post('search')
  @HttpCode(HttpStatus.OK)
  @Public()
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

  @Get('bookings')
  @HttpCode(HttpStatus.OK)
  @Public()
  async getBookings(
    @Query(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    )
    queryParams: PaginationDto,
  ) {
    return this.flightService.getBookings(queryParams);
  }

  @Get('schedule')
  @HttpCode(HttpStatus.OK)
  @Public()
  async getFlights(
    @Query(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    )
    queryParams: PaginationDto,
  ) {
    return this.flightService.getAllFlights(queryParams);
  }
}
