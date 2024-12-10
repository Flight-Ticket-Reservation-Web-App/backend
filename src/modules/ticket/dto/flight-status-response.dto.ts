export enum FlightStatus {
  ON_TIME = 'ON_TIME',
  DELAYED = 'DELAYED',
}

export class FlightStatusResponseDto {
  ticketNumber: string;
  flightId: string;
  status: FlightStatus;
  flightDate: string;
  delayDuration?: number; // in minutes
  gate?: string;
}
