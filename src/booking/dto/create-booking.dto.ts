// src/booking/dto/create-booking.dto.ts
import { IsEnum, IsArray, ValidateNested, IsString, IsOptional, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { PassengerInfoDto } from './passenger-info.dto';
import { TripType, CabinClass } from '../../flight/dto/search-flight.dto';

export class CreateBookingDto {
  @IsEnum(TripType)
  tripType: TripType;

  @IsString()
  outboundFlightId: string;

  @IsString()
  @IsOptional()
  returnFlightId?: string;

  @IsEnum(CabinClass)
  cabinClass: CabinClass;

  @IsDate()
  @Type(() => Date)
  departDate: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  returnDate?: Date;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PassengerInfoDto)
  passengers: PassengerInfoDto[];
}