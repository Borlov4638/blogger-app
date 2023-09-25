import { Module } from '@nestjs/common';
import { BlogsController } from './blogs.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from 'src/entyties/blogs.schema';
import { BlogsService } from './blogs.service';
import { BlogsRepository } from './blogs.repository';

@Module({
  controllers: [BlogsController],
  imports: [
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
  ],
  providers: [BlogsService, BlogsRepository],
})
export class BlogsModule {}
