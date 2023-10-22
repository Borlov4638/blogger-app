import { CommandBus, CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CommentRepositoryPg } from "src/comments/comments.repository-pg";
import { PostsCommentsPaganation } from "../../posts/dto/post.dto";
import { NotFoundException } from "@nestjs/common";
import { LikeStatus } from "src/enums/like-status.enum";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { GetPostByIdCommand } from "src/posts/use-cases/get-post-by-id";

export class GetAllPostsCommentsCommand {
  constructor(
    public postId: string,
    public postsCommentsPaganation: PostsCommentsPaganation,
    public request: Request,
  ) { }
}

@CommandHandler(GetAllPostsCommentsCommand)
export class GetAllPostsCommentsUseCase implements ICommandHandler<GetAllPostsCommentsCommand>{
  constructor(
    private commandBus: CommandBus,
    private commentRepo: CommentRepositoryPg,
  ) { }

  async execute(command: GetAllPostsCommentsCommand) {
    console.log(command.postsCommentsPaganation)
    await this.commandBus.execute(new GetPostByIdCommand(command.postId, command.request))
    return await this.commentRepo.getAllCommentsInPost(command.postsCommentsPaganation, command.postId, command.request)
  }

}