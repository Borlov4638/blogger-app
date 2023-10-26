import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class AppService {
  constructor(
    private dataSource: DataSource
    // @InjectModel(Blog.name) private blogsModel: Model<Blog>,
    // @InjectModel(Post.name) private postModel: Model<Post>,
    // @InjectModel(User.name) private userModel: Model<User>,
    // @InjectModel(Comment.name) private commentModel: Model<Comment>,
    // @InjectModel(Session.name) private sessionModel: Model<Session>,
  ) { }
  async deleteAllData(): Promise<void> {
    await this.dataSource.query(`
    DELETE FROM users;
    DELETE FROM sessions;
    DELETE FROM blogs;
    DELETE FROM posts;
    `)

    // await this.blogsModel.deleteMany({});
    // await this.postModel.deleteMany({});
    // await this.userModel.deleteMany({});
    // await this.commentModel.deleteMany({});
    // await this.sessionModel.deleteMany({});
    return;
  }
}
