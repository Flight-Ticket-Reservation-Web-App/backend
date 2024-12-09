import {
  IsEnum,
  IsArray,
  ValidateNested,
  IsString,
  IsOptional,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PassengerInfoDto } from '@/modules/booking/dto/passenger-info.dto';
import { CabinClass, TripType } from '@/common/enums';

export class FlightSelectionDto {
  @IsString()
  flightId: string;

  @IsEnum(CabinClass)
  cabinClass: CabinClass;

  @IsDate()
  @Type(() => Date)
  date: Date;
}

export class CreateBookingDto {
  @IsEnum(TripType)
  tripType: TripType;

  @ValidateNested()
  @Type(() => FlightSelectionDto)
  outboundFlight: FlightSelectionDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => FlightSelectionDto)
  returnFlight?: FlightSelectionDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PassengerInfoDto)
  passengers: PassengerInfoDto[];
}
