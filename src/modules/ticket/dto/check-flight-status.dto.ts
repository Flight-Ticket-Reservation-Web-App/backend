import { IsString } from 'class-validator';

export class CheckFlightStatusDto {
  @IsString()
  ticketNumber: string;
}
