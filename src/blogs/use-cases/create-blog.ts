import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Blog, BlogDocument } from '../../entyties/blogs.schema';
import { CreateBlogDto } from '../dto/blogs.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';


export class CreateBlogCommand {
  constructor(public data: CreateBlogDto) { }
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand>{
  constructor(
    @InjectModel(Blog.name) private blogModel: Model<Blog>,
  ) { }

  async execute(command: CreateBlogCommand) {
    const createdBlog = new this.blogModel(command.data);
    return await createdBlog.save().then((savedBlog) => {
      const plainBlog: BlogDocument = savedBlog.toObject();
      delete plainBlog._id;
      delete plainBlog.__v;
      return plainBlog;
    });
  }
}
