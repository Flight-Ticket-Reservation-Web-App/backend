import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateAuthDto {
  @IsEmail()
  @IsNotEmpty()
  username: string; // username la email

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  //TODO: Add title, DOB, Nationality, phone (+code)
}

export class CodeAuthDto {
  @IsOptional()
  id?: number;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsNotEmpty()
  code: string;
}
