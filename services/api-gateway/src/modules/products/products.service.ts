import { Injectable, Logger } from '@nestjs/common';
import { ProxyService, Headers } from '../../services/proxy.service';

export interface HealthResponse {
  status: string;
  timestamp: string;
}

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);
  private readonly serviceName = 'products';

  constructor(private readonly proxyService: ProxyService) {}

  async healthCheck(headers: Headers): Promise<HealthResponse> {
    return this.proxyService.get<HealthResponse>(
      this.serviceName,
      '/health',
      headers,
    );
  }

  async checkProtected(headers: Headers): Promise<unknown> {
    return this.proxyService.get(this.serviceName, '/protected', headers);
  }
}
