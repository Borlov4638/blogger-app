import { NotFoundException } from "@nestjs/common";
import { CommandBus, CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { JwtService } from "@nestjs/jwt";
import { InjectModel } from "@nestjs/mongoose";
import { InjectDataSource } from "@nestjs/typeorm";
import { Request } from "express";
import { Model, Types } from "mongoose";
import { Post } from "src/entyties/posts.schema";
import { LikeStatus } from "src/enums/like-status.enum";
import { GetPostByIdCommand } from "./get-post-by-id";
import { PostRepository } from "../posts.repository";
import { PostRepositoryPg } from "../posts.repository-pg";

interface IUsersAcessToken {
    id: string;
    email: string;
    login: string;
}


export class ChangePostsLikeStatusCommand {
    constructor(
        public postId: string,
        public likeStatus: LikeStatus,
        public request: Request,
    ) { }
}

@CommandHandler(ChangePostsLikeStatusCommand)
export class ChangePostsLikeStatusUseCase implements ICommandHandler<ChangePostsLikeStatusCommand>{
    constructor(
        private postRepo: PostRepositoryPg,
        private jwtService: JwtService
    ) { }

    async execute(command: ChangePostsLikeStatusCommand) {
        const post = await this.postRepo.findPostById(command.postId)
        if (!post) {
            throw new NotFoundException()
        }

        const user: IUsersAcessToken = await this.jwtService.verifyAsync(
            command.request.headers.authorization.split(' ')[1],
        );

        await this.postRepo.changePostLikeStatus(post, user, command.likeStatus)
        return;
    }

}