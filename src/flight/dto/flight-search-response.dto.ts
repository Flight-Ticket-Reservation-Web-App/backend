export class FlightSearchResponseDto {
  index: number;
  origin: string;
  destination: string;
  departTime: string;
  departDate: Date;
  arrivalTime: string;
  arrivalDate: Date;
  duration: number;
  airline: string;
  flightNo: string;
  availableSeats: number;
  fare: number;
}
