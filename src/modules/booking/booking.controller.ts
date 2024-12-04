import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BookingService } from '@/modules/booking/booking.service';
import { CreateBookingDto } from '@/modules/booking/dto/create-booking.dto';
import { JwtAuthGuard } from '@/auth/passport/jwt-auth.guard';
import { Role } from '@/modules/role/role.decorator';
import { RoleGuard } from '@/modules/role/role.guard';
import { Public } from '@/decorator/public-decorator';

@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Role('user')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Post()
  @HttpCode(HttpStatus.OK)
  async create(@Request() req, @Body() createBookingDto: CreateBookingDto) {
    return this.bookingService.create(createBookingDto, req.user.id);
  }
}
