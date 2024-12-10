import { IsNumber, IsString, Min } from 'class-validator';

export class UpdateFlightDelayDto {
  @IsString()
  flightId: string;

  @IsNumber()
  @Min(0)
  delayDuration: number;
}
