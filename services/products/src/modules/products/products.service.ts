import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
  Scope,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { and, desc, eq, ilike, or, sql } from 'drizzle-orm';
import { Request } from 'express';
import { ApiClientService } from 'nest-shared/api-clients/api-client.service';
import {
  AttachMediaToProductDto,
  CreateProductDto,
  CreateProductVariantDto,
  Currency,
  ProductDto,
  ProductMediaResponseDto,
  ProductVariantResponseDto,
  QueryProductRequest,
  QueryProductResponse,
  UpdateProductDto,
  UpdateProductMediaDto,
  UpdateProductVariantDto,
} from 'nest-shared/contracts';
import { headersForwarding } from 'nest-shared/utils';
import { DrizzleService } from '../../db/drizzle.service';
import {
  categories,
  NewProductImage,
  productCategories,
  productImages,
  products,
  productVariants,
} from '../../db/schema';

@Injectable()
export class ProductsService implements OnModuleInit {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    private readonly drizzle: DrizzleService,
    private readonly apiClientService: ApiClientService,
  ) {}

  async onModuleInit() {
    console.log('TEST');
  }

  // Core CRUD Operations

  async create(dto: CreateProductDto): Promise<ProductDto> {
    try {
      // Check if SKU already exists
      const existingProduct =
        await this.drizzle.client.query.products.findFirst({
          where: eq(products.sku, dto.sku),
        });

      if (existingProduct) {
        throw new ConflictException(
          `Product with SKU '${dto.sku}' already exists`,
        );
      }

      // Validate categories if provided
      if (dto.categoryIds?.length) {
        await this.validateCategories(dto.categoryIds);
      }

      const result = await this.drizzle.client.transaction(async (tx) => {
        // Create the product
        const [newProduct] = await tx
          .insert(products)
          .values({
            sku: dto.sku,
            name: dto.name,
            description: dto.description,
            price: dto.price,
            currency: dto.currency,
            isActive: dto.isActive,
          })
          .returning();

        // Assign categories if provided
        if (dto.categoryIds?.length) {
          const categoryAssignments = dto.categoryIds.map((categoryId) => ({
            productId: newProduct.id,
            categoryId,
          }));
          await tx.insert(productCategories).values(categoryAssignments);
        }

        // Create initial variants if provided
        if (dto.variants?.length) {
          const variantData = dto.variants.map((variant) => ({
            productId: newProduct.id,
            name: variant.name,
            value: variant.value,
          }));
          await tx.insert(productVariants).values(variantData);
        }
        if (dto.imageIds?.length) {
          const images = await this.apiClientService.media.POST(
            '/media/files/ids',
            {
              body: {
                ids: dto.imageIds,
              },
              // headers: headersForwarding.extractForwardingHeaders(
              //   // this.request.headers,
              // ),
            },
          );

          const newProductImages = images.data.map(
            (image) =>
              ({
                productId: newProduct.id,
                imageId: image.id,
                url: image.url,
                mediaId: image.id,
                originalFilename: image.originalFilename,
                mimeType: image.mimeType,
                size: image.size,
                type: image.type,
              }) as NewProductImage,
          );

          await tx.insert(productImages).values(newProductImages);
        }

        return newProduct;
      });

      return this.findOne(result.id);
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(
        `Failed to create product: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to create product: ${error.message}`,
      );
    }
  }

  async findAll(query: QueryProductRequest): Promise<QueryProductResponse> {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        categoryId,
        categoryIds,
        currency,
        minPrice,
        maxPrice,
        isActive,
        sortField = 'createdAt',
        sortOrder = 'desc',
        includeVariants = false,
        includeMedia = false,
        includeCategories = false,
      } = query;

      const offset = (page - 1) * limit;

      // Build where conditions
      const whereConditions = [];

      if (search) {
        whereConditions.push(
          or(
            ilike(products.name, `%${search}%`),
            ilike(products.description, `%${search}%`),
            ilike(products.sku, `%${search}%`),
          ),
        );
      }

      if (categoryId || categoryIds?.length) {
        const categoryFilter = categoryIds?.length ? categoryIds : [categoryId];
        // Join with product_categories to filter by category
        const productsInCategories = this.drizzle.client
          .select({ productId: productCategories.productId })
          .from(productCategories)
          .where(sql`${productCategories.categoryId} = ANY(${categoryFilter})`);

        whereConditions.push(sql`${products.id} IN ${productsInCategories}`);
      }

      if (currency) {
        whereConditions.push(eq(products.currency, currency));
      }

      if (minPrice !== undefined) {
        whereConditions.push(sql`${products.price} >= ${minPrice}`);
      }

      if (maxPrice !== undefined) {
        whereConditions.push(sql`${products.price} <= ${maxPrice}`);
      }

      if (isActive !== undefined) {
        whereConditions.push(eq(products.isActive, isActive));
      }

      const whereClause =
        whereConditions.length > 0 ? and(...whereConditions) : undefined;

      // Build order clause
      let orderClause;
      switch (sortField) {
        case 'name':
          orderClause =
            sortOrder === 'asc' ? products.name : desc(products.name);
          break;
        case 'price':
          orderClause =
            sortOrder === 'asc' ? products.price : desc(products.price);
          break;
        case 'sku':
          orderClause = sortOrder === 'asc' ? products.sku : desc(products.sku);
          break;
        case 'updatedAt':
          orderClause =
            sortOrder === 'asc' ? products.updatedAt : desc(products.updatedAt);
          break;
        default: // createdAt
          orderClause =
            sortOrder === 'asc' ? products.createdAt : desc(products.createdAt);
      }

      // Get products with related data
      const items = await this.drizzle.client.query.products.findMany({
        where: whereClause,
        limit,
        offset,
        orderBy: orderClause,
        with: {
          ...(includeCategories && {
            categories: {
              with: {
                category: true,
              },
            },
          }),
          ...(includeVariants && {
            variants: true,
          }),
          ...(includeMedia && {
            images: true,
          }),
        },
      });

      // Get total count for pagination
      const countResult = await this.drizzle.client
        .select({ count: sql`count(*)` })
        .from(products)
        .where(whereClause);

      const total = Number(countResult[0].count) || 0;
      const totalPages = Math.ceil(total / limit);

      // Transform to DTOs
      const productDtos = items.map((item) => this.transformToProductDto(item));

      return new QueryProductResponse(productDtos, {
        page,
        limit,
        total,
        totalPages,
      });
    } catch (error) {
      this.logger.error(
        `Failed to find products: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to list products: ${error.message}`,
      );
    }
  }

  async findOne(id: string): Promise<ProductDto> {
    try {
      const product = await this.drizzle.client.query.products.findFirst({
        where: eq(products.id, id),
        with: {
          categories: {
            with: {
              category: true,
            },
          },
          variants: true,
          images: true,
        },
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      return this.transformToProductDto(product);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to find product ${id}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(`Failed to get product: ${error.message}`);
    }
  }

  async findBySku(sku: string): Promise<ProductDto> {
    try {
      const product = await this.drizzle.client.query.products.findFirst({
        where: eq(products.sku, sku),
        with: {
          categories: {
            with: {
              category: true,
            },
          },
          variants: true,
          images: true,
        },
      });

      if (!product) {
        throw new NotFoundException(`Product with SKU '${sku}' not found`);
      }

      return this.transformToProductDto(product);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to find product by SKU ${sku}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(`Failed to get product: ${error.message}`);
    }
  }

  async update(id: string, dto: UpdateProductDto): Promise<ProductDto> {
    try {
      // Check if product exists
      const existingProduct = await this.findOne(id);

      // Check SKU uniqueness if SKU is being updated
      if (dto.sku && dto.sku !== existingProduct.sku) {
        const skuExists = await this.drizzle.client.query.products.findFirst({
          where: and(eq(products.sku, dto.sku), sql`${products.id} != ${id}`),
        });

        if (skuExists) {
          throw new ConflictException(
            `Product with SKU '${dto.sku}' already exists`,
          );
        }
      }

      // Validate categories if provided
      if (dto.categoryIds?.length) {
        await this.validateCategories(dto.categoryIds);
      }

      await this.drizzle.client.transaction(async (tx) => {
        // Update product
        await tx
          .update(products)
          .set({
            ...(dto.sku && { sku: dto.sku }),
            ...(dto.name && { name: dto.name }),
            ...(dto.description !== undefined && {
              description: dto.description,
            }),
            ...(dto.price && { price: dto.price }),
            ...(dto.currency && { currency: dto.currency }),
            ...(dto.isActive !== undefined && { isActive: dto.isActive }),
            updatedAt: new Date(),
          })
          .where(eq(products.id, id));

        // Update category assignments if provided
        if (dto.categoryIds !== undefined) {
          // Remove existing category assignments
          await tx
            .delete(productCategories)
            .where(eq(productCategories.productId, id));

          // Add new category assignments
          if (dto.categoryIds.length > 0) {
            const categoryAssignments = dto.categoryIds.map((categoryId) => ({
              productId: id,
              categoryId,
            }));
            await tx.insert(productCategories).values(categoryAssignments);
          }
        }

        if (dto.imageIds?.length) {
          await tx.delete(productImages).where(eq(productImages.productId, id));
          const images = await this.apiClientService.media.POST(
            '/media/files/ids',
            {
              body: {
                ids: dto.imageIds,
              },
              // headers: headersForwarding.extractForwardingHeaders(
              //   this.request.headers,
              // ),
            },
          );
          const newProductImages = images.data.map(
            (image) =>
              ({
                productId: id,
                imageId: image.id,
                url: image.url,
                mediaId: image.id,
                originalFilename: image.originalFilename,
                mimeType: image.mimeType,
                size: image.size,
                type: image.type,
              }) as NewProductImage,
          );
          await tx.insert(productImages).values(newProductImages);
        }
      });

      return this.findOne(id);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      this.logger.error(
        `Failed to update product ${id}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to update product: ${error.message}`,
      );
    }
  }

  async updateProductMedia(
    dto: UpdateProductMediaDto,
  ): Promise<ProductMediaResponseDto | null> {
    try {
      const productMedia =
        await this.drizzle.client.query.productImages.findFirst({
          where: eq(productImages.mediaId, dto.id),
        });
      if (!productMedia) {
        return null;
      }
      const [updatedProductMedia] = await this.drizzle.client
        .update(productImages)
        .set({
          mimeType: dto.mimeType,
          size: dto.size,
          type: dto.type,
          url: dto.url,
          originalFilename: dto.originalFilename,
        })
        .where(eq(productImages.mediaId, dto.id))
        .returning();

      return new ProductMediaResponseDto(updatedProductMedia);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to update product media ${dto.id}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to update product media: ${error.message}`,
      );
    }
  }

  async removeProductMedia(id: string): Promise<boolean> {
    try {
      const productMedia =
        await this.drizzle.client.query.productImages.findFirst({
          where: eq(productImages.mediaId, id),
        });
      if (!productMedia) {
        return false;
      }
      await this.drizzle.client
        .delete(productImages)
        .where(eq(productImages.mediaId, id));
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to remove product media ${id}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to remove product media: ${error.message}`,
      );
    }
  }

  async remove(id: string): Promise<ProductDto> {
    try {
      const product = await this.findOne(id);

      await this.drizzle.client.transaction(async (tx) => {
        // Delete related data first (due to foreign key constraints)
        await tx
          .delete(productCategories)
          .where(eq(productCategories.productId, id));
        await tx
          .delete(productVariants)
          .where(eq(productVariants.productId, id));
        await tx.delete(productImages).where(eq(productImages.productId, id));

        // Delete the product
        await tx.delete(products).where(eq(products.id, id));
      });

      return product;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to delete product ${id}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to delete product: ${error.message}`,
      );
    }
  }

  // Variant Management

  async addVariant(
    productId: string,
    dto: CreateProductVariantDto,
  ): Promise<ProductVariantResponseDto> {
    try {
      // Ensure product exists
      await this.findOne(productId);

      // Check if variant with same name and value already exists
      const existingVariant =
        await this.drizzle.client.query.productVariants.findFirst({
          where: and(
            eq(productVariants.productId, productId),
            eq(productVariants.name, dto.name),
            eq(productVariants.value, dto.value),
          ),
        });

      if (existingVariant) {
        throw new ConflictException(
          `Variant ${dto.name}: ${dto.value} already exists for this product`,
        );
      }

      const [newVariant] = await this.drizzle.client
        .insert(productVariants)
        .values({
          productId,
          name: dto.name,
          value: dto.value,
        })
        .returning();

      return new ProductVariantResponseDto(newVariant);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      this.logger.error(
        `Failed to add variant to product ${productId}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(`Failed to add variant: ${error.message}`);
    }
  }

  async updateVariant(
    productId: string,
    variantId: string,
    dto: UpdateProductVariantDto,
  ): Promise<ProductVariantResponseDto> {
    try {
      // Ensure product exists
      await this.findOne(productId);

      // Ensure variant exists and belongs to the product
      const existingVariant =
        await this.drizzle.client.query.productVariants.findFirst({
          where: and(
            eq(productVariants.id, variantId),
            eq(productVariants.productId, productId),
          ),
        });

      if (!existingVariant) {
        throw new NotFoundException(
          `Variant with ID ${variantId} not found for product ${productId}`,
        );
      }

      // Check for duplicate if name or value is changing
      if (dto.name || dto.value) {
        const newName = dto.name || existingVariant.name;
        const newValue = dto.value || existingVariant.value;

        const duplicateVariant =
          await this.drizzle.client.query.productVariants.findFirst({
            where: and(
              eq(productVariants.productId, productId),
              eq(productVariants.name, newName),
              eq(productVariants.value, newValue),
              sql`${productVariants.id} != ${variantId}`,
            ),
          });

        if (duplicateVariant) {
          throw new ConflictException(
            `Variant ${newName}: ${newValue} already exists for this product`,
          );
        }
      }

      const [updatedVariant] = await this.drizzle.client
        .update(productVariants)
        .set({
          ...(dto.name && { name: dto.name }),
          ...(dto.value && { value: dto.value }),
        })
        .where(eq(productVariants.id, variantId))
        .returning();

      return new ProductVariantResponseDto(updatedVariant);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      this.logger.error(
        `Failed to update variant ${variantId} for product ${productId}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to update variant: ${error.message}`,
      );
    }
  }

  async removeVariant(productId: string, variantId: string): Promise<void> {
    try {
      // Ensure product exists
      await this.findOne(productId);

      // Ensure variant exists and belongs to the product
      const existingVariant =
        await this.drizzle.client.query.productVariants.findFirst({
          where: and(
            eq(productVariants.id, variantId),
            eq(productVariants.productId, productId),
          ),
        });

      if (!existingVariant) {
        throw new NotFoundException(
          `Variant with ID ${variantId} not found for product ${productId}`,
        );
      }

      await this.drizzle.client
        .delete(productVariants)
        .where(eq(productVariants.id, variantId));
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to remove variant ${variantId} from product ${productId}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to remove variant: ${error.message}`,
      );
    }
  }

  async getVariants(productId: string): Promise<ProductVariantResponseDto[]> {
    try {
      // Ensure product exists
      await this.findOne(productId);

      const variants = await this.drizzle.client.query.productVariants.findMany(
        {
          where: eq(productVariants.productId, productId),
        },
      );

      return variants.map((variant) => new ProductVariantResponseDto(variant));
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to get variants for product ${productId}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(`Failed to get variants: ${error.message}`);
    }
  }

  // Category-based queries

  async findByCategory(
    categoryId: string,
    query?: QueryProductRequest,
  ): Promise<QueryProductResponse> {
    const enhancedQuery = {
      ...query,
      categoryId,
    };
    return this.findAll(enhancedQuery);
  }

  async searchProducts(
    searchTerm: string,
    query?: QueryProductRequest,
  ): Promise<QueryProductResponse> {
    const enhancedQuery = {
      ...query,
      search: searchTerm,
    };
    return this.findAll(enhancedQuery);
  }

  // Media Integration Methods

  async attachMedia(
    productId: string,
    dto: AttachMediaToProductDto,
  ): Promise<ProductMediaResponseDto> {
    try {
      // Ensure product exists
      await this.findOne(productId);

      // Check if media is already attached to this product
      const existingAttachment =
        await this.drizzle.client.query.productImages.findFirst({
          where: and(
            eq(productImages.productId, productId),
            eq(productImages.mediaId, dto.mediaId),
          ),
        });

      if (existingAttachment) {
        throw new ConflictException(
          `Media ${dto.mediaId} is already attached to product ${productId}`,
        );
      }

      const media = await this.apiClientService.media.GET('/media/files/{id}', {
        params: {
          path: {
            id: dto.mediaId,
          },
        },
        // headers: headersForwarding.extractForwardingHeaders(
        //   this.request.headers,
        // ),
      });

      // TODO: In a real implementation, you would fetch media details from the media service
      // For now, we'll create a placeholder entry
      const newProductImage: NewProductImage = {
        productId,
        mediaId: media.data.id,
        url: media.data.url,
        originalFilename: media.data.originalFilename,
        mimeType: media.data.mimeType,
        size: media.data.size,
        type: media.data.type,
      };

      const [attachedMedia] = await this.drizzle.client
        .insert(productImages)
        .values(newProductImage)
        .returning();

      // If this is set as primary, update the product's imageUrl
      if (dto.isPrimary) {
        await this.drizzle.client
          .update(products)
          .set({
            updatedAt: new Date(),
          })
          .where(eq(products.id, productId));
      }

      return new ProductMediaResponseDto(attachedMedia);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      this.logger.error(
        `Failed to attach media ${dto.mediaId} to product ${productId}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(`Failed to attach media: ${error.message}`);
    }
  }

  async detachMedia(productId: string, mediaId: string): Promise<void> {
    try {
      // Ensure product exists
      await this.findOne(productId);

      // Check if media is attached to this product
      const attachment =
        await this.drizzle.client.query.productImages.findFirst({
          where: and(
            eq(productImages.productId, productId),
            eq(productImages.mediaId, mediaId),
          ),
        });

      if (!attachment) {
        throw new NotFoundException(
          `Media ${mediaId} is not attached to product ${productId}`,
        );
      }

      await this.drizzle.client.transaction(async (tx) => {
        // Remove the media attachment
        await tx
          .delete(productImages)
          .where(
            and(
              eq(productImages.productId, productId),
              eq(productImages.mediaId, mediaId),
            ),
          );
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to detach media ${mediaId} from product ${productId}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(`Failed to detach media: ${error.message}`);
    }
  }

  async getProductMedia(productId: string): Promise<ProductMediaResponseDto[]> {
    try {
      // Ensure product exists
      await this.findOne(productId);

      const mediaAttachments =
        await this.drizzle.client.query.productImages.findMany({
          where: eq(productImages.productId, productId),
        });

      return mediaAttachments.map(
        (media) => new ProductMediaResponseDto(media),
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to get media for product ${productId}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to get product media: ${error.message}`,
      );
    }
  }

  async updatePrimaryImage(
    productId: string,
    mediaId: string,
  ): Promise<ProductDto> {
    try {
      // Ensure product exists
      await this.findOne(productId);

      // Check if media is attached to this product
      const attachment =
        await this.drizzle.client.query.productImages.findFirst({
          where: and(
            eq(productImages.productId, productId),
            eq(productImages.mediaId, mediaId),
          ),
        });

      if (!attachment) {
        throw new NotFoundException(
          `Media ${mediaId} is not attached to product ${productId}`,
        );
      }

      return this.findOne(productId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to update primary image for product ${productId}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to update primary image: ${error.message}`,
      );
    }
  }

  // Private helper methods

  private async validateCategories(categoryIds: string[]): Promise<void> {
    for (const categoryId of categoryIds) {
      const category = await this.drizzle.client.query.categories.findFirst({
        where: eq(categories.id, categoryId),
      });

      if (!category) {
        throw new BadRequestException(
          `Category with ID ${categoryId} not found`,
        );
      }
    }
  }

  private transformToProductDto(product: any): ProductDto {
    return new ProductDto({
      id: product.id,
      sku: product.sku,
      name: product.name,
      description: product.description,
      price: product.price,
      currency: product.currency as Currency,
      isActive: product.isActive,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      categories: product.categories?.map((pc: any) => pc.category) || [],
      variants: product.variants || [],
      images: product.images || [],
    });
  }
}
