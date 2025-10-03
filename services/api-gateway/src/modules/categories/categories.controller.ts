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
} from 'nest-shared/contracts';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  private readonly logger = new Logger(CategoriesController.name);

  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateCategoryDto, @Req() req: Request) {
    this.logger.log(`Creating category: ${dto.name}`);
    return this.categoriesService.create(dto, req.headers);
  }

  @Get()
  async findAll(@Query() query: QueryCategoryRequest, @Req() req: Request) {
    this.logger.log(
      `Finding all categories with query: ${JSON.stringify(query)}`,
    );
    return this.categoriesService.findAll(query, req.headers);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    this.logger.log(`Finding category with id: ${id}`);
    return this.categoriesService.findOne(id, req.headers);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategoryDto,
    @Req() req: Request,
  ) {
    this.logger.log(`Updating category with id: ${id}`);
    return this.categoriesService.update(id, dto, req.headers);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    this.logger.log(`Removing category with id: ${id}`);
    return this.categoriesService.remove(id, req.headers);
  }
}
