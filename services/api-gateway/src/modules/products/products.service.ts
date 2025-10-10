import { Injectable, Logger } from '@nestjs/common';
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
import { ApiClientService } from 'nest-shared/api-clients/api-client.service';
import { Request } from 'express';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);
  private readonly serviceName = 'products';

  constructor(private readonly apiClientService: ApiClientService) {}

  // Core Product Operations

  async create(dto: CreateProductDto, headers: Request['headers']) {
    return this.apiClientService.products
      .POST('/products', {
        body: dto,
        headers,
      })
      .then((response) => response.data as unknown as ProductDto);
  }

  async findAll(query: QueryProductRequest, headers: Request['headers']) {
    return this.apiClientService.products
      .GET('/products', {
        params: {
          query,
        },
      })
      .then((response) => response.data as unknown as QueryProductResponse);
  }

  async findOne(id: string, headers: Request['headers']) {
    return this.apiClientService.products
      .GET('/products/{id}', {
        params: {
          path: {
            id,
          },
        },
        headers,
      })
      .then((response) => response.data as unknown as ProductDto);
  }

  async findBySku(sku: string, headers: Request['headers']) {
    return this.apiClientService.products
      .GET('/products/sku/{sku}', {
        params: {
          path: {
            sku,
          },
        },
        headers,
      })
      .then((response) => response.data as unknown as ProductDto);
  }

  async findByCategory(
    categoryId: string,
    query: QueryProductRequest,
    headers: Request['headers'],
  ) {
    return this.apiClientService.products
      .GET('/products/category/{categoryId}', {
        params: {
          path: {
            categoryId,
          },
          query,
        },
        headers,
      })
      .then((response) => response.data as unknown as QueryProductResponse);
  }

  async search(
    searchTerm: string,
    query: QueryProductRequest,
    headers: Request['headers'],
  ) {
    return this.apiClientService.products
      .GET('/products/search', {
        params: {
          query: {
            q: searchTerm,
            ...query,
          },
        },
        headers,
      })
      .then((response) => response.data as unknown as QueryProductResponse);
  }

  async update(id: string, dto: UpdateProductDto, headers: Request['headers']) {
    return this.apiClientService.products
      .PUT('/products/{id}', {
        params: {
          path: {
            id,
          },
        },
        body: dto,
        headers,
      })
      .then((response) => response.data as unknown as ProductDto);
  }

  async remove(id: string, headers: Request['headers']) {
    return this.apiClientService.products
      .DELETE('/products/{id}', {
        params: {
          path: {
            id,
          },
        },
        headers,
      })
      .then((response) => response.data as unknown as ProductDto);
  }

  // Product Variant Operations

  async addVariant(
    productId: string,
    dto: CreateProductVariantDto,
    headers: Request['headers'],
  ) {
    return this.apiClientService.products
      .POST('/products/{id}/variants', {
        params: {
          path: {
            id: productId,
          },
        },
        body: dto,
        headers,
      })
      .then(
        (response) => response.data as unknown as ProductVariantResponseDto,
      );
  }

  async getVariants(productId: string, headers: Request['headers']) {
    return this.apiClientService.products
      .GET('/products/{id}/variants', {
        params: {
          path: {
            id: productId,
          },
        },
        headers,
      })
      .then(
        (response) => response.data as unknown as ProductVariantResponseDto[],
      );
  }

  async updateVariant(
    productId: string,
    variantId: string,
    dto: UpdateProductVariantDto,
    headers: Request['headers'],
  ) {
    return this.apiClientService.products
      .PUT('/products/{id}/variants/{variantId}', {
        params: {
          path: {
            id: productId,
            variantId,
          },
        },
        body: dto,
        headers,
      })
      .then(
        (response) => response.data as unknown as ProductVariantResponseDto,
      );
  }

  async removeVariant(
    productId: string,
    variantId: string,
    headers: Request['headers'],
  ) {
    await this.apiClientService.products
      .DELETE('/products/{id}/variants/{variantId}', {
        params: {
          path: {
            id: productId,
            variantId,
          },
        },
        headers,
      })
      .then((response) => response.data);
  }

  // Product Media Operations

  async attachMedia(
    productId: string,
    dto: AttachMediaToProductDto,
    headers: Request['headers'],
  ) {
    return this.apiClientService.products
      .POST('/products/{id}/media', {
        params: {
          path: {
            id: productId,
          },
        },
        body: {
          mediaId: dto.mediaId,
          isPrimary: dto.isPrimary,
          altText: dto.altText,
        },
        headers,
      })
      .then((response) => response.data as unknown as ProductMediaResponseDto);
  }

  async getProductMedia(
    productId: string,
    headers: Request['headers'],
  ): Promise<ProductMediaResponseDto[]> {
    return this.apiClientService.products
      .GET('/products/{id}/media', {
        params: {
          path: {
            id: productId,
          },
        },
        headers,
      })
      .then((response) => response.data);
  }

  async detachMedia(
    productId: string,
    mediaId: string,
    headers: Request['headers'],
  ): Promise<DetachMediaFromProductResponseDto> {
    return this.apiClientService.products
      .DELETE('/products/{id}/media/{mediaId}', {
        params: {
          path: {
            id: productId,
            mediaId,
          },
        },
        headers,
      })
      .then(
        (response) =>
          response.data as unknown as DetachMediaFromProductResponseDto,
      );
  }

  async updatePrimaryImage(
    productId: string,
    mediaId: string,
    headers: Request['headers'],
  ) {
    return this.apiClientService.products
      .PUT('/products/{id}/media/{mediaId}/primary', {
        params: {
          path: {
            id: productId,
            mediaId,
          },
        },
        headers,
      })
      .then((response) => response.data as unknown as ProductDto);
  }
}
