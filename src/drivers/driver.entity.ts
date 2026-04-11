import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Driver {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ unique: true })
  phone!: string;

  @Column()
  password!: string;

  @Column({ default: 'taxi' })
  vehicleType!: string;

  @Column('float', { nullable: true, default: 12.6392 })
  lat!: number | null;

  @Column('float', { nullable: true, default: -8.0029 })
  lng!: number | null;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ default: false })
  isBlocked!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastSeen!: Date | null;
}