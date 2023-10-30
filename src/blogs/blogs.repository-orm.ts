import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { BlogEntity } from "./entitys/blogs.entity";
import { CreateBlogDto } from "./dto/blogs.dto";

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


export class BlogsRepositoryPg {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(BlogEntity) private blogsRepo: Repository<BlogEntity>
  ) { }

  blogsSortingQuery(sortBy: string) {
    switch (sortBy) {
      case 'id':
        return "id";
      case 'name':
        return "name";
      case 'description':
        return "description";
      case 'websiteUrl':
        return "websiteUrl";
      case 'isMembership':
        return "isMembership";
      case 'createdAt':
        return "createdAt";
      default:
        return "createdAt";
    }
  }

  async GetAllBlogs(paganationQuery: IBlogPaganationQuery) {
    const pagonation = this.getPagonation(paganationQuery);


    let blogsArray = await this.blogsRepo.createQueryBuilder("blogs")
      .select()
      .where("blogs.name ILIKE :nameTerm", { nameTerm: `%${pagonation.searchNameTerm}%` })
      .orderBy(`"${pagonation.sotringQuery}"`, pagonation.sortDirection as ("ASC" | "DESC"))
      .limit(pagonation.pageSize)
      .offset(pagonation.itemsToSkip)
      .groupBy("blogs.id")
      .getMany()

    // /////////////// Условие для теста, для сортировки по имени/////////////////
    // if (pagonation.sotringQuery === "name") {
    //   blogsArray = blogsArray.sort((a, b) => {
    //     if (a.name > b.name) {
    //       return 1
    //     }
    //     if (a.name < b.name) {
    //       return -1;
    //     }
    //     return 0;
    //   })

    // }
    // ///////////////////////////////////////////////////////////////////////////////
    blogsArray.map(b => {
      b.id = b.id.toString()
      return b
    })

    const totalCountOfItems = (await this.dataSource.query(`SELECT * FROM blogs WHERE "name" ILIKE '%${pagonation.searchNameTerm}%'`)).length

    const mappedResponse = {
      pagesCount: Math.ceil(totalCountOfItems / pagonation.pageSize),
      page: pagonation.pageNumber,
      pageSize: pagonation.pageSize,
      totalCount: totalCountOfItems,
      items: [...blogsArray],
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
    const sortDirection = paganationQuery.sortDirection === 'asc' ? 'ASC' : 'DESC';
    const sotringQuery = this.blogsSortingQuery(
      sortBy
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

  async createBlog(data: CreateBlogDto) {
    const newBlog = new BlogEntity()
    newBlog.description = data.description
    newBlog.websiteUrl = data.websiteUrl
    newBlog.name = data.name
    await this.blogsRepo.save(newBlog);
    newBlog.id = newBlog.id.toString()
    return newBlog
  }

  async deleteBlogById(blogId: string) {
    return (await this.blogsRepo.delete({ id: blogId })).affected
  }

  async getBlogById(blogId: string) {
    const blog = await this.blogsRepo.findOneBy({ id: blogId })
    if (!blog) {
      return false
    }
    blog.id = blog.id.toString()
    return blog
  }

  async updateBlogById(blogId: string, data: IUpdateBlog) {
    return (await this.blogsRepo.update(blogId, { name: data.name, description: data.description, websiteUrl: data.websiteUrl })).affected
  }

}
