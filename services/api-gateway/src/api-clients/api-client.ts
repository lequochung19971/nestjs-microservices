import {
  Injectable,
  Scope,
  HttpException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import createClient, {
  Client,
  FetchOptions,
  FetchResponse,
} from 'openapi-fetch';
import { AppConfigService } from 'src/app-config';
import { paths as UsersPaths } from './users-api.generated';
import { paths as ProductsPaths } from './products-api.generated';
import { paths as MediaPaths } from './media-api.generated';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
type PathsFor<T> = T extends any ? keyof T & string : never;

// Extract the return type from the client methods
type ClientMethodReturnType<
  TClient extends ReturnType<typeof createClient<any>>,
  TMethod extends HttpMethod,
> = TClient[TMethod] extends (...args: any[]) => infer R ? R : never;

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

  constructor(private readonly configService: AppConfigService) {
    // Get service URLs from configuration
    const userServiceUrl = this.configService.userService.serviceUrl;
    const productsServiceUrl = this.configService.productsService.serviceUrl;
    const mediaServiceUrl = this.configService.mediaService.serviceUrl;
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
          `Failed to communicate with ${serviceName} service`,
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
