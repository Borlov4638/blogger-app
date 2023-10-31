import { NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

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
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  blogsSortingQuery(sortBy: string): {} {
    switch (sortBy) {
      case 'id':
        return 'id';
      case 'name':
        return 'name';
      case 'description':
        return 'description';
      case 'websiteUrl':
        return 'websiteUrl';
      case 'isMembership':
        return 'isMembership';
      case 'createdAt':
        return 'createdAt';
      default:
        return 'createdAt';
    }
  }

  async GetAllBlogs(paganationQuery: IBlogPaganationQuery) {
    const pagonation = this.getPagonation(paganationQuery);

    const blogsArray = await this.dataSource.query(`
      SELECT * FROM blogs
      WHERE lower ("name") LIKE LOWER ('%${pagonation.searchNameTerm}%')
      ORDER BY "${pagonation.sortBy}" ${pagonation.sortDirection}
      LIMIT ${pagonation.pageSize}
      OFFSET (${pagonation.itemsToSkip})
    `);
    blogsArray.map((b) => {
      b.id = b.id.toString();
      return b;
    });
    const totalCountOfItems = (
      await this.dataSource.query(
        `SELECT * FROM blogs WHERE lower ("name") LIKE LOWER ('%${pagonation.searchNameTerm}%')`,
      )
    ).length;

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
    const sortDirection =
      paganationQuery.sortDirection === 'asc' ? 'asc' : 'desc';
    const sotringQuery = this.blogsSortingQuery(sortBy);
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
    const newBlog = (
      await this.dataSource
        .query(`INSERT INTO blogs ("name", "description", "websiteUrl") VALUES ('${data.name}', '${data.description}', '${data.websiteUrl}')
    RETURNING *;
    `)
    )[0];
    newBlog.id = newBlog.id.toString();
    return newBlog;
  }

  async deleteBlogById(blogId: string) {
    return (
      await this.dataSource.query(`DELETE FROM blogs WHERE "id" = '${blogId}'`)
    )[1];
  }

  async getBlogById(blogId: string) {
    const blog = (
      await this.dataSource.query(
        `SELECT * FROM blogs WHERE "id" = '${blogId}'`,
      )
    )[0];
    if (!blog) {
      return false;
    }
    blog.id = blog.id.toString();
    return blog;
  }

  async updateBlogById(blogId: string, data: IUpdateBlog) {
    const isBlogExists = (
      await this.dataSource.query(
        `SELECT * FROM blogs WHERE "id" = '${blogId}'`,
      )
    )[0];
    if (!isBlogExists) {
      throw new NotFoundException('Blog not found');
    }

    return await this.dataSource
      .query(`UPDATE blogs SET "name" = '${data.name}', "description" = '${data.description}', "websiteUrl" = '${data.websiteUrl}'
      WHERE "id" = '${blogId}'
    `);
  }
}
