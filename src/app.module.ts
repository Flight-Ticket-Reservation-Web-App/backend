import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FlightModule } from './flight/flight.module';
import { UserModule } from './user/user.module';
import { AirportModule } from './airport/airport.module';
import { PrismaService } from './prisma.service';

@Module({
  imports: [FlightModule, UserModule, AirportModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
