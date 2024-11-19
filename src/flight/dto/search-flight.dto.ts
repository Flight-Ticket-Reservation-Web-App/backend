import {
  IsString,
  IsEnum,
  IsInt,
  IsDate,
  Min,
  IsOptional,
} from 'class-validator';

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
  departDate: Date;

  @IsOptional()
  @IsDate()
  returnDate?: Date;

  @IsInt()
  @Min(1)
  passengers: number;

  @IsEnum(CabinClass)
  cabinClass: CabinClass;
}
