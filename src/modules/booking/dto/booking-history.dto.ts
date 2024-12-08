// src/modules/booking/dto/booking-history.dto.ts
import { PassengerType } from './passenger-info.dto';

export class BookingHistoryFlightDto {
  flightId: string;
  flightType: string;
  flightDirection: string;
  flightDate: Date;
  fareAmount: number;
}

export class BookingHistoryPassengerDto {
  firstName: string;
  lastName: string;
  type: PassengerType;
  gender: string;
  passportNumber?: string;
}

export class BookingHistoryDto {
  id: number;
  bookingNumber: string;
  totalAmount: number;
  tripType: string;
  cabinClass: string;
  status: string;
  createdAt: Date;
  flights: BookingHistoryFlightDto[];
  passengers: BookingHistoryPassengerDto[];
}
