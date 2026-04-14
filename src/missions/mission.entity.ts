import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Mission {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  clientId!: number;

  @Column()
  pickup!: string;

  @Column()
  destination!: string;

  @Column('float')
  pickupLat!: number;

  @Column('float')
  pickupLng!: number;

  @Column('float')
  destinationLat!: number;

  @Column('float')
  destinationLng!: number;

  @Column({ type: 'int', nullable: true })
  driverId!: number | null;

  @Column({ type: 'int', default: 0 })
  price!: number;

  @Column({ default: 'taxi' })
  vehicleType!: string;

  @Column({ default: 'pending' })
  status!: string;
}