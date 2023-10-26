import { UsersEntity } from "src/users/entyties/users.entytie";
import { Column, Entity, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity("sessions")
export class SessionPg {
    @PrimaryColumn()
    deviceId: string
    @Column()
    ip: string
    @Column()
    title: string
    @Column('bigint')
    lastActiveDate: number
    @Column()
    expiration: string
    @Column()
    refreshHash: string
    @Column()
    userId: number
    @ManyToOne(() => UsersEntity, u => u.id, { onDelete: 'CASCADE' })
    user: UsersEntity;
}