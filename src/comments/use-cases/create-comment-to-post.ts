import { NotFoundException } from "@nestjs/common";
import { CommandBus, CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { GetPostByIdCommand } from "src/posts/use-cases/get-post-by-id";
import { CommentRepository } from "../comments.repository";
import { CommentRepositoryPg } from "../comments.repository-pg";

interface IUsersAcessToken {
    id: string;
    email: string;
    login: string;
}

export class CreateCommentToPostCommand {
    constructor(public postId: string, public request: Request, public content: string) { }
}

@CommandHandler(CreateCommentToPostCommand)
export class CreateCommentToPostUseCase implements ICommandHandler<CreateCommentToPostCommand>{
    constructor(
        private commandBus: CommandBus,
        private jwtService: JwtService,
        private commentRepo: CommentRepositoryPg
    ) { }

    async execute(command: CreateCommentToPostCommand) {
        const postToComment = await this.commandBus.execute(new GetPostByIdCommand(command.postId, command.request))
        if (!postToComment) {
            throw new NotFoundException('no such post');
        }

        const token = command.request.headers.authorization.split(' ')[1];
        const tokenData: IUsersAcessToken = await this.jwtService.verifyAsync(
            token,
        );
        const commentatorInfo = {
            userId: tokenData.id,
            userLogin: tokenData.login,
        };

        return await this.commentRepo.createComment(commentatorInfo, command.content, command.postId)

    }

}