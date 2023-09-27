export class PostRepository {
  postsSortingQuery(sortBy: string, sortDirection: number): {} {
    switch (sortBy) {
      case 'id':
        return { id: sortDirection };
      case 'title':
        return { title: sortDirection };
      case 'shortDescription':
        return { shortDescription: sortDirection };
      case 'content':
        return { content: sortDirection };
      case 'blogId':
        return { blogId: sortDirection };
      case 'blogName':
        return { blogName: sortDirection };
      case 'createdAt':
        return { createdAt: sortDirection };
      default:
        return { createdAt: 1 };
    }
  }
}
