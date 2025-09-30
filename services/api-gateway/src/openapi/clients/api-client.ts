import { Injectable, Scope } from '@nestjs/common';
import createClient from 'openapi-fetch';
import { AppConfigService } from 'src/app-config';
import { paths as usersPaths } from './users-api.generated';
import { paths as productsPaths } from './products-api.generated';

/**
 * Injectable service that provides typed API clients for all microservices.
 * Can be injected into other services for type-safe API calls.
 */
@Injectable({ scope: Scope.DEFAULT })
export class ApiClientService {
  public readonly users: ReturnType<typeof createClient<usersPaths>>;
  public readonly products: ReturnType<typeof createClient<productsPaths>>;

  constructor(private readonly configService: AppConfigService) {
    // Get service URLs from configuration
    const userServiceUrl = this.configService.userService.serviceUrl;
    const productsServiceUrl = this.configService.productsService.serviceUrl;
    // Create typed clients
    this.users = createClient<usersPaths>({
      baseUrl: userServiceUrl,
    });
    this.products = createClient<productsPaths>({
      baseUrl: productsServiceUrl,
    });
  }
}
