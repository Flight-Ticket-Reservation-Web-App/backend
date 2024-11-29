import { Module } from '@nestjs/common';
import { BookingService } from '@/modules/booking/booking.service';
import { BookingController } from '@/modules/booking/booking.controller';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BookingController],
  providers: [BookingService],
})
export class BookingModule {}
