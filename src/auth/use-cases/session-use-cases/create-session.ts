import { Request } from 'express';
import { add } from 'date-fns';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Session } from '../../../entyties/session.schema';
import { UserDocument } from '../../../entyties/users.chema';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';


export class CreateSessionCommand {
    constructor(public req: Request, public user: UserDocument, public expDate: number, public deviceId: string, public refreshHash: string) { }
}

@CommandHandler(CreateSessionCommand)
export class CreateSessionUseCase implements ICommandHandler<CreateSessionCommand> {
    constructor(@InjectModel(Session.name) private sessionModel: Model<Session>) { }

    async execute(command: CreateSessionCommand) {
        const requestIp =
            (command.req.headers['x-forwarded-for'] as string) || command.req.socket.remoteAddress!;

        const userAgent = command.req.headers['user-agent']
            ? command.req.headers['user-agent']
            : 'Chrome 105';

        const refreshTokenExpirationDate = add(new Date(), {
            seconds: command.expDate,
        }).toISOString();

        const lastActiveDate = Math.floor(+new Date() / 1000) * 1000;

        const newSession = new this.sessionModel({
            userId: command.user.id,
            deviceId: command.deviceId,
            ip: requestIp,
            title: userAgent,
            lastActiveDate: new Date(lastActiveDate).toISOString(),
            expiration: refreshTokenExpirationDate,
            refreshHash: command.refreshHash
        });
        await newSession.save();
        return newSession;
    }
}
