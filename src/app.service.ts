import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog } from './entyties/blogs.schema';
import { Model } from 'mongoose';
import { Post } from './entyties/posts.schema';
import { User } from './entyties/users.chema';

@Injectable()
export class AppService {
  constructor(
    @InjectModel(Blog.name) private blogsModel: Model<Blog>,
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}
  async deleteAllData(): Promise<void> {
    await this.blogsModel.deleteMany({});
    await this.postModel.deleteMany({});
    await this.userModel.deleteMany({});
    return;
  }
}
