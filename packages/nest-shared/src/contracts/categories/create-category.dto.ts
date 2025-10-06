import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Category name',
    example: 'Electronics',
  })
  @IsString()
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
}
