import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Blog } from 'src/entyties/blogs.schema';
import { BlogsRepository } from '../blogs.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

interface IBlogPaganationQuery {
  searchNameTerm: string;
  sortBy: string;
  sortDirection: string;
  pageNumber: number;
  pageSize: number;
}

export class GetAllBlogsCommand {
  constructor(public paganationQuery: IBlogPaganationQuery) { }
}

@CommandHandler(GetAllBlogsCommand)
export class GetAllBlogsUseCase implements ICommandHandler<GetAllBlogsCommand> {
  constructor(
    @InjectModel(Blog.name) private blogModel: Model<Blog>,
    private readonly blogsRepo: BlogsRepository,
  ) { }

  async execute(command: GetAllBlogsCommand) {
    const pagonation = this.getPagonation(command.paganationQuery)

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
    const sotringQuery = this.blogsRepo.blogsSortingQuery(
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
      itemsToSkip
    }
  }

}
