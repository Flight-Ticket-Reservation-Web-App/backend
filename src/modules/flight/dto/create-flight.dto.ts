import { flight_status } from '@prisma/client';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsISO8601,
  IsEnum,
  Matches,
} from 'class-validator';

export class CreateFlightDto {
  @IsString()
  @IsNotEmpty()
  aircode: string; // Aircode from the airport table

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d+$/, {
    message: 'Flight number suffix must be numeric (e.g., 746).',
  })
  flightNoSuffix: string; // Numeric part provided by the user

  @IsString()
  @IsNotEmpty()
  origin: string; // Must exist in the airport table

  @IsString()
  @IsNotEmpty()
  destination: string; // Must exist in the airport table

  @IsISO8601()
  @IsNotEmpty()
  departureTime: string;

  @IsISO8601()
  @IsNotEmpty()
  arrivalTime: string;

  @IsEnum(flight_status)
  @IsNotEmpty()
  status: flight_status;

  @IsNumber()
  @IsNotEmpty()
  economyFare: number;

  @IsNumber()
  @IsNotEmpty()
  businessFare: number;
}
