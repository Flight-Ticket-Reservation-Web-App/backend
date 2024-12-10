import { Controller, Get, Query, ValidationPipe } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { CheckFlightStatusDto } from './dto/check-flight-status.dto';
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
}
