import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { BaseQueryRequest, BaseQueryResponse } from '../shared';
import { CustomerDto } from './customer.dto';

export class QueryCustomerRequestDto extends BaseQueryRequest {
  @ApiPropertyOptional({ description: 'Search term for filtering customers' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}

export class QueryCustomerResponseDto extends BaseQueryResponse<CustomerDto> {
  @ApiPropertyOptional({ description: 'List of customers' })
  @Type(() => CustomerDto)
  data: CustomerDto[];
}
