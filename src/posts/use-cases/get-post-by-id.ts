import {
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { Post } from '../../entyties/posts.schema';
import { LikeStatus } from '../../enums/like-status.enum';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

interface IUsersAcessToken {
    id: string;
    email: string;
    login: string;
}

export class GetPostByIdCommand {
    constructor(public postId: string, public request: Request) { }
}

@CommandHandler(GetPostByIdCommand)
export class GetPostByIdUseCase implements ICommandHandler<GetPostByIdCommand> {
    constructor(
        @InjectModel(Post.name) private postModel: Model<Post>,
        private readonly jwtService: JwtService,
    ) { }

    async execute(command: GetPostByIdCommand) {
        const findedPost = await this.postModel.findById(
            new Types.ObjectId(command.postId),
            { _id: false, __v: false },
        );

        if (!findedPost) {
            throw new NotFoundException('no such post');
        }
        const token = command.request.headers.authorization;
        let myStatus = LikeStatus.NONE;
        let user: IUsersAcessToken;
        if (token) {
            try {
                const decodedToken = command.request.headers.authorization.split(' ')[1];
                user = await this.jwtService.verifyAsync(decodedToken);
            } catch {
                user = null;
            }
            if (user) {
                myStatus = findedPost.getStatus(user.id);
            }
        }
        const newestLikes = findedPost.likesInfo.usersWhoLiked
            //@ts-ignore
            .sort((a, b) => b.addedAt - a.addedAt)
            .slice(0, 3);

        const extendedLikesInfo = {
            likesCount: findedPost.likesInfo.usersWhoLiked.length,
            dislikesCount: findedPost.likesInfo.usersWhoDisliked.length,
            myStatus,
            newestLikes: newestLikes.map((usr) => {
                return {
                    userId: usr.userId,
                    login: usr.login,
                    addedAt: new Date(usr.addedAt).toISOString(),
                };
            }),
        };
        const postToReturn = { ...findedPost.toObject() };
        delete postToReturn.likesInfo;
        return { ...postToReturn, extendedLikesInfo };
    }
}
