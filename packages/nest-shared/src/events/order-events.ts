import { OrderStatus, PaymentStatus } from '../contracts/orders';

export class OrderCreatedEvent {
  constructor(
    public readonly data: {
      id: string;
      orderNumber: string;
      customerId: string;
      totalAmount: string;
      items: Array<{
        productId: string;
        quantity: number;
        unitPrice: string;
      }>;
    },
  ) {}
}

export class OrderUpdatedEvent {
  constructor(
    public readonly data: {
      id: string;
      orderNumber: string;
      status?: OrderStatus;
      paymentStatus?: PaymentStatus;
    },
  ) {}
}

export class OrderCancelledEvent {
  constructor(
    public readonly data: {
      id: string;
      orderNumber: string;
      customerId: string;
      reason?: string;
    },
  ) {}
}

export class OrderConfirmedEvent {
  constructor(
    public readonly data: {
      id: string;
      orderNumber: string;
      customerId: string;
    },
  ) {}
}

export class OrderShippedEvent {
  constructor(
    public readonly data: {
      id: string;
      orderNumber: string;
      customerId: string;
      trackingNumber?: string;
    },
  ) {}
}

export class OrderDeliveredEvent {
  constructor(
    public readonly data: {
      id: string;
      orderNumber: string;
      customerId: string;
    },
  ) {}
}

export class PaymentProcessedEvent {
  constructor(
    public readonly data: {
      orderId: string;
      paymentId: string;
      amount: string;
      status: PaymentStatus;
      transactionId?: string;
    },
  ) {}
}
