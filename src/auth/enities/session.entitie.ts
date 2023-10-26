import { Users } from "src/users/entyties/users.entytie";
import { Column, Entity, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity()
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
    @ManyToOne(() => Users, u => u.id, { onDelete: 'CASCADE' })
    user: Users;
}