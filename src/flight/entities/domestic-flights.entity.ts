import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('domestic_flights')
export class DomesticFlight {
  @PrimaryGeneratedColumn()
  id: number;

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
}
