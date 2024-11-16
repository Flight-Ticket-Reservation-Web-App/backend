import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlightModule } from './flight/flight.module';
import { UserModule } from './user/user.module';
import { AirportModule } from './airport/airport.module';
import { Airport } from './airport/entities/airport.entity';
import { User } from './user/entities/user.entity';
import { DomesticFlight } from './flight/entities/domestic-flights.entity';
import { InternationalFlight } from './flight/entities/international-flights.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'db',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'postgres',
      entities: [Airport, User, DomesticFlight, InternationalFlight],
      synchronize: true,
      autoLoadEntities: true,
    }),
    FlightModule,
    UserModule,
    AirportModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
