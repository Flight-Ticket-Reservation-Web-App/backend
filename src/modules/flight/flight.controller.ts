import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  HttpCode,
  HttpStatus,
  Get,
  Query,
  Param,
  BadRequestException,
  Patch,
  Put,
  UseGuards,
} from '@nestjs/common';
import { FlightService } from '@/modules/flight/flight.service';
import { SearchFlightDto } from '@/modules/flight/dto/search-flight.dto';
import { Public } from '@/decorator/public-decorator';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { UpdateFlightDto } from '@/modules/flight/dto/update-flight.dto';
import { UpdateFlightDelayDto } from '@/modules/flight/dto/update-flight-delay.dto';
import { RoleGuard } from '@/auth/role/role.guard';
import { Role } from '@/common/enums';
import { Roles } from '@/auth/role/role.decorator';

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

  @UseGuards(RoleGuard)
  @Roles(Role.ADMIN)
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

  @UseGuards(RoleGuard)
  @Roles(Role.ADMIN)
  @Get(':flightNo')
  @HttpCode(HttpStatus.OK)
  @Public()
  async getFlightDetails(@Param('flightNo') flightNo: string) {
    if (!flightNo) {
      throw new BadRequestException('Flight number is required.');
    }
    return this.flightService.getFlightDetails(flightNo);
  }

  @UseGuards(RoleGuard)
  @Roles(Role.ADMIN)
  @Patch(':flightNo')
  @HttpCode(HttpStatus.OK)
  async updateFlightDetails(
    @Param('flightNo') flightNo: string,
    @Body(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    )
    updateData: UpdateFlightDto,
  ) {
    if (!flightNo) {
      throw new BadRequestException('Flight number is required.');
    }
    return this.flightService.updateFlight(flightNo, updateData);
  }

  @UseGuards(RoleGuard)
  @Roles(Role.ADMIN)
  @Put('delay')
  @HttpCode(HttpStatus.OK)
  @Public()
  async updateFlightDelay(@Body() updateDelayDto: UpdateFlightDelayDto) {
    return this.flightService.updateFlightDelay(
      updateDelayDto.flightId,
      updateDelayDto.delayDuration,
    );
  }
}
