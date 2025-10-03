import { BaseQueryResponse } from '../shared';
import { CategoryDto } from './category.dto';

export class QueryCategoryResponse extends BaseQueryResponse<CategoryDto> {
  data: CategoryDto[];
}
