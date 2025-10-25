import { Injectable, Logger } from '@nestjs/common';

import {
  CreateCategoryDto,
  UpdateCategoryDto,
  QueryCategoryRequest,
  QueryCategoryResponse,
  CategoryDto,
} from 'nest-shared/contracts';
import { ApiClientService } from 'nest-shared/api-clients/api-client.service';
import { Request } from 'express';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);
  private readonly serviceName = 'categories';

  constructor(private readonly apiClientService: ApiClientService) {}

  async create(
    dto: CreateCategoryDto,
    headers?: Request['headers'],
  ): Promise<CategoryDto> {
    return this.apiClientService.products
      .POST('/categories', {
        body: {
          name: dto.name,
          slug: dto.slug,
          parentId: dto.parentId,
        },
        headers,
      })
      .then((response) => response.data as unknown as CategoryDto);
  }

  async findAll(
    query: QueryCategoryRequest,
    headers?: Request['headers'],
  ): Promise<QueryCategoryResponse> {
    return this.apiClientService.products
      .GET('/categories', {
        params: {
          query,
        },
        headers,
      })
      .then((response) => response.data as unknown as QueryCategoryResponse);
  }

  async findOne(
    id: string,
    headers?: Request['headers'],
  ): Promise<CategoryDto> {
    return this.apiClientService.products
      .GET('/categories/{id}', {
        params: {
          path: {
            id,
          },
        },
        headers,
      })
      .then((response) => response.data as unknown as CategoryDto);
  }

  async update(
    id: string,
    dto: UpdateCategoryDto,
    headers?: Request['headers'],
  ): Promise<CategoryDto> {
    return this.apiClientService.products
      .PATCH('/categories/{id}', {
        params: {
          path: {
            id,
          },
        },
        body: {
          name: dto.name,
          slug: dto.slug,
          parentId: dto.parentId,
        },
        headers,
      })
      .then((response) => response.data as unknown as CategoryDto);
  }

  async remove(id: string, headers?: Request['headers']): Promise<CategoryDto> {
    return this.apiClientService.products
      .DELETE('/categories/{id}', {
        params: {
          path: {
            id,
          },
        },
        headers,
      })
      .then((response) => response.data as unknown as CategoryDto);
  }
}
