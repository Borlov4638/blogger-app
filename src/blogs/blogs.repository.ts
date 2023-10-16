import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Blog, BlogDocument } from "src/entyties/blogs.schema";

interface IBlogPaganationQuery {
  searchNameTerm: string;
  sortBy: string;
  sortDirection: string;
  pageNumber: number;
  pageSize: number;
}

interface IUpdateBlog {
  name: string;
  description: string;
  websiteUrl: string;
}


export class BlogsRepository {
  constructor(@InjectModel(Blog.name) private blogModel: Model<Blog>) { }

  blogsSortingQuery(sortBy: string, sortDirection: number): {} {
    switch (sortBy) {
      case 'id':
        return { id: sortDirection };
      case 'name':
        return { name: sortDirection };
      case 'description':
        return { description: sortDirection };
      case 'websiteUrl':
        return { websiteUrl: sortDirection };
      case 'isMembership':
        return { isMembership: sortDirection };
      case 'createdAt':
        return { createdAt: sortDirection };
      default:
        return { createdAt: 1 };
    }
  }

  async GetAllBlogs(paganationQuery: IBlogPaganationQuery) {
    const pagonation = this.getPagonation(paganationQuery);

    const findedBlogs = await this.blogModel
      .find(
        { name: { $regex: pagonation.searchNameTerm, $options: 'i' } },
        { _id: false, __v: false },
      )
      .sort(pagonation.sotringQuery)
      .skip(pagonation.itemsToSkip)
      .limit(pagonation.pageSize);

    const totalCountOfItems = (
      await this.blogModel.find({
        name: { $regex: pagonation.searchNameTerm, $options: 'i' },
      })
    ).length;

    const mappedResponse = {
      pagesCount: Math.ceil(totalCountOfItems / pagonation.pageSize),
      page: pagonation.pageNumber,
      pageSize: pagonation.pageSize,
      totalCount: totalCountOfItems,
      items: [...findedBlogs],
    };

    return mappedResponse;
  }

  private getPagonation(paganationQuery: IBlogPaganationQuery) {
    const searchNameTerm = paganationQuery.searchNameTerm
      ? paganationQuery.searchNameTerm
      : '';
    const sortBy = paganationQuery.sortBy
      ? paganationQuery.sortBy
      : 'createdAt';
    const sortDirection = paganationQuery.sortDirection === 'asc' ? 1 : -1;
    const sotringQuery = this.blogsSortingQuery(
      sortBy,
      sortDirection,
    );
    const pageNumber = paganationQuery.pageNumber
      ? +paganationQuery.pageNumber
      : 1;
    const pageSize = paganationQuery.pageSize ? +paganationQuery.pageSize : 10;
    const itemsToSkip = (pageNumber - 1) * pageSize;
    return {
      searchNameTerm,
      sortBy,
      sortDirection,
      sotringQuery,
      pageNumber,
      pageSize,
      itemsToSkip,
    };
  }

  async createBlog(data) {
    const createdBlog = new this.blogModel(data);
    return await createdBlog.save().then((savedBlog) => {
      const plainBlog: BlogDocument = savedBlog.toObject();
      delete plainBlog._id;
      delete plainBlog.__v;
      return plainBlog;
    });
  }

  async deleteBlogById(blogId: string) {
    return await this.blogModel.findOneAndDelete({
      _id: new Types.ObjectId(blogId),
    });
  }

  async getBlogById(blogId: string) {
    return await this.blogModel
      .findById(
        new Types.ObjectId(blogId),
        { _id: false, __v: false },
        { lean: true },
      )
      .exec();
  }

  async updateBlogById(blogId: string, data: IUpdateBlog) {
    const blogToUpdate = await this.blogModel.findById(
      new Types.ObjectId(blogId),
    );
    if (blogToUpdate) {
      return 0
    }
    blogToUpdate.name = data.name;
    blogToUpdate.description = data.description;
    blogToUpdate.websiteUrl = data.websiteUrl;
    await blogToUpdate.save();
    return 1
  }


}
