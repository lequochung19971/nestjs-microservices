import { Type } from 'class-transformer';
import { BaseQueryResponse } from '../shared';
import { CategoryDto } from './category.dto';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsInstance,
  ValidateNested,
} from 'class-validator';

export class QueryCategoryResponse extends BaseQueryResponse<CategoryDto> {
  @ApiProperty({
    description: 'List of items',
    isArray: true,
    type: CategoryDto,
  })
  @IsArray()
  @IsNotEmpty()
  @IsInstance(CategoryDto)
  @ValidateNested({ each: true })
  @Type(() => CategoryDto)
  data: CategoryDto[];
}
