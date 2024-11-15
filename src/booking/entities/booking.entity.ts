import { Flight } from 'src/flight/entities/flight.entity';
import { User } from 'src/user/entities/user.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

@Entity()
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Flight)
  flight: Flight;

  @Column()
  status: string;

  @Column()
  bookingDate: Date;
}
