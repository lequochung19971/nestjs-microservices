export class ProductDeletedEvent {
  id: string;
  timestamp: string;

  constructor(data: { id: string; timestamp?: string }) {
    this.id = data.id;
    this.timestamp = data.timestamp || new Date().toISOString();
  }
}

export class InventoryUpdatedEvent {
  inventoryItemId: string;
  warehouseId: string;
  productId: string;
  quantity: number;
  reservedQuantity: number;
  status: string;
  timestamp: string;

  constructor(data: {
    inventoryItemId: string;
    warehouseId: string;
    productId: string;
    quantity: number;
    reservedQuantity: number;
    status: string;
    timestamp?: string;
  }) {
    this.inventoryItemId = data.inventoryItemId;
    this.warehouseId = data.warehouseId;
    this.productId = data.productId;
    this.quantity = data.quantity;
    this.reservedQuantity = data.reservedQuantity;
    this.status = data.status;
    this.timestamp = data.timestamp || new Date().toISOString();
  }
}

export class LowStockAlertEvent {
  inventoryItemId: string;
  warehouseId: string;
  productId: string;
  currentQuantity: number;
  reorderPoint: number;
  reorderQuantity: number;
  timestamp: string;

  constructor(data: {
    inventoryItemId: string;
    warehouseId: string;
    productId: string;
    currentQuantity: number;
    reorderPoint: number;
    reorderQuantity: number;
    timestamp?: string;
  }) {
    this.inventoryItemId = data.inventoryItemId;
    this.warehouseId = data.warehouseId;
    this.productId = data.productId;
    this.currentQuantity = data.currentQuantity;
    this.reorderPoint = data.reorderPoint;
    this.reorderQuantity = data.reorderQuantity;
    this.timestamp = data.timestamp || new Date().toISOString();
  }
}

export class InventoryReservedEvent {
  reservationId: string;
  inventoryItemId: string;
  orderId: string;
  quantity: number;
  expiresAt?: string;
  timestamp: string;

  constructor(data: {
    reservationId: string;
    inventoryItemId: string;
    orderId: string;
    quantity: number;
    expiresAt?: string;
    timestamp?: string;
  }) {
    this.reservationId = data.reservationId;
    this.inventoryItemId = data.inventoryItemId;
    this.orderId = data.orderId;
    this.quantity = data.quantity;
    this.expiresAt = data.expiresAt;
    this.timestamp = data.timestamp || new Date().toISOString();
  }
}

export class InventoryReleasedEvent {
  reservationId: string;
  inventoryItemId: string;
  orderId: string;
  quantity: number;
  reason: string;
  timestamp: string;

  constructor(data: {
    reservationId: string;
    inventoryItemId: string;
    orderId: string;
    quantity: number;
    reason: string;
    timestamp?: string;
  }) {
    this.reservationId = data.reservationId;
    this.inventoryItemId = data.inventoryItemId;
    this.orderId = data.orderId;
    this.quantity = data.quantity;
    this.reason = data.reason;
    this.timestamp = data.timestamp || new Date().toISOString();
  }
}
