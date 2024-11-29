// src/booking/dto/passenger-info.dto.ts
import { IsString, IsEnum, IsDate, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export enum PassengerType {
  ADULT = 'ADULT',
  CHILD = 'CHILD'
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE'
}

export class PassengerInfoDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEnum(PassengerType)
  type: PassengerType;

  @IsEnum(Gender)
  gender: Gender;

  @IsDate()
  @Type(() => Date) // Transform string to Date
  dob: Date;

  @IsOptional()
  @IsString()
  passportNumber?: string;

  @IsOptional()
  @IsDate()
  passportExpiry?: Date;

  @IsOptional()
  @IsString()
  nationality?: string;
}