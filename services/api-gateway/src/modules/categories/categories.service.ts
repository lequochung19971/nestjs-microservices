import { Injectable, Logger } from '@nestjs/common';
import {
  ProxyService,
  Headers,
  QueryParams,
} from '../../services/proxy.service';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  QueryCategoryRequest,
  QueryCategoryResponse,
  CategoryDto,
} from 'nest-shared/contracts';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);
  private readonly serviceName = 'products';

  constructor(private readonly proxyService: ProxyService) {}

  async create(dto: CreateCategoryDto, headers: Headers): Promise<CategoryDto> {
    return this.proxyService.post<CategoryDto>(
      this.serviceName,
      '/categories',
      dto as unknown as Record<string, unknown>,
      headers,
    );
  }

  async findAll(
    query: QueryCategoryRequest,
    headers: Headers,
  ): Promise<QueryCategoryResponse> {
    const queryParams: QueryParams = {};

    if (query.search) queryParams.search = query.search;
    if (query.page) queryParams.page = query.page.toString();
    if (query.limit) queryParams.limit = query.limit.toString();
    if (query.sortBy) queryParams.sortBy = query.sortBy;
    if (query.sortOrder) queryParams.sortOrder = query.sortOrder;
    if (query.parentId !== undefined) queryParams.parentId = query.parentId;
    if (query.flat !== undefined) queryParams.flat = query.flat.toString();

    return this.proxyService.get<QueryCategoryResponse>(
      this.serviceName,
      '/categories',
      headers,
      queryParams,
    );
  }

  async findOne(id: string, headers: Headers): Promise<CategoryDto> {
    return this.proxyService.get<CategoryDto>(
      this.serviceName,
      `/categories/${id}`,
      headers,
    );
  }

  async update(
    id: string,
    dto: UpdateCategoryDto,
    headers: Headers,
  ): Promise<CategoryDto> {
    return this.proxyService.patch<CategoryDto>(
      this.serviceName,
      `/categories/${id}`,
      dto as unknown as Record<string, unknown>,
      headers,
    );
  }

  async remove(id: string, headers: Headers): Promise<CategoryDto> {
    return this.proxyService.delete<CategoryDto>(
      this.serviceName,
      `/categories/${id}`,
      headers,
    );
  }
}
