import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('airports')
export class Airport {
  @Column('text')
  city: string;

  @Column('text')
  airport: string;

  @PrimaryColumn('text')
  code: string;

  @Column('text')
  country: string;
}
