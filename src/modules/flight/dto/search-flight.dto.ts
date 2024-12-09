import {
  IsString,
  IsEnum,
  IsInt,
  IsDate,
  Min,
  IsOptional,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { TripType, CabinClass } from '@/common/enums';

export class SearchFlightDto {
  @IsString()
  origin: string;

  @IsString()
  destination: string;

  @IsEnum(TripType)
  tripType: TripType;

  @IsDate()
  @Transform(({ value }) => new Date(value))
  departDate: Date;

  @IsOptional()
  @IsDate()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  returnDate?: Date;

  @IsInt()
  @Min(1)
  passengers: number;

  @IsEnum(CabinClass)
  cabinClass: CabinClass;
}
