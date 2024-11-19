import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('international_flights')
export class InternationalFlight {
  @PrimaryGeneratedColumn()
  index: number;

  @Column('text')
  origin: string;

  @Column('text')
  destination: string;

  @Column('time')
  depart_time: string;

  @Column('integer')
  depart_weekday: number;

  @Column('integer')
  duration: number; // in minutes

  @Column('time')
  arrival_time: string;

  @Column('integer')
  arrival_weekday: number;

  @Column('text')
  flight_no: string;

  @Column('text')
  airline_code: string;

  @Column('text')
  airline: string;

  @Column('numeric', { precision: 10, scale: 2 })
  economy_fare: number;

  @Column('numeric', { precision: 10, scale: 2 })
  business_fare: number;

  @Column('numeric', { precision: 10, scale: 2 })
  first_fare: number;

  @Column('integer')
  economy_seats: number;

  @Column('integer')
  business_seats: number;

  @Column('integer')
  first_seats: number;
}
