export interface FlightSearchResponseDto {
  index: string;
  origin: string;
  destination: string;
  departTime: string;    // Changed from Date to string
  departDate: string;    // Changed from Date to string
  arrivalTime: string;   // Changed from Date to string
  arrivalDate: string;   // Changed from Date to string
  duration: number;
  airline: string;
  flightNo: string;
  availableSeats: number;
  economyFare: number;
  businessFare: number | null; // null when business class not available
}