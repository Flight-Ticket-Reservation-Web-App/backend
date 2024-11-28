// src/booking/booking.controller.ts
import { Controller, Post, Body, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK) 
  @Post()
  async create(@Request() req, @Body() createBookingDto: CreateBookingDto) {
    return this.bookingService.create(createBookingDto, req.user.id);
  }
}