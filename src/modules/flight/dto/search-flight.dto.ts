import {
  IsString,
  IsEnum,
  IsInt,
  IsDate,
  Min,
  IsOptional,
} from 'class-validator';
import { Transform } from 'class-transformer';

export enum TripType {
  ONE_WAY = 'ONE_WAY',
  ROUND_TRIP = 'ROUND_TRIP',
}

export enum CabinClass {
  ECONOMY = 'ECONOMY',
  BUSINESS = 'BUSINESS',
  FIRST = 'FIRST',
}

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
