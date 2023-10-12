import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Session } from "src/entyties/session.schema";

@Injectable()
export class SessionRepository {
    constructor(@InjectModel(Session.name) private sessionModel: Model<Session>) { }

    async findSessionByRefreshHash(refreshHash: string) {
        return await this.sessionModel.findOne({ refreshHash })
    }
    async refreshCurrentSession(deviceId: string, ip: string, title: string, expiration: string, refreshHash: string, lastActiveDate: number) {
        const updatedSession = await this.sessionModel.findOneAndUpdate(
            { deviceId },
            {
                ip,
                title,
                lastActiveDate: new Date(lastActiveDate).toISOString(),
                expiration,
                refreshHash
            },
        );
        return updatedSession
    }
}