import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  Scope,
} from '@nestjs/common';
import { paths as MediaPaths } from './media-api.generated';
import { paths as ProductsPaths } from './products-api.generated';
import { paths as InventoryPaths } from './inventory-api.generated';
import { paths as UsersPaths } from './users-api.generated';
import { paths as OrdersPaths } from './orders-api.generated';
import createClient, { Client, FetchResponse } from 'openapi-fetch';

const serviceConfigs = {
  users: {
    url: 'http://localhost:3001',
  },
  products: {
    url: 'http://localhost:3002',
  },
  media: {
    url: 'http://localhost:3003',
  },
  inventory: {
    url: 'http://localhost:3004',
  },
  orders: {
    url: 'http://localhost:3005',
  },
};

/**
 * Injectable service that provides typed API clients for all microservices.
 * Can be injected into other services for type-safe API calls.
 */
@Injectable({ scope: Scope.DEFAULT })
export class ApiClientService {
  private readonly logger = new Logger(ApiClientService.name);

  public readonly users: ReturnType<typeof createClient<UsersPaths>>;
  public readonly products: ReturnType<typeof createClient<ProductsPaths>>;
  public readonly media: ReturnType<typeof createClient<MediaPaths>>;
  public readonly inventory: ReturnType<typeof createClient<InventoryPaths>>;
  public readonly orders: ReturnType<typeof createClient<OrdersPaths>>;
  constructor() {
    // Get service URLs from configuration
    const userServiceUrl = serviceConfigs.users.url;
    const productsServiceUrl = serviceConfigs.products.url;
    const mediaServiceUrl = serviceConfigs.media.url;
    const inventoryServiceUrl = serviceConfigs.inventory.url;
    const ordersServiceUrl = serviceConfigs.orders.url;
    // Create typed clients
    this.users = this.withCall(
      createClient<UsersPaths>({
        baseUrl: userServiceUrl,
      }),
      'users',
    );

    this.products = this.withCall(
      createClient<ProductsPaths>({
        baseUrl: productsServiceUrl,
      }),
      'products',
    );

    this.media = this.withCall(
      createClient<MediaPaths>({
        baseUrl: mediaServiceUrl,
      }),
      'media',
    );

    this.inventory = this.withCall(
      createClient<InventoryPaths>({
        baseUrl: inventoryServiceUrl,
      }),
      'inventory',
    );

    this.orders = this.withCall(
      createClient<OrdersPaths>({
        baseUrl: ordersServiceUrl,
      }),
      'orders',
    );
  }

  withCall<T extends Client<any, any>>(client: T, serviceName: string) {
    type GetType = typeof client.GET;
    type PostType = typeof client.POST;
    type PutType = typeof client.PUT;
    type PatchType = typeof client.PATCH;
    type DeleteType = typeof client.DELETE;
    type OptionsType = typeof client.OPTIONS;
    type HeadType = typeof client.HEAD;
    type TraceType = typeof client.TRACE;

    const handleError = async (
      methodPm: Promise<FetchResponse<any, any, any>>,
    ) => {
      try {
        // Call the appropriate method on the client
        const response = await methodPm;

        // Check if the response contains an error
        if (response.error) {
          throw new HttpException(
            response.error,
            response.response?.status || 500,
          );
        }

        return response;
      } catch (error) {
        // If it's already an HttpException, rethrow it
        if (error instanceof HttpException) {
          throw error;
        }

        // Throw a generic internal server error for unexpected errors
        throw new InternalServerErrorException(
          error.message || `Failed to communicate with ${serviceName} service`,
        );
      }
    };

    return {
      GET: (...args: Parameters<GetType>) => handleError(client.GET(...args)),
      POST: (...args: Parameters<PostType>) =>
        handleError(client.POST(...args)),
      PUT: (...args: Parameters<PutType>) => handleError(client.PUT(...args)),
      DELETE: (...args: Parameters<DeleteType>) =>
        handleError(client.DELETE(...args)),
      PATCH: (...args: Parameters<PatchType>) =>
        handleError(client.PATCH(...args)),
      OPTIONS: (...args: Parameters<OptionsType>) =>
        handleError(client.OPTIONS(...args)),
      HEAD: (...args: Parameters<HeadType>) =>
        handleError(client.HEAD(...args)),
      TRACE: (...args: Parameters<TraceType>) =>
        handleError(client.TRACE(...args)),
      request: (...args) => client.request(...args),
      eject: (...args) => client.eject(...args),
      use: (...args) => client.use(...args),
    } as T;
  }
}
