import { CreateBlogDto } from '../dto/blogs.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../blogs.repository';

export class CreateBlogCommand {
  constructor(public data: CreateBlogDto) { }
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  constructor(
    private blogRepo: BlogsRepository
  ) { }

  async execute(command: CreateBlogCommand) {
    return await this.blogRepo.createBlog(command.data)
  }
}
