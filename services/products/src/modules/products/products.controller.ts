import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
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
  CreateProductVariantDto,
  ProductDto,
  ProductVariantResponseDto,
  QueryProductRequest,
  QueryProductResponse,
  UpdateProductDto,
  UpdateProductVariantDto,
  AttachMediaToProductDto,
  ProductMediaResponseDto,
  DetachMediaFromProductResponseDto,
} from 'nest-shared/contracts';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { ProductsService } from './products.service';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // Core Product CRUD Operations

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
    type: ProductDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - SKU already exists',
  })
  async create(
    @Body() createProductDto: CreateProductDto,
  ): Promise<ProductDto> {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'List products with filtering and pagination' })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search term for product name, description, or SKU',
  })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    description: 'Filter by category ID',
  })
  @ApiQuery({
    name: 'currency',
    required: false,
    description: 'Filter by currency',
    enum: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'],
  })
  @ApiQuery({
    name: 'minPrice',
    required: false,
    description: 'Minimum price filter',
    type: Number,
  })
  @ApiQuery({
    name: 'maxPrice',
    required: false,
    description: 'Maximum price filter',
    type: Number,
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    description: 'Filter by active status',
    type: Boolean,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (1-based)',
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
    type: Number,
  })
  @ApiQuery({
    name: 'sortField',
    required: false,
    description: 'Field to sort by',
    enum: ['name', 'price', 'sku', 'createdAt', 'updatedAt'],
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: 'Sort order',
    enum: ['asc', 'desc'],
  })
  @ApiQuery({
    name: 'includeVariants',
    required: false,
    description: 'Include product variants',
    type: Boolean,
  })
  @ApiQuery({
    name: 'includeMedia',
    required: false,
    description: 'Include product media',
    type: Boolean,
  })
  @ApiQuery({
    name: 'includeCategories',
    required: false,
    description: 'Include product categories',
    type: Boolean,
  })
  @ApiResponse({
    status: 200,
    description: 'List of products',
    type: QueryProductResponse,
  })
  async findAll(
    @Query() query: QueryProductRequest,
  ): Promise<QueryProductResponse> {
    return this.productsService.findAll(query);
  }

  @Get('search')
  @ApiOperation({ summary: 'Advanced product search' })
  @ApiQuery({
    name: 'q',
    required: true,
    description: 'Search term',
  })
  @ApiResponse({
    status: 200,
    description: 'Search results',
    type: QueryProductResponse,
  })
  async search(
    @Query('q') searchTerm: string,
    @Query() query: QueryProductRequest,
  ): Promise<QueryProductResponse> {
    return this.productsService.searchProducts(searchTerm, query);
  }

  @Get('sku/:sku')
  @ApiOperation({ summary: 'Get product by SKU' })
  @ApiParam({ name: 'sku', description: 'Product SKU' })
  @ApiResponse({
    status: 200,
    description: 'Product details',
    type: ProductDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  async findBySku(@Param('sku') sku: string): Promise<ProductDto> {
    return this.productsService.findBySku(sku);
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
  ): Promise<QueryProductResponse> {
    return this.productsService.findByCategory(categoryId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'Product details',
    type: ProductDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ProductDto> {
    return this.productsService.findOne(id);
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
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - SKU already exists',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<ProductDto> {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete product' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'Product deleted successfully',
    type: ProductDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<ProductDto> {
    return this.productsService.remove(id);
  }

  // Product Variant Management

  @Post(':id/variants')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Add variant to product' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({
    status: 201,
    description: 'Variant added successfully',
    type: ProductVariantResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Variant already exists',
  })
  async addVariant(
    @Param('id', ParseUUIDPipe) productId: string,
    @Body() createVariantDto: CreateProductVariantDto,
  ): Promise<ProductVariantResponseDto> {
    return this.productsService.addVariant(productId, createVariantDto);
  }

  @Get(':id/variants')
  @ApiOperation({ summary: 'Get product variants' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'Product variants',
    type: [ProductVariantResponseDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  async getVariants(
    @Param('id', ParseUUIDPipe) productId: string,
  ): Promise<ProductVariantResponseDto[]> {
    return this.productsService.getVariants(productId);
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
  @ApiResponse({
    status: 404,
    description: 'Product or variant not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Variant already exists',
  })
  async updateVariant(
    @Param('id', ParseUUIDPipe) productId: string,
    @Param('variantId', ParseUUIDPipe) variantId: string,
    @Body() updateVariantDto: UpdateProductVariantDto,
  ): Promise<ProductVariantResponseDto> {
    return this.productsService.updateVariant(
      productId,
      variantId,
      updateVariantDto,
    );
  }

  @Delete(':id/variants/:variantId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete product variant' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiParam({ name: 'variantId', description: 'Variant ID' })
  @ApiResponse({
    status: 204,
    description: 'Variant deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Product or variant not found',
  })
  async removeVariant(
    @Param('id', ParseUUIDPipe) productId: string,
    @Param('variantId', ParseUUIDPipe) variantId: string,
  ): Promise<void> {
    return this.productsService.removeVariant(productId, variantId);
  }

  // Product Media Management (Phase 3 - Placeholder endpoints)

  @Post(':id/media')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Attach media to product' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({
    status: 201,
    description: 'Media attached successfully',
    type: ProductMediaResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  async attachMedia(
    @Param('id', ParseUUIDPipe) productId: string,
    @Body() attachMediaDto: AttachMediaToProductDto,
  ): Promise<ProductMediaResponseDto> {
    return this.productsService.attachMedia(productId, attachMediaDto);
  }

  @Get(':id/media')
  @ApiOperation({ summary: 'Get product media' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'Product media',
    type: [ProductMediaResponseDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  async getProductMedia(
    @Param('id', ParseUUIDPipe) productId: string,
  ): Promise<ProductMediaResponseDto[]> {
    return this.productsService.getProductMedia(productId);
  }

  @Delete(':id/media/:mediaId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Remove media from product' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiParam({ name: 'mediaId', description: 'Media ID' })
  @ApiResponse({
    status: 200,
    description: 'Media removed successfully',
    type: DetachMediaFromProductResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Product or media not found',
  })
  async detachMedia(
    @Param('id', ParseUUIDPipe) productId: string,
    @Param('mediaId', ParseUUIDPipe) mediaId: string,
  ): Promise<DetachMediaFromProductResponseDto> {
    await this.productsService.detachMedia(productId, mediaId);
    return new DetachMediaFromProductResponseDto(productId, mediaId, true);
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
  @ApiResponse({
    status: 404,
    description: 'Product or media not found',
  })
  async updatePrimaryImage(
    @Param('id', ParseUUIDPipe) productId: string,
    @Param('mediaId', ParseUUIDPipe) mediaId: string,
  ): Promise<ProductDto> {
    return this.productsService.updatePrimaryImage(productId, mediaId);
  }
}
