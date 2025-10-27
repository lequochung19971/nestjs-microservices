import { relations } from 'drizzle-orm';
import {
  boolean,
  decimal,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

// Order status enum
export const orderStatusEnum = pgEnum('order_status', [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
]);

// Payment status enum
export const paymentStatusEnum = pgEnum('payment_status', [
  'PENDING',
  'PAID',
  'FAILED',
  'REFUNDED',
  'PARTIALLY_REFUNDED',
]);

// Payment method enum
export const paymentMethodEnum = pgEnum('payment_method', [
  'CREDIT_CARD',
  'DEBIT_CARD',
  'PAYPAL',
  'BANK_TRANSFER',
  'CASH_ON_DELIVERY',
]);

// Shipping method enum
export const shippingMethodEnum = pgEnum('shipping_method', [
  'STANDARD',
  'EXPRESS',
  'OVERNIGHT',
  'PICKUP',
]);

// Orders table - Main order information
export const orders = pgTable(
  'orders',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orderNumber: varchar('order_number', { length: 50 }).notNull().unique(),
    customerId: uuid('customer_id').notNull(), // Reference to user/customer
    status: orderStatusEnum('status').notNull().default('PENDING'),
    paymentStatus: paymentStatusEnum('payment_status')
      .notNull()
      .default('PENDING'),
    paymentMethod: paymentMethodEnum('payment_method'),
    shippingMethod: shippingMethodEnum('shipping_method'),
    subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
    taxAmount: decimal('tax_amount', { precision: 10, scale: 2 })
      .notNull()
      .default('0'),
    shippingCost: decimal('shipping_cost', { precision: 10, scale: 2 })
      .notNull()
      .default('0'),
    discountAmount: decimal('discount_amount', { precision: 10, scale: 2 })
      .notNull()
      .default('0'),
    totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
    notes: text('notes'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    confirmedAt: timestamp('confirmed_at'),
    shippedAt: timestamp('shipped_at'),
    deliveredAt: timestamp('delivered_at'),
    cancelledAt: timestamp('cancelled_at'),
  },
  (table) => [
    index('orders_customer_idx').on(table.customerId),
    index('orders_status_idx').on(table.status),
    index('orders_payment_status_idx').on(table.paymentStatus),
    index('orders_order_number_idx').on(table.orderNumber),
    index('orders_created_at_idx').on(table.createdAt),
  ],
);

// Order items table - Individual items in an order
export const orderItems = pgTable(
  'order_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orderId: uuid('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    productId: uuid('product_id').notNull(), // Reference to product service
    sku: varchar('sku', { length: 100 }).notNull(),
    productName: varchar('product_name', { length: 255 }).notNull(),
    quantity: integer('quantity').notNull(),
    unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
    totalPrice: decimal('total_price', { precision: 10, scale: 2 }).notNull(),
    discountAmount: decimal('discount_amount', { precision: 10, scale: 2 })
      .notNull()
      .default('0'),
    taxAmount: decimal('tax_amount', { precision: 10, scale: 2 })
      .notNull()
      .default('0'),
    inventoryReservationId: uuid('inventory_reservation_id'), // Reference to inventory reservation
    metadata: text('metadata'), // JSON for additional product details
  },
  (table) => [
    index('order_items_order_idx').on(table.orderId),
    index('order_items_product_idx').on(table.productId),
  ],
);

// Shipping addresses table
export const shippingAddresses = pgTable(
  'shipping_addresses',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orderId: uuid('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    fullName: varchar('full_name', { length: 255 }).notNull(),
    phone: varchar('phone', { length: 20 }),
    addressLine1: varchar('address_line1', { length: 255 }).notNull(),
    addressLine2: varchar('address_line2', { length: 255 }),
    city: varchar('city', { length: 100 }).notNull(),
    state: varchar('state', { length: 100 }),
    postalCode: varchar('postal_code', { length: 20 }).notNull(),
    country: varchar('country', { length: 100 }).notNull(),
    isDefault: boolean('is_default').notNull().default(false),
  },
  (table) => [index('shipping_addresses_order_idx').on(table.orderId)],
);

