import { Injectable, Logger } from '@nestjs/common';
import { Request } from 'express';
import { ApiClientService } from 'nest-shared/api-clients/api-client.service';
import {
  CreateCustomerDto,
  CustomerDto,
  QueryCustomerRequestDto,
  QueryCustomerResponseDto,
} from 'nest-shared/contracts';
import { headersForwarding } from 'nest-shared/utils';

@Injectable()
export class CustomersService {
  private readonly logger = new Logger(CustomersService.name);

  constructor(private readonly apiClientService: ApiClientService) {}

  async getAllCustomers(
    query: QueryCustomerRequestDto,
    headers?: Request['headers'],
  ): Promise<QueryCustomerResponseDto> {
    try {
      const response = await this.apiClientService.users.GET('/customers', {
        params: {
          query,
        },
        headers: headersForwarding.extractForwardingHeaders(headers),
      });

      if (!response.data) {
        throw new Error('Failed to get customers');
      }

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get customers: ${error.message}`);
      throw error;
    }
  }

  async getCustomerById(
    id: string,
    headers?: Request['headers'],
  ): Promise<CustomerDto> {
    try {
      const response = await this.apiClientService.users.GET(
        '/customers/{id}',
        {
          params: {
            path: {
              id,
            },
          },
          headers: headersForwarding.extractForwardingHeaders(headers),
        },
      );

      if (!response.data) {
        throw new Error('Failed to get customer');
      }

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get customer: ${error.message}`);
      throw error;
    }
  }

  async createCustomer(
    userData: CreateCustomerDto,
    headers?: Request['headers'],
  ): Promise<CustomerDto> {
    try {
      // @ts-expect-error - OpenAPI types need to be regenerated to include POST /customers
      const response = await this.apiClientService.users.POST('/customers', {
        body: userData,
        headers: headersForwarding.extractForwardingHeaders(headers),
      });

      if (!response.data) {
        throw new Error('Failed to create customer');
      }

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to create customer: ${error.message}`);
      throw error;
    }
  }
}
