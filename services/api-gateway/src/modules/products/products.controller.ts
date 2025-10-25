import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreateProductDto,
  UpdateProductDto,
  QueryProductRequest,
  QueryProductResponse,
  ProductDto,
  CreateProductVariantDto,
  UpdateProductVariantDto,
  ProductVariantResponseDto,
  AttachMediaToProductDto,
  ProductMediaResponseDto,
  DetachMediaFromProductResponseDto,
} from 'nest-shared/contracts';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { ProductsService } from './products.service';

@ApiTags('products')
@Controller('products')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class ProductsController {
  private readonly logger = new Logger(ProductsController.name);

  constructor(private readonly productsService: ProductsService) {}

  // Core Product Operations

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
    type: ProductDto,
  })
  async create(
    @Body() dto: CreateProductDto,
    @Req() req: Request,
  ): Promise<ProductDto> {
    this.logger.log(`Creating product: ${dto.name}`);
    return this.productsService.create(dto, req.headers);
  }

  @Get()
  @ApiOperation({ summary: 'List products with filtering and pagination' })
  @ApiResponse({
    status: 200,
    description: 'List of products',
    type: QueryProductResponse,
  })
  async findAll(
    @Query() query: QueryProductRequest,
    @Req() req: Request,
  ): Promise<QueryProductResponse> {
    this.logger.log(
      `Finding all products with query: ${JSON.stringify(query)}`,
    );
    return this.productsService.findAll(query, req.headers);
  }

  @Get('search')
  @ApiOperation({ summary: 'Advanced product search' })
  @ApiQuery({ name: 'q', required: true, description: 'Search term' })
  @ApiResponse({
    status: 200,
    description: 'Search results',
    type: QueryProductResponse,
  })
  async search(
    @Query('q') searchTerm: string,
    @Query() query: QueryProductRequest,
    @Req() req: Request,
  ): Promise<QueryProductResponse> {
    this.logger.log(`Searching products with term: ${searchTerm}`);
    return this.productsService.search(searchTerm, query, req.headers);
  }

  @Get('sku/:sku')
  @ApiOperation({ summary: 'Get product by SKU' })
  @ApiParam({ name: 'sku', description: 'Product SKU' })
  @ApiResponse({
    status: 200,
    description: 'Product details',
    type: ProductDto,
  })
  async findBySku(
    @Param('sku') sku: string,
    @Req() req: Request,
  ): Promise<ProductDto> {
    this.logger.log(`Finding product by SKU: ${sku}`);
    return this.productsService.findBySku(sku, req.headers);
  }

  @Get('category/:categoryId')
  @ApiOperation({ summary: 'Get products by category' })
  @ApiParam({ name: 'categoryId', description: 'Category ID' })
  @ApiResponse({
    status: 200,
    description: 'Products in category',
    type: QueryProductResponse,
  })
  async findByCategory(
    @Param('categoryId', ParseUUIDPipe) categoryId: string,
    @Query() query: QueryProductRequest,
    @Req() req: Request,
  ): Promise<QueryProductResponse> {
    this.logger.log(`Finding products by category: ${categoryId}`);
    return this.productsService.findByCategory(categoryId, query, req.headers);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'Product details',
    type: ProductDto,
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ): Promise<ProductDto> {
    this.logger.log(`Finding product with id: ${id}`);
    return this.productsService.findOne(id, req.headers);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update product' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully',
    type: ProductDto,
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
    @Req() req: Request,
  ): Promise<ProductDto> {
    this.logger.log(`Updating product with id: ${id}`);
    return this.productsService.update(id, dto, req.headers);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete product' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'Product deleted successfully',
    type: ProductDto,
  })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ): Promise<ProductDto> {
    this.logger.log(`Removing product with id: ${id}`);
    return this.productsService.remove(id, req.headers);
  }

  // Product Variant Operations

  @Post(':id/variants')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add variant to product' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({
    status: 201,
    description: 'Variant added successfully',
    type: ProductVariantResponseDto,
  })
  async addVariant(
    @Param('id', ParseUUIDPipe) productId: string,
    @Body() dto: CreateProductVariantDto,
    @Req() req: Request,
  ): Promise<ProductVariantResponseDto> {
    this.logger.log(`Adding variant to product: ${productId}`);
    return this.productsService.addVariant(productId, dto, req.headers);
  }

  @Get(':id/variants')
  @ApiOperation({ summary: 'Get product variants' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'Product variants',
    type: [ProductVariantResponseDto],
  })
  async getVariants(
    @Param('id', ParseUUIDPipe) productId: string,
    @Req() req: Request,
  ): Promise<ProductVariantResponseDto[]> {
    this.logger.log(`Getting variants for product: ${productId}`);
    return this.productsService.getVariants(productId, req.headers);
  }

  @Put(':id/variants/:variantId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update product variant' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiParam({ name: 'variantId', description: 'Variant ID' })
  @ApiResponse({
    status: 200,
    description: 'Variant updated successfully',
    type: ProductVariantResponseDto,
  })
  async updateVariant(
    @Param('id', ParseUUIDPipe) productId: string,
    @Param('variantId', ParseUUIDPipe) variantId: string,
    @Body() dto: UpdateProductVariantDto,
    @Req() req: Request,
  ): Promise<ProductVariantResponseDto> {
    this.logger.log(`Updating variant ${variantId} for product: ${productId}`);
    return this.productsService.updateVariant(
      productId,
      variantId,
      dto,
      req.headers,
    );
  }

  @Delete(':id/variants/:variantId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete product variant' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiParam({ name: 'variantId', description: 'Variant ID' })
  @ApiResponse({
    status: 204,
    description: 'Variant deleted successfully',
  })
  async removeVariant(
    @Param('id', ParseUUIDPipe) productId: string,
    @Param('variantId', ParseUUIDPipe) variantId: string,
    @Req() req: Request,
  ): Promise<void> {
    this.logger.log(`Removing variant ${variantId} from product: ${productId}`);
    return this.productsService.removeVariant(
      productId,
      variantId,
      req.headers,
    );
  }

  // Product Media Operations

  @Post(':id/media')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Attach media to product' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({
    status: 201,
    description: 'Media attached successfully',
    type: ProductMediaResponseDto,
  })
  async attachMedia(
    @Param('id', ParseUUIDPipe) productId: string,
    @Body() dto: AttachMediaToProductDto,
    @Req() req: Request,
  ): Promise<ProductMediaResponseDto> {
    this.logger.log(`Attaching media ${dto.mediaId} to product: ${productId}`);
    return this.productsService.attachMedia(productId, dto, req.headers);
  }

  @Get(':id/media')
  @ApiOperation({ summary: 'Get product media' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'Product media',
    type: [ProductMediaResponseDto],
  })
  async getProductMedia(
    @Param('id', ParseUUIDPipe) productId: string,
    @Req() req: Request,
  ): Promise<ProductMediaResponseDto[]> {
    this.logger.log(`Getting media for product: ${productId}`);
    return this.productsService.getProductMedia(productId, req.headers);
  }

  @Delete(':id/media/:mediaId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove media from product' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiParam({ name: 'mediaId', description: 'Media ID' })
  @ApiResponse({
    status: 200,
    description: 'Media removed successfully',
    type: DetachMediaFromProductResponseDto,
  })
  async detachMedia(
    @Param('id', ParseUUIDPipe) productId: string,
    @Param('mediaId', ParseUUIDPipe) mediaId: string,
    @Req() req: Request,
  ): Promise<DetachMediaFromProductResponseDto> {
    this.logger.log(`Detaching media ${mediaId} from product: ${productId}`);
    return this.productsService.detachMedia(productId, mediaId, req.headers);
  }

  @Put(':id/media/:mediaId/primary')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Set media as primary image' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiParam({ name: 'mediaId', description: 'Media ID' })
  @ApiResponse({
    status: 200,
    description: 'Primary image updated successfully',
    type: ProductDto,
  })
  async updatePrimaryImage(
    @Param('id', ParseUUIDPipe) productId: string,
    @Param('mediaId', ParseUUIDPipe) mediaId: string,
    @Req() req: Request,
  ): Promise<ProductDto> {
    this.logger.log(
      `Setting media ${mediaId} as primary for product: ${productId}`,
    );
    return this.productsService.updatePrimaryImage(
      productId,
      mediaId,
      req.headers,
    );
  }
}
