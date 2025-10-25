import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
  ParseUUIDPipe,
  UseGuards,
  Req,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { CategoriesService } from './categories.service';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  QueryCategoryRequest,
  QueryCategoryResponse,
  CategoryDto,
} from 'nest-shared/contracts';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import {
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiBearerAuth,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('categories')
@Controller('categories')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class CategoriesController {
  private readonly logger = new Logger(CategoriesController.name);

  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a category' })
  @ApiResponse({
    status: 201,
    description: 'Category created successfully',
    type: CategoryDto,
  })
  async create(
    @Body() dto: CreateCategoryDto,
    @Req() req: Request,
  ): Promise<CategoryDto> {
    this.logger.log(`Creating category: ${dto.name}`);
    return this.categoriesService.create(dto, req.headers);
  }

  @Get()
  @ApiQuery({ type: QueryCategoryRequest })
  @ApiResponse({
    status: 200,
    description: 'Categories found successfully',
    type: QueryCategoryResponse,
  })
  @ApiOperation({ summary: 'Find all categories' })
  async findAll(
    @Query() query: QueryCategoryRequest,
    @Req() req: Request,
  ): Promise<QueryCategoryResponse> {
    this.logger.log(
      `Finding all categories with query: ${JSON.stringify(query)}`,
    );
    return this.categoriesService.findAll(query, req.headers);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find a category by ID' })
  @ApiResponse({
    status: 200,
    description: 'Category found successfully',
    type: CategoryDto,
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ): Promise<CategoryDto> {
    this.logger.log(`Finding category with id: ${id}`);
    return this.categoriesService.findOne(id, req.headers);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a category' })
  @ApiResponse({
    status: 200,
    description: 'Category updated successfully',
    type: CategoryDto,
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategoryDto,
    @Req() req: Request,
  ): Promise<CategoryDto> {
    this.logger.log(`Updating category with id: ${id}`);
    return this.categoriesService.update(id, dto, req.headers);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a category' })
  @ApiResponse({
    status: 200,
    description: 'Category removed successfully',
    type: CategoryDto,
  })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ): Promise<CategoryDto> {
    this.logger.log(`Removing category with id: ${id}`);
    return this.categoriesService.remove(id, req.headers);
  }
}
