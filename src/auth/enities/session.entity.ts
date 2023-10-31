import { UsersEntity } from '../../users/entyties/users.entity';
import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity('sessions')
export class SessionPg {
  @PrimaryColumn()
  deviceId: string;
  @Column()
  ip: string;
  @Column()
  title: string;
  @Column('bigint')
  lastActiveDate: number;
  @Column()
  expiration: string;
  @Column()
  refreshHash: string;
  @Column()
  userId: number;
  @ManyToOne(() => UsersEntity, (u) => u.id, { onDelete: 'CASCADE' })
  user: UsersEntity;
}
