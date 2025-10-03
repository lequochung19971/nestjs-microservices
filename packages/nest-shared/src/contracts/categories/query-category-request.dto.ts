import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import {
  SortOrder,
  SortField,
  BaseQueryRequest,
} from '../shared/base-query-request.dto';

export class QueryCategoryRequest extends BaseQueryRequest {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(SortField)
  sortBy?: SortField = SortField.NAME;

  @IsOptional()
  @IsString()
  parentId?: string;

  @IsOptional()
  @Type(() => Boolean)
  flat?: boolean = false;
}
