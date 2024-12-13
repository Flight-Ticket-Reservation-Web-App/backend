import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { FlightService } from '@/modules/flight/flight.service';
import { domestic_flights, international_flights } from '@prisma/client';
import { Roles } from '@/auth/role/role.decorator';
import { Role } from '@/common/enums';

@Roles(Role.ADMIN)
@Controller('admin/flights')
export class AdminFlightController {
  constructor(private readonly flightService: FlightService) {}

  // Domestic Flights
  @Get('domestic')
  findAllDomestic(): Promise<domestic_flights[]> {
    return this.flightService.findAllDomestic();
  }

  @Get('domestic/:id')
  findOneDomestic(@Param('id') id: string): Promise<domestic_flights> {
    return this.flightService.findOneDomestic(id);
  }

  @Post('domestic')
  createDomestic(@Body() flight: domestic_flights): Promise<domestic_flights> {
    return this.flightService.createDomestic(flight);
  }

  @Put('domestic/:id')
  updateDomestic(
    @Param('id') id: string,
    @Body() flight: domestic_flights,
  ): Promise<domestic_flights> {
    return this.flightService.updateDomestic(id, flight);
  }

  @Delete('domestic/:id')
  deleteDomestic(@Param('id') id: string): Promise<domestic_flights> {
    return this.flightService.deleteDomestic(id);
  }

  // International Flights
  @Get('international')
  findAllInternational(): Promise<international_flights[]> {
    return this.flightService.findAllInternational();
  }

  @Get('international/:id')
  findOneInternational(
    @Param('id') id: string,
  ): Promise<international_flights> {
    return this.flightService.findOneInternational(id);
  }

  @Post('international')
  createInternational(
    @Body() flight: international_flights,
  ): Promise<international_flights> {
    return this.flightService.createInternational(flight);
  }

  @Put('international/:id')
  updateInternational(
    @Param('id') id: string,
    @Body() flight: international_flights,
  ): Promise<international_flights> {
    return this.flightService.updateInternational(id, flight);
  }

  @Delete('international/:id')
  deleteInternational(@Param('id') id: string): Promise<international_flights> {
    return this.flightService.deleteInternational(id);
  }
}
