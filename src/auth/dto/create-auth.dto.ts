import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateAuthDto {
  @IsNotEmpty()
  username: string; // username la email

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

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
