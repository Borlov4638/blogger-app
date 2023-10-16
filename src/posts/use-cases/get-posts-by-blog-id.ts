import { NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { Blog } from '../../entyties/blogs.schema';
import { PostRepository } from '../posts.repository';
import { Post, PostDocument } from '../../entyties/posts.schema';
import { LikeStatus } from '../../enums/like-status.enum';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GetBlogByIdCommand } from 'src/blogs/use-cases/get-blog-by-id';

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
  constructor(
    public postPagonationQuery: IPostPaganationQuery,
    public blogId: string,
    public request: Request,
  ) { }
}

@CommandHandler(GetAllPostsInBlogCommand)
export class GetAllPostsInBlogUseCase
  implements ICommandHandler<GetAllPostsInBlogCommand>
{
  constructor(
    private commandBus: CommandBus,
    private readonly postRepo: PostRepository,
    private readonly jwtService: JwtService,
  ) { }

  async execute(command: GetAllPostsInBlogCommand) {
    const blogToFindPosts = await this.commandBus.execute(new GetBlogByIdCommand(command.blogId))

    if (!blogToFindPosts) {
      throw new NotFoundException();
    }
    const pagonation = this.paganation(command.postPagonationQuery);

    const findedPosts = await this.postRepo.getPostsByBlogPagonation(pagonation, command.blogId)

    let token: string;
    try {
      token = command.request.headers.authorization.split(' ')[1];
    } catch {
      token = null;
    }
    const postsToShow = this.transformPostToReturn(findedPosts, token);

    const totalCountOfItems = (
      await this.postRepo.getAllPostsByBlogId(command.blogId)
    ).length;

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
    return {
      sortBy,
      sortDirection,
      sotringQuery,
      pageNumber,
      pageSize,
      itemsToSkip,
    };
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

    return postsToShow;
  }
}
