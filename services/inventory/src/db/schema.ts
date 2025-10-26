import { relations } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

// Inventory status enum
export const inventoryStatusEnum = pgEnum('inventory_status', [
  'AVAILABLE',
  'RESERVED',
  'SOLD',
  'DAMAGED',
  'RETURNED',
]);

// Transaction type enum
export const transactionTypeEnum = pgEnum('transaction_type', [
  'PURCHASE',
  'SALE',
  'RETURN',
  'ADJUSTMENT',
  'TRANSFER',
]);

// Warehouses/Locations table
export const warehouses = pgTable(
  'warehouses',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    address: text('address'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('warehouse_name_idx').on(table.name),
    index('warehouse_active_idx').on(table.isActive),
  ],
);

// Inventory items table - tracks quantity per product per location
export const inventoryItems = pgTable(
  'inventory_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    warehouseId: uuid('warehouse_id').references(() => warehouses.id, {
      onDelete: 'cascade',
    }),
    quantity: integer('quantity').notNull().default(0),
    reservedQuantity: integer('reserved_quantity').notNull().default(0),
    status: inventoryStatusEnum('status').notNull().default('AVAILABLE'),
    reorderPoint: integer('reorder_point'),
    reorderQuantity: integer('reorder_quantity'),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('inventory_warehouse_idx').on(table.warehouseId),
    index('inventory_status_idx').on(table.status),
  ],
);

export const inventoryProducts = pgTable(
  'inventory_products',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    productId: uuid('product_id').notNull(),
    sku: varchar('sku', { length: 100 }).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    isActive: boolean('is_active').notNull(),
    mediaUrl: varchar('media_url', { length: 1000 }), // Primary image URL
    lastUpdated: timestamp('last_updated').notNull(),
    inventoryItemId: uuid('inventory_item_id')
      .notNull()
      .references(() => inventoryItems.id),
  },
  (table) => [
    index('inventory_product_product_id_idx').on(table.productId),
    index('inventory_product_inventory_item_idx').on(table.inventoryItemId),
  ],
);

// Inventory transactions table - tracks all movements of inventory
export const inventoryTransactions = pgTable(
  'inventory_transactions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    inventoryItemId: uuid('inventory_item_id')
      .notNull()
      .references(() => inventoryItems.id),
    quantity: integer('quantity').notNull(),
    type: transactionTypeEnum('type').notNull(),
    referenceId: uuid('reference_id'), // Order ID, Purchase ID, etc.
    referenceType: varchar('reference_type', { length: 50 }), // "order", "purchase", etc.
    notes: text('notes'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    createdBy: uuid('created_by'), // User who performed the transaction
  },
  (table) => [
    index('transaction_inventory_item_idx').on(table.inventoryItemId),
    index('transaction_type_idx').on(table.type),
    index('transaction_reference_idx').on(
      table.referenceId,
      table.referenceType,
    ),
  ],
);

// Inventory reservations - for reserving inventory before order fulfillment
export const inventoryReservations = pgTable(
  'inventory_reservations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    inventoryItemId: uuid('inventory_item_id')
      .notNull()
      .references(() => inventoryItems.id),
    quantity: integer('quantity').notNull(),
    orderId: uuid('order_id').notNull(), // Reference to order
    expiresAt: timestamp('expires_at'), // Optional expiration for the reservation
    status: varchar('status', { length: 50 }).notNull().default('ACTIVE'), // ACTIVE, FULFILLED, CANCELLED
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('reservation_inventory_item_idx').on(table.inventoryItemId),
    index('reservation_order_idx').on(table.orderId),
    index('reservation_status_idx').on(table.status),
  ],
);

// Define relations
export const warehousesRelations = relations(warehouses, ({ many }) => ({
  inventoryItems: many(inventoryItems),
}));

export const inventoryProductsRelations = relations(
  inventoryProducts,
  ({ one }) => ({
    inventoryItem: one(inventoryItems, {
      fields: [inventoryProducts.inventoryItemId],
      references: [inventoryItems.id],
    }),
  }),
);

export const inventoryItemsRelations = relations(
  inventoryItems,
  ({ one, many }) => ({
    warehouse: one(warehouses, {
      fields: [inventoryItems.warehouseId],
      references: [warehouses.id],
    }),
    transactions: many(inventoryTransactions),
    reservations: many(inventoryReservations),
  }),
);

export const inventoryTransactionsRelations = relations(
  inventoryTransactions,
  ({ one }) => ({
    inventoryItem: one(inventoryItems, {
      fields: [inventoryTransactions.inventoryItemId],
      references: [inventoryItems.id],
    }),
  }),
);

export const inventoryReservationsRelations = relations(
  inventoryReservations,
  ({ one }) => ({
    inventoryItem: one(inventoryItems, {
      fields: [inventoryReservations.inventoryItemId],
      references: [inventoryItems.id],
    }),
  }),
);

// Export types for use in the application
export type Warehouse = typeof warehouses.$inferSelect;
export type NewWarehouse = typeof warehouses.$inferInsert;
export type InventoryItem = typeof inventoryItems.$inferSelect;
export type NewInventoryItem = typeof inventoryItems.$inferInsert;
export type InventoryTransaction = typeof inventoryTransactions.$inferSelect;
export type NewInventoryTransaction = typeof inventoryTransactions.$inferInsert;
export type InventoryReservation = typeof inventoryReservations.$inferSelect;
export type NewInventoryReservation = typeof inventoryReservations.$inferInsert;
