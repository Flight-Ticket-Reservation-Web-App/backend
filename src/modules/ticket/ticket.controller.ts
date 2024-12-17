import { Controller, Get, Query, ValidationPipe, Param } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { CheckFlightStatusDto } from './dto/check-flight-status.dto';
import { TicketFlightDetailsDto } from './dto/ticket-flight-details.dto';
import { Public } from '@/decorator/public-decorator';

@Controller('tickets')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Get('status')
  @Public()
  async checkFlightStatus(
    @Query(ValidationPipe) checkFlightStatusDto: CheckFlightStatusDto,
  ) {
    return this.ticketService.checkFlightStatus(
      checkFlightStatusDto.ticketNumber,
    );
  }

  @Get(':ticketNumber/flight-details')
  async getFlightDetails(
    @Param('ticketNumber') ticketNumber: string,
  ): Promise<TicketFlightDetailsDto> {
    return this.ticketService.getFlightDetailsByTicket(ticketNumber);
  }
}
