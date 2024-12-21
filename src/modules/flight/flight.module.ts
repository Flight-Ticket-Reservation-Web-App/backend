import { Module } from '@nestjs/common';
import { FlightService } from '@/modules/flight/flight.service';
import { FlightController } from '@/modules/flight/flight.controller';
import { PrismaService } from '@/prisma/prisma.service';
import { PrismaModule } from '@/prisma/prisma.module';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [PrismaModule, MailerModule],
  controllers: [FlightController],
  providers: [FlightService, PrismaService],
})
export class FlightModule {}
