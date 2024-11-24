import { Module } from '@nestjs/common';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { FlightModule } from '@/modules/flight/flight.module';
import { UserModule } from '@/modules/user/user.module';
import { AirportModule } from '@/modules/airport/airport.module';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [FlightModule, UserModule, AirportModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
