import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Comment, commentsSchema } from "src/entyties/comments.schema";

@Module({
    imports:[MongooseModule.forFeature([{name:Comment.name, schema:commentsSchema}])]
})
export class CommentsModule{}