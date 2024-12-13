import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Get,
  Query,
  Param,
} from '@nestjs/common';
import { BookingService } from '@/modules/booking/booking.service';
import { CreateBookingDto } from '@/modules/booking/dto/create-booking.dto';
import { RoleGuard } from '@/modules/role/role.guard';
import { UnauthorizedException } from '@nestjs/common';
import { BookingHistoryDto } from '@/modules/booking/dto/booking-history.dto';
import { BookingHistoryQueryDto } from '@/modules/booking/dto/booking-history-query.dto';

@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @UseGuards(RoleGuard)
  @Post()
  @HttpCode(HttpStatus.OK)
  async create(@Request() req, @Body() createBookingDto: CreateBookingDto) {
    if (!req.user?.id) {
      throw new UnauthorizedException('User ID not found in token');
    }
    return this.bookingService.create(createBookingDto, req.user.id);
  }
  @Get('history')
  async getBookingHistory(
    @Request() req,
    @Query() query: BookingHistoryQueryDto,
  ): Promise<{ data: BookingHistoryDto[]; total: number; pages: number }> {
    if (!req.user?.id) {
      throw new UnauthorizedException('User ID not found in token');
    }
    return this.bookingService.getBookingHistory(req.user.id, query);
  }

  @Get(':bookingNumber')
  async getBookingByNumber(
    @Request() req,
    @Param('bookingNumber') bookingNumber: string,
  ): Promise<BookingHistoryDto> {
    if (!req.user?.id) {
      throw new UnauthorizedException('User ID not found in token');
    }
    return this.bookingService.getBookingByNumber(bookingNumber, req.user.id);
  }

  @Post(':bookingNumber/cancel')
  @HttpCode(HttpStatus.OK)
  async cancelBooking(
    @Request() req,
    @Param('bookingNumber') bookingNumber: string,
  ): Promise<BookingHistoryDto> {
    if (!req.user?.id) {
      throw new UnauthorizedException('User ID not found in token');
    }
    return this.bookingService.cancelBooking(bookingNumber, req.user.id);
  }
}
