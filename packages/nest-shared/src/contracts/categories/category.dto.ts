import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CategoryDto {
  @IsUUID()
  @ApiProperty({
    description: 'Category ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @IsString()
  @ApiProperty({
    description: 'Category name',
    example: 'Electronics',
  })
  name: string;

  @IsString()
  @ApiProperty({
    description: 'Category slug',
    example: 'electronics',
  })
  slug: string;

  @IsOptional()
  @IsUUID()
  @ApiProperty({
    description: 'Parent category ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  parentId?: string | null;

  @IsDate()
  @IsOptional()
  @ApiProperty({
    description: 'Category created at',
    example: '2021-01-01T00:00:00.000Z',
  })
  createdAt?: Date;

  @IsDate()
  @IsOptional()
  @ApiProperty({
    description: 'Category updated at',
    example: '2021-01-01T00:00:00.000Z',
  })
  updatedAt?: Date;

  @IsOptional()
  @IsArray()
  @IsOptional()
  @ApiProperty({
    description: 'Category children',
    type: [CategoryDto],
  })
  @ValidateNested({ each: true })
  @Type(() => CategoryDto)
  children?: CategoryDto[];

  constructor(data: CategoryDto) {
    Object.assign(this, data);
  }
}