// Billing addresses table
export const billingAddresses = pgTable(
  'billing_addresses',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orderId: uuid('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    fullName: varchar('full_name', { length: 255 }).notNull(),
    phone: varchar('phone', { length: 20 }),
    addressLine1: varchar('address_line1', { length: 255 }).notNull(),
    addressLine2: varchar('address_line2', { length: 255 }),
    city: varchar('city', { length: 100 }).notNull(),
    state: varchar('state', { length: 100 }),
    postalCode: varchar('postal_code', { length: 20 }).notNull(),
    country: varchar('country', { length: 100 }).notNull(),
    isDefault: boolean('is_default').notNull().default(false),
  },
  (table) => [index('billing_addresses_order_idx').on(table.orderId)],
);

// Order status history - Track status changes
export const orderStatusHistory = pgTable(
  'order_status_history',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orderId: uuid('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    status: orderStatusEnum('status').notNull(),
    notes: text('notes'),
    changedBy: uuid('changed_by'), // User who changed the status
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    index('order_status_history_order_idx').on(table.orderId),
    index('order_status_history_status_idx').on(table.status),
  ],
);

// Payments table - Track payment transactions
export const payments = pgTable(
  'payments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orderId: uuid('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    transactionId: varchar('transaction_id', { length: 255 }),
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    status: paymentStatusEnum('status').notNull().default('PENDING'),
    method: paymentMethodEnum('method').notNull(),
    metadata: text('metadata'), // JSON for payment gateway response
    processedAt: timestamp('processed_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    index('payments_order_idx').on(table.orderId),
    index('payments_status_idx').on(table.status),
    index('payments_transaction_idx').on(table.transactionId),
  ],
);

// Order refunds table
export const orderRefunds = pgTable(
  'order_refunds',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orderId: uuid('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    paymentId: uuid('payment_id').references(() => payments.id),
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    reason: text('reason'),
    status: varchar('status', { length: 50 }).notNull().default('PENDING'),
    processedBy: uuid('processed_by'), // User who processed the refund
    createdAt: timestamp('created_at').notNull().defaultNow(),
    processedAt: timestamp('processed_at'),
  },
  (table) => [
    index('order_refunds_order_idx').on(table.orderId),
    index('order_refunds_payment_idx').on(table.paymentId),
  ],
);

// Define relations
export const ordersRelations = relations(orders, ({ many, one }) => ({
  items: many(orderItems),
  shippingAddress: one(shippingAddresses),
  billingAddress: one(billingAddresses),
  statusHistory: many(orderStatusHistory),
  payments: many(payments),
  refunds: many(orderRefunds),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
}));

export const shippingAddressesRelations = relations(
  shippingAddresses,
  ({ one }) => ({
    order: one(orders, {
      fields: [shippingAddresses.orderId],
      references: [orders.id],
    }),
  }),
);

export const billingAddressesRelations = relations(
  billingAddresses,
  ({ one }) => ({
    order: one(orders, {
      fields: [billingAddresses.orderId],
      references: [orders.id],
    }),
  }),
);

export const orderStatusHistoryRelations = relations(
  orderStatusHistory,
  ({ one }) => ({
    order: one(orders, {
      fields: [orderStatusHistory.orderId],
      references: [orders.id],
    }),
  }),
);

export const paymentsRelations = relations(payments, ({ one, many }) => ({
  order: one(orders, {
    fields: [payments.orderId],
    references: [orders.id],
  }),
  refunds: many(orderRefunds),
}));

export const orderRefundsRelations = relations(orderRefunds, ({ one }) => ({
  order: one(orders, {
    fields: [orderRefunds.orderId],
    references: [orders.id],
  }),
  payment: one(payments, {
    fields: [orderRefunds.paymentId],
    references: [payments.id],
  }),
}));

// Export types for use in the application
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;
export type ShippingAddress = typeof shippingAddresses.$inferSelect;
export type NewShippingAddress = typeof shippingAddresses.$inferInsert;
export type BillingAddress = typeof billingAddresses.$inferSelect;
export type NewBillingAddress = typeof billingAddresses.$inferInsert;
export type OrderStatusHistory = typeof orderStatusHistory.$inferSelect;
export type NewOrderStatusHistory = typeof orderStatusHistory.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
export type OrderRefund = typeof orderRefunds.$inferSelect;
export type NewOrderRefund = typeof orderRefunds.$inferInsert;

// Export enum types
export type OrderStatus = (typeof orderStatusEnum.enumValues)[number];
export type PaymentStatus = (typeof paymentStatusEnum.enumValues)[number];
export type PaymentMethod = (typeof paymentMethodEnum.enumValues)[number];
export type ShippingMethod = (typeof shippingMethodEnum.enumValues)[number];
