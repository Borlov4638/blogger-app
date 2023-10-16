import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Post } from 'src/entyties/posts.schema';
import { PostRepository } from '../posts.repository';
import { LikeStatus } from 'src/enums/like-status.enum';


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

export class GetAllPostsCommand {
  constructor(public postPagonationQuery: IPostPaganationQuery, public request: Request) { }
}

@CommandHandler(GetAllPostsCommand)
export class GetAllPostsUseCase implements ICommandHandler<GetAllPostsCommand> {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    private readonly postRepo: PostRepository,
    private readonly jwtService: JwtService,
  ) { }

  async execute(command: GetAllPostsCommand) {
    const sortBy = command.postPagonationQuery.sortBy
      ? command.postPagonationQuery.sortBy
      : 'createdAt';
    const sortDirection = command.postPagonationQuery.sortDirection === 'asc' ? 1 : -1;
    const sotringQuery = this.postRepo.postsSortingQuery(sortBy, sortDirection);
    const pageNumber = command.postPagonationQuery.pageNumber
      ? +command.postPagonationQuery.pageNumber
      : 1;
    const pageSize = command.postPagonationQuery.pageSize
      ? +command.postPagonationQuery.pageSize
      : 10;
    const itemsToSkip = (pageNumber - 1) * pageSize;

    const findedPosts = await this.postModel
      .find({}, { _id: false, __v: false })
      .sort(sotringQuery)
      .skip(itemsToSkip)
      .limit(pageSize);

    const token = command.request.headers.authorization;
    let myStatus: string = LikeStatus.NONE;
    let user: IUsersAcessToken;
    const postsToShow = findedPosts.map((post) => {
      if (token) {
        try {
          user = this.jwtService.verify(
            command.request.headers.authorization.split(' ')[1],
          );
        } catch {
          user = null;
        }
        if (user) {
          console.log(post);
          myStatus = post.getStatus(user.id);
        }
      }
      const newestLikes = post.likesInfo.usersWhoLiked
        //@ts-ignore
        .sort((a, b) => b.addedAt - a.addedAt)
        .slice(0, 3);

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
      console.log(extendedLikesInfo);
      return { ...postToReturn, extendedLikesInfo };
    });

    const totalCountOfItems = (await this.postModel.find({})).length;

    const mappedResponse = {
      pagesCount: Math.ceil(totalCountOfItems / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCountOfItems,
      items: [...postsToShow],
    };

    return mappedResponse;
  }

}
