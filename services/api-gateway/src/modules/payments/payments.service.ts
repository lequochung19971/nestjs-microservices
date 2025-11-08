import { Injectable, Logger } from '@nestjs/common';
import {
  CreatePaymentDto,
  ProcessPaymentDto,
  PaymentDto,
} from 'nest-shared/contracts';
import { ApiClientService } from 'nest-shared/api-clients/api-client.service';
import { Request } from 'express';
import { headersForwarding } from 'nest-shared/utils';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(private readonly apiClientService: ApiClientService) {}

  async createPayment(dto: CreatePaymentDto, headers: Request['headers']) {
    return this.apiClientService.orders
      .POST('/payments', {
        body: dto,
        headers: headersForwarding.extractForwardingHeaders(headers),
      })
      .then((response) => response.data as unknown as PaymentDto);
  }

  async processPayment(
    paymentId: string,
    dto: ProcessPaymentDto,
    headers: Request['headers'],
  ) {
    return this.apiClientService.orders
      .POST('/payments/{id}/process', {
        params: {
          path: {
            id: paymentId,
          },
        },
        body: dto,
        headers: headersForwarding.extractForwardingHeaders(headers),
      })
      .then((response) => response.data as unknown as PaymentDto);
  }

  async failPayment(
    paymentId: string,
    reason: string | undefined,
    headers: Request['headers'],
  ) {
    return this.apiClientService.orders
      .POST('/payments/{id}/fail', {
        params: {
          path: {
            id: paymentId,
          },
        },
        headers: headersForwarding.extractForwardingHeaders(headers),
      })
      .then((response) => response.data as unknown as PaymentDto);
  }

  async getPaymentsByOrder(orderId: string, headers: Request['headers']) {
    return this.apiClientService.orders
      .GET('/payments/order/{orderId}', {
        params: {
          path: {
            orderId,
          },
        },
        headers: headersForwarding.extractForwardingHeaders(headers),
      })
      .then((response) => response.data as unknown as PaymentDto[]);
  }

  async getPayment(paymentId: string, headers: Request['headers']) {
    return this.apiClientService.orders
      .GET('/payments/{id}', {
        params: {
          path: {
            id: paymentId,
          },
        },
        headers: headersForwarding.extractForwardingHeaders(headers),
      })
      .then((response) => response.data as unknown as PaymentDto);
  }
}
