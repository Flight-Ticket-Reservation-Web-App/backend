import { IsNotEmpty, IsString, Length } from "class-validator";

export class CreateAirportDto {
  @IsString()
  @IsNotEmpty()
  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()

  @IsString()
  @IsNotEmpty()
  airport: string;

  @IsString()
  @IsNotEmpty()
  @Length(3,3,  { message: 'Airport code must be exactly 3 characters' })

  @IsString()
  @IsNotEmpty()
  @Length(3, 3)
  code: string;

  @IsString()
  @IsNotEmpty()

  @IsString()
  @IsNotEmpty()
  country: string;
}
