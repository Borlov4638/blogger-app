import { ConfigModule } from '@nestjs/config';
const configModule = ConfigModule.forRoot()

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
import { Session, sessionSchema } from './entyties/session.schema';
import { SecDevModule } from './security-devices/sec-dev.module';
import { Comment, commentsSchema } from './entyties/comments.schema';
import { ThrottlerModule } from '@nestjs/throttler';

let imports = []
if (process.env.DATABASE === 'mongo') {
  imports = [
    MongooseModule.forRoot(
      'mongodb+srv://mrwiggle40000:OErZka7OiZTiToGx@cluster0.dt0bgxc.mongodb.net/incubator',
    ),
    MongooseModule.forFeature([
      { name: Comment.name, schema: commentsSchema },
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: postSchema },
      { name: User.name, schema: usersSchema },
      { name: Session.name, schema: sessionSchema },
    ]),
  ]
} else if (process.env.DATABASE === 'postgres') {

}


@Module({
  imports: [
    ...imports,
    configModule,
    // AuthModule,
    // BlogsModule,
    // PostsModule,
    // CommentsModule,
    UsersModule,
    UtilsModule,
    // SecDevModule,
    ThrottlerModule.forRoot([
      {
        ttl: 10000,
        limit: 5,
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
