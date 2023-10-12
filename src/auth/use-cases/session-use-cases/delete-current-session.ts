import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { SessionRepository } from "src/auth/session.repository";

interface IUsersRefreshToken {
    id: string;
    email: string;
    login: string;
    deviceId: string;
}

export class DeleteCurrenSessionCommand {
    constructor(public request: Request) { }
}

@CommandHandler(DeleteCurrenSessionCommand)
export class DeleteCurrenSessionUseCase implements ICommandHandler<DeleteCurrenSessionCommand>{
    constructor(private jwtService: JwtService,
        private sessionRepo: SessionRepository
    ) { }

    async execute(command: DeleteCurrenSessionCommand) {
        const tokenData: IUsersRefreshToken = await this.jwtService.verifyAsync(
            command.request.cookies.refreshToken,
        );
        await this.sessionRepo.deleteSessionById(tokenData.deviceId);
        return;
    }

}