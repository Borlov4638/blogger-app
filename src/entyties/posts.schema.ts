import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { LikeStatus } from '../enums/like-status.enum';

export type PostDocument = HydratedDocument<Post>;

@Schema()
export class Post {
  @Prop()
  _id: Types.ObjectId;
  @Prop()
  id: Types.ObjectId;
  @Prop()
  title: string;
  @Prop()
  shortDescription: string;
  @Prop()
  content: string;
  @Prop()
  blogId: Types.ObjectId;
  @Prop()
  blogName: string;
  @Prop()
  createdAt: string;
  @Prop({
    type: {
      usersWhoLiked: [{ userId: String, login: String, addedAt: Number }],
      usersWhoDisliked: [String],
    },
    // default:{usersWhoLiked:[], usersWhoDisliked:[]},
    _id: false,
  })
  likesInfo: {
    usersWhoLiked:
      | [
          {
            userId: string;
            login: string;
            addedAt: number;
          },
        ]
      | [];
    usersWhoDisliked: string[] | [];
  };
  @Prop({
    type: {
      likesCount: Number,
      dislikesCount: Number,
      myStatus: String,
      newestLikes: [{ addedAt: String, userId: String, login: String }],
    },
    // default:{likesCount:0, dislikesCount:0, myStatus:LikeStatus.NONE,newestLikes:[]},
    _id: false,
  })
  extendedLikesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: LikeStatus;
    newestLikes:
      | [
          {
            addedAt: string;
            userId: string;
            login: string;
          },
        ]
      | [];
  };
  like: Function;
  dislike: Function;
  resetLikeStatus: Function;
  getStatus: Function;
}

export const postSchema = SchemaFactory.createForClass(Post);

postSchema.methods.getStatus = function (userId: string) {
  const plainUsersWhoLiked = this.likesInfo.usersWhoLiked.map(
    (user) => user.userId,
  );
  const likeIndex = plainUsersWhoLiked.indexOf(userId);
  const dislikeIndex = this.likesInfo.usersWhoDisliked.indexOf(userId);
  if (likeIndex > -1) {
    return LikeStatus.LIKE;
  } else if (dislikeIndex > -1) {
    return LikeStatus.DISLIKE;
  } else {
    return LikeStatus.NONE;
  }
};
postSchema.methods.resetLikeStatus = function (userId: string) {
  const plainUsersWhoLiked = this.likesInfo.usersWhoLiked.map(
    (user) => user.userId,
  );
  const likeIndex = plainUsersWhoLiked.indexOf(userId);
  const dislikeIndex = this.likesInfo.usersWhoDisliked.indexOf(userId);
  if (likeIndex > -1) {
    this.likesInfo.usersWhoLiked.splice(likeIndex, 1);
  } else if (dislikeIndex > -1) {
    this.likesInfo.usersWhoDisliked.splice(dislikeIndex, 1);
  }
};

postSchema.methods.like = function (login: string, userId: string) {
  this.resetLikeStatus(userId);
  this.likesInfo.usersWhoLiked.push({ addedAt: +new Date(), userId, login });
};
postSchema.methods.dislike = function (userId: string) {
  this.resetLikeStatus(userId);
  this.likesInfo.usersWhoDisliked.push(userId);
};

postSchema.pre('save', function (next) {
  if (!this.likesInfo) {
    this.likesInfo = { usersWhoLiked: [], usersWhoDisliked: [] };
  }
  if (!this.extendedLikesInfo) {
    this.extendedLikesInfo = {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: LikeStatus.NONE,
      newestLikes: [],
    };
  }
  if (!this.createdAt) {
    this.createdAt = new Date().toISOString();
  }
  if (!this._id) {
    this._id = this.id = new Types.ObjectId();
  }
  next();
});
