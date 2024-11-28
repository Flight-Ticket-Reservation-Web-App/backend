import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FlightModule } from './flight/flight.module';
import { UserModule } from './user/user.module';
import { AirportModule } from './airport/airport.module';
import { PrismaModule } from './prisma/prisma.module';
import { BookingModule } from './booking/booking.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [FlightModule, UserModule, AirportModule, PrismaModule, BookingModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}