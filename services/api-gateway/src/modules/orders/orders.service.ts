import { Injectable, Logger } from '@nestjs/common';
import {
  CreateOrderDto,
  UpdateOrderDto,
  QueryOrderRequestDto,
  QueryOrderResponseDto,
  OrderDto,
} from 'nest-shared/contracts';
import { ApiClientService } from 'nest-shared/api-clients/api-client.service';
import { Request } from 'express';
import { headersForwarding } from 'nest-shared/utils';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(private readonly apiClientService: ApiClientService) {}

  async create(dto: CreateOrderDto, headers: Request['headers']) {
    return this.apiClientService.orders
      .POST('/orders', {
        body: dto,
        headers: headersForwarding.extractForwardingHeaders(headers),
      })
      .then((response) => response.data as unknown as OrderDto);
  }

  async findAll(query: QueryOrderRequestDto, headers: Request['headers']) {
    return this.apiClientService.orders
      .GET('/orders', {
        params: {
          query,
        },
        headers: headersForwarding.extractForwardingHeaders(headers),
      })
      .then((response) => response.data as unknown as QueryOrderResponseDto);
  }

  async findOne(id: string, headers: Request['headers']) {
    return this.apiClientService.orders
      .GET('/orders/{id}', {
        params: {
          path: {
            id,
          },
        },
        headers: headersForwarding.extractForwardingHeaders(headers),
      })
      .then((response) => response.data as unknown as OrderDto);
  }

  async findByOrderNumber(orderNumber: string, headers: Request['headers']) {
    return this.apiClientService.orders
      .GET('/orders/number/{orderNumber}', {
        params: {
          path: {
            orderNumber,
          },
        },
        headers,
      })
      .then((response) => response.data as unknown as OrderDto);
  }

  async update(id: string, dto: UpdateOrderDto, headers: Request['headers']) {
    return this.apiClientService.orders
      .PUT('/orders/{id}', {
        params: {
          path: {
            id,
          },
        },
        body: dto,
        headers: headersForwarding.extractForwardingHeaders(headers),
      })
      .then((response) => response.data as unknown as OrderDto);
  }

  async cancel(
    id: string,
    reason: string | undefined,
    headers: Request['headers'],
  ) {
    return this.apiClientService.orders
      .POST('/orders/{id}/cancel', {
        params: {
          path: {
            id,
          },
        },
        headers: headersForwarding.extractForwardingHeaders(headers),
      })
      .then((response) => response.data as unknown as OrderDto);
  }
}
