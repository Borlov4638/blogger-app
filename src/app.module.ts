import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogsModule } from './blogs/blogs.module';
import { PostsModule } from './posts/posts.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://mrwiggle40000:OErZka7OiZTiToGx@cluster0.dt0bgxc.mongodb.net/incubator',
    ),
    BlogsModule, PostsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}