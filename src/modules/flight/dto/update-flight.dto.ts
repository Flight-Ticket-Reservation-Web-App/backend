import { PartialType } from '@nestjs/mapped-types';
import { CreateFlightDto } from '@/modules/flight/dto/create-flight.dto';

export class UpdateFlightDto extends PartialType(CreateFlightDto) {}
