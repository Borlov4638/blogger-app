import { NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { Blog } from 'src/entyties/blogs.schema';
import { PostRepository } from '../posts.repository';
import { Post, PostDocument } from 'src/entyties/posts.schema';
import { LikeStatus } from 'src/enums/like-status.enum';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

interface IPostPaganationQuery {
    sortBy: string;
    sortDirection: string;
    pageNumber: number;
    pageSize: number;
}

interface IUsersAcessToken {
    id: string;
    email: string;
    login: string;
}

export class GetAllPostsInBlogCommand {
    constructor(public postPagonationQuery: IPostPaganationQuery, public blogId: string, public request: Request) { }
}

@CommandHandler(GetAllPostsInBlogCommand)
export class GetAllPostsInBlogUseCase implements ICommandHandler<GetAllPostsInBlogCommand>  {
    constructor(
        @InjectModel(Post.name) private postModel: Model<Post>,
        @InjectModel(Blog.name) private blogModel: Model<Blog>,
        private readonly postRepo: PostRepository,
        private readonly jwtService: JwtService,
    ) { }

    async execute(command: GetAllPostsInBlogCommand) {
        const blogToFindPosts = await this.blogModel.findById(
            new Types.ObjectId(command.blogId),
        );
        if (!blogToFindPosts) {
            throw new NotFoundException();
        }
        const pagonation = this.paganation(command.postPagonationQuery)

        const findedPosts = await this.postModel
            .find({ blogId: command.blogId }, { _id: false, __v: false })
            .sort(pagonation.sotringQuery)
            .skip(pagonation.itemsToSkip)
            .limit(pagonation.pageSize);

        let token: string
        try {
            token = command.request.headers.authorization.split(' ')[1];
        }
        catch {
            token = null
        }
        const postsToShow = this.transformPostToReturn(findedPosts, token)

        const totalCountOfItems = (await this.postModel.find({ blogId: command.blogId })).length;

        const mappedResponse = {
            pagesCount: Math.ceil(totalCountOfItems / pagonation.pageSize),
            page: pagonation.pageNumber,
            pageSize: pagonation.pageSize,
            totalCount: totalCountOfItems,
            items: [...postsToShow],
        };

        return mappedResponse;
    }

    paganation(postPagonationQuery: IPostPaganationQuery) {
        const sortBy = postPagonationQuery.sortBy
            ? postPagonationQuery.sortBy
            : 'createdAt';
        const sortDirection = postPagonationQuery.sortDirection === 'asc' ? 1 : -1;
        const sotringQuery = this.postRepo.postsSortingQuery(sortBy, sortDirection);
        const pageNumber = postPagonationQuery.pageNumber
            ? +postPagonationQuery.pageNumber
            : 1;
        const pageSize = postPagonationQuery.pageSize
            ? +postPagonationQuery.pageSize
            : 10;
        const itemsToSkip = (pageNumber - 1) * pageSize;
        return { sortBy, sortDirection, sotringQuery, pageNumber, pageSize, itemsToSkip }
    }

    transformPostToReturn(findedPosts: PostDocument[], token: string) {
        let myStatus: string = LikeStatus.NONE;
        let user: IUsersAcessToken;
        const postsToShow = findedPosts.map((post) => {
            if (token) {
                try {
                    user = this.jwtService.verify(token);
                } catch {
                    user = null;
                }
                if (user) {
                    myStatus = post.getStatus(user.id);
                }
            }
            let newestLikes;
            try {
                newestLikes = post.likesInfo.usersWhoLiked
                    //@ts-ignore
                    .sort((a, b) => b.addedAt - a.addedAt)
                    .slice(0, 3);
            } catch {
                newestLikes = [];
            }
            const extendedLikesInfo = {
                likesCount: post.likesInfo.usersWhoLiked.length,
                dislikesCount: post.likesInfo.usersWhoDisliked.length,
                myStatus,
                newestLikes: newestLikes.map((usr) => {
                    return {
                        userId: usr.userId,
                        login: usr.login,
                        addedAt: new Date(usr.addedAt).toISOString(),
                    };
                }),
            };
            const postToReturn = { ...post.toObject() };
            delete postToReturn.likesInfo;
            return { ...postToReturn, extendedLikesInfo };
        });

        return postsToShow

    }

}

