import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog } from './entyties/blogs.schema';
import { Model } from 'mongoose';
import { Post } from './entyties/posts.schema';
import { User } from './entyties/users.chema';
import { Comment } from './entyties/comments.schema';
import { Session } from './entyties/session.schema';

@Injectable()
export class AppService {
  constructor(
    @InjectModel(Blog.name) private blogsModel: Model<Blog>,
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
    @InjectModel(Session.name) private sessionModel: Model<Session>
  ) {}
  async deleteAllData(): Promise<void> {
    await this.blogsModel.deleteMany({});
    await this.postModel.deleteMany({});
    await this.userModel.deleteMany({});
    await this.commentModel.deleteMany({});
    await this.sessionModel.deleteMany({})
    return;
  }
}
