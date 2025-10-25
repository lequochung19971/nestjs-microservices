import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class AdminQueryDto {
  @ApiPropertyOptional({
    description: 'Number of items to return',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Number of items to skip',
    example: 0,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Search term for username or email',
    example: 'admin',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Sort field',
    example: 'username',
    enum: ['username', 'email', 'createdTimestamp'],
  })
  @IsOptional()
  @IsString()
  sortBy?: 'username' | 'email' | 'createdTimestamp' = 'createdTimestamp';

  @ApiPropertyOptional({
    description: 'Sort order',
    example: 'desc',
    enum: ['asc', 'desc'],
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';

  @ApiPropertyOptional({
    description: 'Filter by exact role',
    example: 'admin',
  })
  @IsOptional()
  @IsString()
  role?: string;
}
