import { FlightStatus } from './flight-status-response.dto';

export class TicketFlightDetailsDto {
  ticketNumber: string;
  flightId: string;
  airline: string;
  flightNo: string;
  origin: string;
  destination: string;
  departDate: Date;
  departTime: string;
  arrivalDate: Date;  
  arrivalTime: string;
  gate?: string;
  status: FlightStatus;
  delayDuration?: number;
  passengerName: string;
  seatNumber: string;
  cabinClass: string;
  duration: number; 
}
