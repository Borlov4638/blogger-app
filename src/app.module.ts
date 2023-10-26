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
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
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
  imports = [TypeOrmModule.forRoot({
    type: 'postgres',
    host: 'ep-bold-wind-11658677.eu-central-1.aws.neon.tech',
    port: 5432,
    username: 'mrwiggle40000',
    password: 'rpc7qBw1uAjQ',
    database: 'test',
    ssl: true,
    entities: [],
    synchronize: true,
    autoLoadEntities: true
  })]
}


@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 10,
        limit: 5,
      },
    ]),
    ...imports,
    JwtModule.register({
      secret: 'dhcfgvhbjnkmjbhvgjfgfcjhvkbljnknjbhvghjg',
      global: true,
    }),
    configModule,
    AuthModule,
    BlogsModule,
    PostsModule,
    CommentsModule,
    UsersModule,
    UtilsModule,
    SecDevModule,
  ],
  controllers: [
    AppController
  ],
  providers: [
    AppService
  ],
})
export class AppModule { }
