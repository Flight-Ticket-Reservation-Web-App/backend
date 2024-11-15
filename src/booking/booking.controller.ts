import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { Booking } from './entities/booking.entity';

@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Get()
  findAll(): Promise<Booking[]> {
    return this.bookingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<Booking> {
    return this.bookingService.findOne(id);
  }

  @Post()
  create(@Body() booking: Booking): Promise<Booking> {
    return this.bookingService.create(booking);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() booking: Booking): Promise<any> {
    return this.bookingService.update(id, booking);
  }

  @Delete(':id')
  delete(@Param('id') id: number): Promise<any> {
    return this.bookingService.delete(id);
  }
}
