import { flight_status } from '@prisma/client';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsEnum,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateFlightDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim().toUpperCase())
  aircode: string; // Aircode from the airport table

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d+$/, {
    message: 'Flight number suffix must be numeric (e.g., 746).',
  })
  @Transform(({ value }) => value.trim())
  flightNoSuffix: string; // Numeric part provided by the user

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim().toUpperCase())
  origin: string; // Must exist in the airport table

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim().toUpperCase())
  destination: string; // Must exist in the airport table

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => {
    const [hours, minutes] = value.split(':').map(Number);
    return new Date(0, 0, 0, hours, minutes, 0).toTimeString().split(' ')[0];
  })
  departure_time: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => {
    const [hours, minutes] = value.split(':').map(Number);
    return new Date(0, 0, 0, hours, minutes, 0).toTimeString().split(' ')[0];
  })
  arrival_time: string;

  @IsEnum(flight_status)
  @IsNotEmpty()
  status: flight_status;

  @IsNumber()
  @IsNotEmpty()
  @Transform(({ value }) => parseFloat(value))
  economyFare: number;

  @IsNumber()
  @IsNotEmpty()
  @Transform(({ value }) => parseFloat(value))
  businessFare: number;
}
