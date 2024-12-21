import { IsString, IsNotEmpty } from 'class-validator';

export class CreateAirlineDto {
  @IsString()
  @IsNotEmpty()
  aircode: string;

  @IsString()
  @IsNotEmpty()
  airline_name: string;
}
