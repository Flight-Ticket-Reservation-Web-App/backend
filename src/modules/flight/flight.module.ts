import { Module } from '@nestjs/common';
import { FlightService } from '@/modules/flight/flight.service';
import { FlightController } from '@/modules/flight/flight.controller';
import { PrismaService } from '@/prisma/prisma.service';
import { PrismaModule } from '@/prisma/prisma.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { AdminFlightController } from '@/modules/flight/admin-flight.controller';

@Module({
  imports: [PrismaModule, MailerModule],
  controllers: [FlightController, AdminFlightController],
  providers: [FlightService, PrismaService],
})
export class FlightModule {}
