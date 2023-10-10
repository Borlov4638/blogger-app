import { Request } from 'express';
import { add } from 'date-fns';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Session } from '../../../entyties/session.schema';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class RefreshCurrentSessionCommand {
    constructor(public req: Request, public expDate: number, public deviceId: string, public refreshHash: string) { }
}


@CommandHandler(RefreshCurrentSessionCommand)
export class RefreshCurrentSessionUseCase implements ICommandHandler<RefreshCurrentSessionCommand>  {
    constructor(
        @InjectModel(Session.name) private sessionModel: Model<Session>,
    ) { }
    async execute(command: RefreshCurrentSessionCommand) {
        const requestIp = (command.req.headers['x-forwarded-for'] as string) || command.req.socket.remoteAddress!;

        const userAgent = command.req.headers['user-agent']
            ? command.req.headers['user-agent']
            : 'Chrome 105';

        const refreshTokenExpirationDate = add(new Date(), {
            seconds: command.expDate,
        }).toISOString();

        const lastActiveDate = Math.floor(+new Date() / 1000) * 1000;

        const updatedSession = await this.sessionModel.findOneAndUpdate(
            { deviceId: command.deviceId },
            {
                ip: requestIp,
                title: userAgent,
                lastActiveDate: new Date(lastActiveDate).toISOString(),
                expiration: refreshTokenExpirationDate,
                refreshHash: command.refreshHash
            },
        );
        return updatedSession;
    }
}
