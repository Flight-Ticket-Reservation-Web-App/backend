import { PartialType } from '@nestjs/mapped-types';
import { CreateAirportDto } from '@/modules/airport/dto/create-airport.dto';

export class UpdateAirportDto extends PartialType(CreateAirportDto) {}
