import { ApiProperty } from '@nestjs/swagger';

export class PaginationMeta {
  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: 'Total number of items',
    example: 100,
  })
  totalCount: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 10,
  })
  totalPages: number;
}

export class BaseQueryResponse<T> {
  @ApiProperty({
    description: 'List of items',
    isArray: true,
  })
  data: T[];

  @ApiProperty({
    description: 'Pagination metadata',
    type: PaginationMeta,
  })
  meta: PaginationMeta;

  constructor({ data, meta }: { data: T[]; meta: PaginationMeta }) {
    this.data = data;
    this.meta = meta;
  }

  static create<T>({
    data,
    page,
    limit,
    totalCount,
  }: {
    data: T[];
    page: number;
    limit: number;
    totalCount: number;
  }): BaseQueryResponse<T> {
    return new BaseQueryResponse({
      data,
      meta: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  }
}
