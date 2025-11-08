export class ProductCreatedEvent {
  id: string;
  name: string;
  sku: string;
  isActive: boolean;
  timestamp: string;

  constructor(data: {
    id: string;
    name: string;
    sku: string;
    isActive: boolean;
    timestamp?: string;
  }) {
    this.id = data.id;
    this.name = data.name;
    this.sku = data.sku;
    this.isActive = data.isActive;
    this.timestamp = data.timestamp || new Date().toISOString();
  }
}

export class ProductUpdatedEvent {
  id: string;
  name: string;
  sku: string;
  isActive: boolean;
  timestamp: string;
  description?: string;
  price?: string;
  currency?: string;

  constructor(data: {
    id: string;
    name: string;
    sku: string;
    isActive: boolean;
    timestamp?: string;
    description?: string;
    price?: string;
    currency?: string;
  }) {
    this.id = data.id;
    this.name = data.name;
    this.sku = data.sku;
    this.isActive = data.isActive;
    this.timestamp = data.timestamp || new Date().toISOString();
    this.description = data.description;
    this.price = data.price;
    this.currency = data.currency;
  }
}
