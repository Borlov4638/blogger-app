import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogsModule } from './blogs/blogs.module';
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comments.module';
import { UsersModule } from './users/users.module';
import { Blog, BlogSchema } from './entyties/blogs.schema';
import { Post, postSchema } from './entyties/posts.schema';
import { User, usersSchema } from './entyties/users.chema';
import { AuthModule } from './auth/auth.module';
import { UtilsModule } from './utils/utils.moduls';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://mrwiggle40000:OErZka7OiZTiToGx@cluster0.dt0bgxc.mongodb.net/incubator',
    ),
    AuthModule,
    BlogsModule,
    PostsModule,
    CommentsModule,
    UsersModule,
    UtilsModule,
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: postSchema },
      { name: User.name, schema: usersSchema },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
