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
  aircode: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d+$/, {
    message: 'Flight number suffix must be numeric (e.g., 746).',
  })
  @Transform(({ value }) => value.trim())
  flightNoSuffix: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim().toUpperCase())
  origin: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim().toUpperCase())
  destination: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => {
    if (/^\d{2}:\d{2}$/.test(value)) {
      // If the input is in HH:mm format
      const [hours, minutes] = value.split(':').map(Number);
      const defaultDate = '1970-01-01';
      return `${defaultDate}T${String(hours).padStart(2, '0')}:${String(
        minutes,
      ).padStart(2, '0')}:00Z`;
    }
    // If already in ISO-8601 format, return as is
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(value)) {
      return value;
    }
    throw new Error(
      `Invalid time format for departure_time. Expected HH:mm or ISO-8601, received: ${value}`,
    );
  })
  depart_time: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => {
    if (/^\d{2}:\d{2}$/.test(value)) {
      // If the input is in HH:mm format
      const [hours, minutes] = value.split(':').map(Number);
      const defaultDate = '1970-01-01';
      return `${defaultDate}T${String(hours).padStart(2, '0')}:${String(
        minutes,
      ).padStart(2, '0')}:00Z`;
    }
    // If already in ISO-8601 format, return as is
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(value)) {
      return value;
    }
    throw new Error(
      `Invalid time format for arrival_time. Expected HH:mm or ISO-8601, received: ${value}`,
    );
  })
  arrival_time: string;

  @IsEnum(flight_status)
  @IsNotEmpty()
  status: flight_status;

  @IsNumber()
  @IsNotEmpty()
  @Transform(({ value }) => parseFloat(value))
  economy_fare: number;

  @IsNumber()
  @IsNotEmpty()
  @Transform(({ value }) => parseFloat(value))
  business_fare: number;
}
