import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { and, desc, eq, sql } from 'drizzle-orm';
import { Request } from 'express';
import { ApiClientService } from 'nest-shared/api-clients/api-client.service';
import {
  CreateOrderDto,
  OrderDto,
  OrderStatus,
  PaymentStatus,
  ProductDto,
  QueryOrderRequestDto,
  QueryOrderResponseDto,
  UpdateOrderDto,
} from 'nest-shared/contracts';
import { headersForwarding } from 'nest-shared/utils';
import {
  OrderCreatedEvent,
  OrderUpdatedEvent,
  OrderCancelledEvent,
  OrderConfirmedEvent,
  OrderShippedEvent,
  OrderDeliveredEvent,
  ProductUpdatedEvent,
  InventoryReservedEvent,
} from 'nest-shared/events';
import { DrizzleService } from '../../db/drizzle.service';
import {
  orders,
  orderItems,
  orderProducts,
  shippingAddresses,
  billingAddresses,
  orderStatusHistory,
  Order,
} from '../../db/schema';
import { OrdersPublishers } from './orders-publishers';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly drizzle: DrizzleService,
    private readonly apiClientService: ApiClientService,
    private readonly ordersPublishers: OrdersPublishers,
  ) {}

  // Core CRUD Operations

  async create(
    dto: CreateOrderDto,
    headers: Request['headers'],
  ): Promise<OrderDto> {
    try {
      // Generate order number
      const orderNumber = await this.generateOrderNumber();

      // Fetch product details from product service
      const productIds = dto.items.map((item) => item.productId);
      const products = await this.fetchProducts(productIds, headers);

      if (products.length !== productIds.length) {
        throw new BadRequestException('One or more products not found');
      }

      // Calculate totals
      let subtotal = 0;
      const orderItemsData = dto.items.map((item) => {
        const product = products.find((p) => p.id === item.productId);
        const unitPrice = item.unitPrice || parseFloat(product.price);
        const totalPrice = unitPrice * item.quantity;
        subtotal += totalPrice;

        return {
          product,
          quantity: item.quantity,
          unitPrice: unitPrice.toString(),
          totalPrice: totalPrice.toString(),
        };
      });

      const taxAmount = subtotal * 0.1; // 10% tax (simplified)
      const shippingCost = 10; // Fixed shipping cost (simplified)
      const totalAmount = subtotal + taxAmount + shippingCost;

      const result = await this.drizzle.client.transaction(async (tx) => {
        // Create the order
        const [newOrder] = await tx
          .insert(orders)
          .values({
            orderNumber,
            customerId: dto.customerId,
            status: 'PENDING',
            paymentStatus: 'PENDING',
            paymentMethod: dto.paymentMethod,
            shippingMethod: dto.shippingMethod,
            subtotal: subtotal.toString(),
            taxAmount: taxAmount.toString(),
            shippingCost: shippingCost.toString(),
            discountAmount: '0',
            totalAmount: totalAmount.toString(),
            notes: dto.notes,
          })
          .returning();

        // Create shipping address
        await tx.insert(shippingAddresses).values({
          orderId: newOrder.id,
          fullName: dto.shippingAddress.fullName,
          phone: dto.shippingAddress.phone,
          addressLine1: dto.shippingAddress.addressLine1,
          addressLine2: dto.shippingAddress.addressLine2,
          city: dto.shippingAddress.city,
          state: dto.shippingAddress.state,
          postalCode: dto.shippingAddress.postalCode,
          country: dto.shippingAddress.country,
          isDefault: false,
        });

        // Create billing address
        const billingAddr = dto.billingAddress || dto.shippingAddress;
        await tx.insert(billingAddresses).values({
          orderId: newOrder.id,
          fullName: billingAddr.fullName,
          phone: billingAddr.phone,
          addressLine1: billingAddr.addressLine1,
          addressLine2: billingAddr.addressLine2,
          city: billingAddr.city,
          state: billingAddr.state,
          postalCode: billingAddr.postalCode,
          country: billingAddr.country,
          isDefault: false,
        });

        // Create order products and items
        for (const itemData of orderItemsData) {
          const [orderProduct] = await tx
            .insert(orderProducts)
            .values({
              orderId: newOrder.id,
              productId: itemData.product.id,
              sku: itemData.product.sku,
              name: itemData.product.name,
              description: itemData.product.description,
              price: itemData.product.price,
              currency: itemData.product.currency,
            })
            .returning();

          await tx.insert(orderItems).values({
            orderId: newOrder.id,
            orderProductId: orderProduct.id,
            quantity: itemData.quantity,
            unitPrice: itemData.unitPrice,
            totalPrice: itemData.totalPrice,
            discountAmount: '0',
            taxAmount: '0',
          });
        }

        // Create initial status history
        await tx.insert(orderStatusHistory).values({
          orderId: newOrder.id,
          status: 'PENDING',
          notes: 'Order created',
        });

        return newOrder;
      });

      // Publish order created event
      await this.ordersPublishers.publishOrderCreated(
        new OrderCreatedEvent({
          id: result.id,
          orderNumber: result.orderNumber,
          customerId: result.customerId,
          totalAmount: result.totalAmount,
          items: orderItemsData.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        }),
      );

      return this.findOne(result.id);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(
        `Failed to create order: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(`Failed to create order: ${error.message}`);
    }
  }

  async findAll(query: QueryOrderRequestDto): Promise<QueryOrderResponseDto> {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        customerId,
        status,
        paymentStatus,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        includeItems = false,
        includeShippingAddress = false,
        includeBillingAddress = false,
        includeStatusHistory = false,
        includePayments = false,
      } = query;

      const offset = (page - 1) * limit;

      // Build where conditions
      const whereConditions = [];

      if (search) {
        whereConditions.push(
          sql`${orders.orderNumber} ILIKE ${'%' + search + '%'}`,
        );
      }

      if (customerId) {
        whereConditions.push(eq(orders.customerId, customerId));
      }

      if (status) {
        whereConditions.push(eq(orders.status, status));
      }

      if (paymentStatus) {
        whereConditions.push(eq(orders.paymentStatus, paymentStatus));
      }

      const whereClause =
        whereConditions.length > 0 ? and(...whereConditions) : undefined;

      // Build order clause
      let orderClause;
      switch (sortBy) {
        case 'orderNumber':
          orderClause =
            sortOrder === 'asc' ? orders.orderNumber : desc(orders.orderNumber);
          break;
        case 'totalAmount':
          orderClause =
            sortOrder === 'asc' ? orders.totalAmount : desc(orders.totalAmount);
          break;
        case 'updatedAt':
          orderClause =
            sortOrder === 'asc' ? orders.updatedAt : desc(orders.updatedAt);
          break;
        default: // createdAt
          orderClause =
            sortOrder === 'asc' ? orders.createdAt : desc(orders.createdAt);
      }

      // Get orders with related data
      const items = await this.drizzle.client.query.orders.findMany({
        where: whereClause,
        limit,
        offset,
        orderBy: orderClause,
        with: {
          ...(includeItems && {
            items: {
              with: {
                product: true,
              },
            },
          }),
          ...(includeShippingAddress && {
            shippingAddress: true,
          }),
          ...(includeBillingAddress && {
            billingAddress: true,
          }),
          ...(includeStatusHistory && {
            statusHistory: true,
          }),
          ...(includePayments && {
            payments: true,
          }),
        },
      });

      // Get total count for pagination
      const countResult = await this.drizzle.client
        .select({ count: sql`count(*)` })
        .from(orders)
        .where(whereClause);

      const total = Number(countResult[0].count) || 0;
      const totalPages = Math.ceil(total / limit);

      // Transform to DTOs
      const orderDtos = items.map((item) => this.transformToOrderDto(item));

      return new QueryOrderResponseDto({
        data: orderDtos,
        meta: {
          page,
          limit,
          totalCount: total,
          totalPages,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to find orders: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to list orders: ${error.message}`);
    }
  }

  async findOne(id: string): Promise<OrderDto> {
    try {
      const order = await this.drizzle.client.query.orders.findFirst({
        where: eq(orders.id, id),
        with: {
          items: {
            with: {
              product: true,
            },
          },
          shippingAddress: true,
          billingAddress: true,
          statusHistory: true,
          payments: true,
        },
      });

      if (!order) {
        throw new NotFoundException(`Order with ID ${id} not found`);
      }

      return this.transformToOrderDto(order);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to find order ${id}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(`Failed to get order: ${error.message}`);
    }
  }

  async findByOrderNumber(orderNumber: string): Promise<OrderDto> {
    try {
      const order = await this.drizzle.client.query.orders.findFirst({
        where: eq(orders.orderNumber, orderNumber),
        with: {
          items: {
            with: {
              product: true,
            },
          },
          shippingAddress: true,
          billingAddress: true,
          statusHistory: true,
          payments: true,
        },
      });

      if (!order) {
        throw new NotFoundException(
          `Order with number ${orderNumber} not found`,
        );
      }

      return this.transformToOrderDto(order);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to find order by number ${orderNumber}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(`Failed to get order: ${error.message}`);
    }
  }

  async update(id: string, dto: UpdateOrderDto): Promise<OrderDto> {
    try {
      // Check if order exists
      const existingOrder = await this.findOne(id);

      await this.drizzle.client.transaction(async (tx) => {
        // Update order
        const updateData: Partial<Order> = {
          updatedAt: new Date(),
        };

        if (dto.status) {
          updateData.status = dto.status;
          // Update timestamp based on status
          if (dto.status === 'CONFIRMED') {
            updateData.confirmedAt = new Date();
          } else if (dto.status === 'SHIPPED') {
            updateData.shippedAt = new Date();
          } else if (dto.status === 'DELIVERED') {
            updateData.deliveredAt = new Date();
          } else if (dto.status === 'CANCELLED') {
            updateData.cancelledAt = new Date();
          }
        }

        if (dto.paymentStatus) {
          updateData.paymentStatus = dto.paymentStatus;
        }

        if (dto.paymentMethod) {
          updateData.paymentMethod = dto.paymentMethod;
        }

        if (dto.shippingMethod) {
          updateData.shippingMethod = dto.shippingMethod;
        }

        if (dto.notes !== undefined) {
          updateData.notes = dto.notes;
        }

        await tx.update(orders).set(updateData).where(eq(orders.id, id));

        // Add status history if status changed
        if (dto.status && dto.status !== existingOrder.status) {
          await tx.insert(orderStatusHistory).values({
            orderId: id,
            status: dto.status,
            notes: `Status changed to ${dto.status}`,
          });
        }
      });

      // Publish appropriate events
      if (dto.status) {
        if (dto.status === 'CANCELLED') {
          await this.ordersPublishers.publishOrderCancelled(
            new OrderCancelledEvent({
              id,
              orderNumber: existingOrder.orderNumber,
              customerId: existingOrder.customerId,
            }),
          );
        } else if (dto.status === 'CONFIRMED') {
          await this.ordersPublishers.publishOrderConfirmed(
            new OrderConfirmedEvent({
              id,
              orderNumber: existingOrder.orderNumber,
              customerId: existingOrder.customerId,
            }),
          );
        } else if (dto.status === 'SHIPPED') {
          await this.ordersPublishers.publishOrderShipped(
            new OrderShippedEvent({
              id,
              orderNumber: existingOrder.orderNumber,
              customerId: existingOrder.customerId,
            }),
          );
        } else if (dto.status === 'DELIVERED') {
          await this.ordersPublishers.publishOrderDelivered(
            new OrderDeliveredEvent({
              id,
              orderNumber: existingOrder.orderNumber,
              customerId: existingOrder.customerId,
            }),
          );
        }
      }

      await this.ordersPublishers.publishOrderUpdated(
        new OrderUpdatedEvent({
          id,
          orderNumber: existingOrder.orderNumber,
          status: dto.status,
          paymentStatus: dto.paymentStatus,
        }),
      );

      return this.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to update order ${id}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(`Failed to update order: ${error.message}`);
    }
  }

  async cancel(id: string, reason?: string): Promise<OrderDto> {
    try {
      const order = await this.findOne(id);

      if (
        order.status === 'CANCELLED' ||
        order.status === 'DELIVERED' ||
        order.status === 'SHIPPED'
      ) {
        throw new BadRequestException(
          `Cannot cancel order with status ${order.status}`,
        );
      }

      await this.drizzle.client.transaction(async (tx) => {
        await tx
          .update(orders)
          .set({
            status: 'CANCELLED',
            cancelledAt: new Date(),
            updatedAt: new Date(),
            notes: reason || order.notes,
          })
          .where(eq(orders.id, id));

        await tx.insert(orderStatusHistory).values({
          orderId: id,
          status: 'CANCELLED',
          notes: reason || 'Order cancelled',
        });
      });

      await this.ordersPublishers.publishOrderCancelled(
        new OrderCancelledEvent({
          id,
          orderNumber: order.orderNumber,
          customerId: order.customerId,
          reason,
        }),
      );

      return this.findOne(id);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(
        `Failed to cancel order ${id}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(`Failed to cancel order: ${error.message}`);
    }
  }

  // Event handlers

  async handleProductUpdated(data: ProductUpdatedEvent): Promise<void> {
    try {
      // Update product information in order_products for future reference
      // This is optional - you might want to keep historical data unchanged
      this.logger.log(
        `Product ${data.id} updated, no action needed for orders`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to handle product updated: ${error.message}`,
        error.stack,
      );
    }
  }

  async handleInventoryReserved(data: InventoryReservedEvent): Promise<void> {
    try {
      const { orderId, reservationId, inventoryItemId } = data;

      // Update order item with reservation ID
      await this.drizzle.client
        .update(orderItems)
        .set({
          inventoryReservationId: reservationId,
        })
        .where(eq(orderItems.id, inventoryItemId));

      this.logger.log(`Inventory reserved for order ${orderId}`);
    } catch (error) {
      this.logger.error(
        `Failed to handle inventory reserved: ${error.message}`,
        error.stack,
      );
    }
  }

  async handleInventoryReservationFailed(data: any): Promise<void> {
    try {
      const { orderId, reason } = data;

      // Update order status to indicate inventory issue
      await this.drizzle.client
        .update(orders)
        .set({
          status: 'CANCELLED',
          cancelledAt: new Date(),
          notes: `Inventory reservation failed: ${reason}`,
        })
        .where(eq(orders.id, orderId));

      await this.drizzle.client.insert(orderStatusHistory).values({
        orderId,
        status: 'CANCELLED',
        notes: `Inventory reservation failed: ${reason}`,
      });

      this.logger.log(`Order ${orderId} cancelled due to inventory issue`);
    } catch (error) {
      this.logger.error(
        `Failed to handle inventory reservation failed: ${error.message}`,
        error.stack,
      );
    }
  }

  // Private helper methods

  private async generateOrderNumber(): Promise<string> {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    return `ORD-${timestamp}-${random}`;
  }

  private async fetchProducts(
    productIds: string[],
    headers: Request['headers'],
  ) {
    try {
      const productPromises = productIds.map((id) =>
        this.apiClientService.products.GET('/products/{id}', {
          params: {
            path: { id },
          },
          headers: headersForwarding.extractForwardingHeaders(headers),
        }),
      );

      const results = await Promise.all(productPromises);
      return results.map((result) => result.data);
    } catch (error) {
      this.logger.error(
        `Failed to fetch products: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Failed to fetch product information');
    }
  }

  private transformToOrderDto(order: any): OrderDto {
    return new OrderDto({
      id: order.id,
      orderNumber: order.orderNumber,
      customerId: order.customerId,
      status: order.status as OrderStatus,
      paymentStatus: order.paymentStatus as PaymentStatus,
      paymentMethod: order.paymentMethod,
      shippingMethod: order.shippingMethod,
      subtotal: order.subtotal,
      taxAmount: order.taxAmount,
      shippingCost: order.shippingCost,
      discountAmount: order.discountAmount,
      totalAmount: order.totalAmount,
      notes: order.notes,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      confirmedAt: order.confirmedAt,
      shippedAt: order.shippedAt,
      deliveredAt: order.deliveredAt,
      cancelledAt: order.cancelledAt,
      items: order.items,
      shippingAddress: order.shippingAddress,
      billingAddress: order.billingAddress,
      statusHistory: order.statusHistory,
      payments: order.payments,
    });
  }
}
