import {
    NotFoundException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Blog } from '../../entyties/blogs.schema';
import { Post, PostDocument } from '../../entyties/posts.schema';

interface ICreatePost {
    title: string;
    shortDescription: string;
    content: string;
}

export class CreatePostCommand {
    constructor(public data: ICreatePost, public blogId: string) { }
}
@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
    constructor(
        @InjectModel(Post.name) private postModel: Model<Post>,
        @InjectModel(Blog.name) private blogModel: Model<Blog>,
    ) { }

    async execute(command: CreatePostCommand) {
        const blogToPost = await this.blogModel
            .findById(new Types.ObjectId(command.blogId))
            .exec();
        if (!blogToPost) {
            throw new NotFoundException();
        }
        const newPost = new this.postModel({
            ...command.data,
            blogId: command.blogId,
            blogName: blogToPost.name,
        });
        return await newPost.save().then((newPost) => {
            const plainPost: PostDocument = newPost.toObject();
            delete plainPost.__v;
            delete plainPost._id;
            delete plainPost.likesInfo;
            return plainPost;
        });
    }
}
