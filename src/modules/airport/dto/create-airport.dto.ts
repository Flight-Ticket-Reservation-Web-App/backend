import { IsString, IsNotEmpty, Length } from 'class-validator';

export class CreateAirportDto {
  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  airport: string;

  @IsString()
  @IsNotEmpty()
  @Length(3, 3)
  code: string;

  @IsString()
  @IsNotEmpty()
  country: string;
}
