import { Module } from '@nestjs/common';
import { AirportService } from '@/modules/airport/airport.service';
import { AirportController } from '@/modules/airport/airport.controller';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AirportController],
  providers: [AirportService],
})
export class AirportModule {}
