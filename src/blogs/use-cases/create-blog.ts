import { CreateBlogDto } from '../dto/blogs.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepositoryPg } from '../blogs.repository-pg';

export class CreateBlogCommand {
  constructor(public data: CreateBlogDto) { }
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  constructor(
    private blogRepo: BlogsRepositoryPg
  ) { }

  async execute(command: CreateBlogCommand) {
    return await this.blogRepo.createBlog(command.data)
  }
}
