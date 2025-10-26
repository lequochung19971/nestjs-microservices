import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiProperty,
  ApiResponse,
  ApiResponseOptions,
  ApiSchema,
  getSchemaPath,
} from '@nestjs/swagger';

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

export const ApiQueryResponse = <TModel extends Type<any>>(
  model: TModel,
  options?: ApiResponseOptions,
) => {
  const finalName = model.name.toLowerCase().includes('dto')
    ? `${model.name.replace(/dto/gi, '')}QueryResponse`
    : `${model.name}QueryResponse`;

  @ApiSchema({ name: finalName })
  class CustomQueryResponse extends BaseQueryResponse<TModel> {
    @ApiProperty({
      description: 'List of items',
      isArray: true,
      type: model,
    })
    data: TModel[];
  }

  // 2. Return the combined Swagger decorators
  return applyDecorators(
    // Ensure all base models are available
    ApiExtraModels(CustomQueryResponse, PaginationMeta, model),

    ApiResponse({
      ...options,
      schema: {
        allOf: [
          // Use the dynamic class's generated schema path
          { $ref: getSchemaPath(CustomQueryResponse) },
          {
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
            },
          },
        ],
      },
    }),
  );
};
