import { Module } from '@nestjs/common';
import { BookingService } from '@/modules/booking/booking.service';
import { BookingController } from '@/modules/booking/booking.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { TicketModule } from '@/modules/ticket/ticket.module';

@Module({
  imports: [PrismaModule, TicketModule],
  controllers: [BookingController],
  providers: [BookingService],
})
export class BookingModule {}
