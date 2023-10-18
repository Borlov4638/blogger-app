import { CommandBus, CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { GetAllPostsInBlogCommand, IPostPaganationQuery } from "./get-posts-by-blog-id";
import { Request } from "express";
import { ForbiddenException } from "@nestjs/common";
import { UpdatePostCommand } from "./update-post";
interface IPostUpdate {
    title: string;
    shortDescription: string;
    content: string;
    blogId: string
}

export class UpdatePostAssignedToBlogCommand {
    constructor(public postId: string, public blogId: string, public request: Request, public data: IPostUpdate) { }
}
@CommandHandler(UpdatePostAssignedToBlogCommand)
export class UpdatePostAssignedToBlogUseCase implements ICommandHandler<UpdatePostAssignedToBlogCommand>{
    constructor(
        private commandBus: CommandBus
    ) { }

    async execute(command: UpdatePostAssignedToBlogCommand): Promise<any> {
        const blogPostsIds = (await this.commandBus.execute(new GetAllPostsInBlogCommand({ pageSize: 1000 } as any, command.blogId, command.request))).items
            .map(p => p.id)

        if (blogPostsIds.indexOf(command.postId) === -1) {
            throw new ForbiddenException()
        }
        await this.commandBus.execute(new UpdatePostCommand(command.postId, command.data))
        return
    }
}