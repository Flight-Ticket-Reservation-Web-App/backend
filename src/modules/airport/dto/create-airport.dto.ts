import { IsNotEmpty, IsString, Length } from "class-validator";

export class CreateAirportDto {
  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  airport: string;

  @IsString()
  @IsNotEmpty()
  @Length(3,3,  { message: 'Airport code must be exactly 3 characters' })
  code: string;

  @IsString()
  @IsNotEmpty()
  country: string;
}
