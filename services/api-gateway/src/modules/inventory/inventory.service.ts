import { Injectable, Logger } from '@nestjs/common';
import { Request } from 'express';
import {
  InventoryItemDto,
  QueryInventoryItemRequest,
  QueryResponse,
  CreateInventoryItemDto,
  UpdateInventoryItemDto,
  AdjustQuantityDto,
  WarehouseDto,
  CreateWarehouseDto,
  UpdateWarehouseDto,
  QueryWarehouseRequest,
  InventoryTransactionDto,
  CreateInventoryTransactionDto,
  QueryInventoryTransactionRequest,
  InventoryReservationDto,
  CreateInventoryReservationDto,
  UpdateInventoryReservationDto,
  FulfillReservationDto,
  CancelReservationDto,
  QueryInventoryReservationRequest,
  SortField,
} from 'nest-shared/contracts';
import { ApiClientService } from 'nest-shared/api-clients/api-client.service';
import { AppConfigService } from '../../app-config/app-config.service';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);
  private readonly serviceName = 'inventory';

  constructor(
    private readonly apiClientService: ApiClientService,
    private readonly configService: AppConfigService,
  ) {}

  // Warehouse Operations

  async createWarehouse(
    dto: CreateWarehouseDto,
    headers?: Request['headers'],
  ): Promise<WarehouseDto> {
    this.logger.log(`Creating warehouse: ${dto.name}`);
    return this.apiClientService.inventory
      .POST('/warehouses', {
        headers,
        body: {
          name: dto.name,
          address: dto.address,
          isActive: dto.isActive ?? true,
        },
      })
      .then((response) => response.data as unknown as WarehouseDto);
  }

  async findAllWarehouses(
    query: QueryWarehouseRequest,
    headers?: Request['headers'],
  ) {
    this.logger.log('Finding all warehouses');
    return this.apiClientService.inventory
      .GET('/warehouses', {
        headers,
        params: {
          query,
        },
      })
      .then(
        (response) => response.data as unknown as QueryResponse<WarehouseDto>,
      );
  }

  async getWarehouseById(
    id: string,
    headers?: Request['headers'],
  ): Promise<WarehouseDto> {
    this.logger.log(`Finding warehouse with id: ${id}`);
    return this.apiClientService.inventory
      .GET('/warehouses/{id}', { headers, params: { path: { id } } })
      .then((response) => response.data as unknown as WarehouseDto);
  }

  async updateWarehouse(
    id: string,
    dto: UpdateWarehouseDto,
    headers?: Request['headers'],
  ): Promise<WarehouseDto> {
    this.logger.log(`Updating warehouse with id: ${id}`);
    return this.apiClientService.inventory
      .PUT('/warehouses/{id}', {
        params: { path: { id } },
        headers,
        body: dto,
      })
      .then((response) => response.data as unknown as WarehouseDto);
  }

  async deleteWarehouse(
    id: string,
    headers?: Request['headers'],
  ): Promise<WarehouseDto> {
    this.logger.log(`Deleting warehouse with id: ${id}`);
    return this.apiClientService.inventory
      .DELETE('/warehouses/{id}', { headers, params: { path: { id } } })
      .then((response) => response.data as unknown as WarehouseDto);
  }

  // Inventory Item Operations

  async createInventoryItem(
    dto: CreateInventoryItemDto,
    headers?: Request['headers'],
  ): Promise<InventoryItemDto> {
    this.logger.log(`Creating inventory item in warehouse: ${dto.warehouseId}`);
    return this.apiClientService.inventory
      .POST('/inventory-items', {
        headers,
        body: {
          warehouseId: dto.warehouseId,
          quantity: dto.quantity,
          status: dto.status,
          reorderPoint: dto.reorderPoint,
          reorderQuantity: dto.reorderQuantity,
        },
      })
      .then((response) => response.data as unknown as InventoryItemDto);
  }

  async findAllInventoryItems(
    query: QueryInventoryItemRequest,
    headers?: Request['headers'],
  ) {
    this.logger.log('Finding all inventory items');
    return this.apiClientService.inventory
      .GET('/inventory-items', {
        headers,
        params: {
          query,
        },
      })
      .then(
        (response) =>
          response.data as unknown as QueryResponse<InventoryItemDto>,
      );
  }

  async getInventoryItemById(
    id: string,
    headers?: Request['headers'],
  ): Promise<InventoryItemDto> {
    this.logger.log(`Finding inventory item with id: ${id}`);
    return this.apiClientService.inventory
      .GET('/inventory-items/{id}', { headers, params: { path: { id } } })
      .then((response) => response.data as unknown as InventoryItemDto);
  }

  async getInventoryItemsByWarehouse(
    warehouseId: string,
    headers?: Request['headers'],
  ): Promise<InventoryItemDto[]> {
    this.logger.log(`Finding inventory items in warehouse: ${warehouseId}`);
    return this.apiClientService.inventory
      .GET('/inventory-items/warehouse/{warehouseId}', {
        headers,
        params: { path: { warehouseId } },
      })
      .then((response) => response.data as unknown as InventoryItemDto[]);
  }

  async getInventoryItemsByProduct(
    productId: string,
    headers?: Request['headers'],
  ): Promise<InventoryItemDto[]> {
    this.logger.log(`Finding inventory items for product: ${productId}`);
    return this.apiClientService.inventory
      .GET('/inventory-items/product/{productId}', {
        headers,
        params: { path: { productId } },
      })
      .then((response) => response.data as unknown as InventoryItemDto[]);
  }

  async updateInventoryItem(
    id: string,
    dto: UpdateInventoryItemDto,
    headers?: Request['headers'],
  ): Promise<InventoryItemDto> {
    this.logger.log(`Updating inventory item with id: ${id}`);
    return this.apiClientService.inventory
      .PUT('/inventory-items/{id}', {
        params: { path: { id } },
        headers,
        body: dto,
      })
      .then((response) => response.data as unknown as InventoryItemDto);
  }

  async adjustInventoryItemQuantity(
    id: string,
    dto: AdjustQuantityDto,
    headers?: Request['headers'],
  ): Promise<InventoryItemDto> {
    this.logger.log(
      `Adjusting quantity for inventory item ${id}: ${dto.quantity}`,
    );
    const response = await this.apiClientService.inventory.PUT(
      '/inventory-items/{id}/quantity',
      {
        params: { path: { id } },
        headers,
        body: dto,
      },
    );

    return response.data as unknown as InventoryItemDto;
  }

  async deleteInventoryItem(
    id: string,
    headers?: Request['headers'],
  ): Promise<InventoryItemDto> {
    this.logger.log(`Deleting inventory item with id: ${id}`);
    const response = await this.apiClientService.inventory.DELETE(
      '/inventory-items/{id}',
      { params: { path: { id } }, headers },
    );

    return response.data as unknown as InventoryItemDto;
  }

  // Inventory Transaction Operations

  async createTransaction(
    dto: CreateInventoryTransactionDto,
    headers?: Request['headers'],
  ): Promise<InventoryTransactionDto> {
    this.logger.log(`Creating inventory transaction`);
    const response = await this.apiClientService.inventory.POST(
      '/inventory-transactions',
      {
        headers,
        body: dto,
      },
    );

    return response.data as unknown as InventoryTransactionDto;
  }

  async findAllTransactions(
    query: QueryInventoryTransactionRequest,
    headers?: Request['headers'],
  ) {
    this.logger.log('Finding all inventory transactions');
    const response = await this.apiClientService.inventory.GET(
      '/inventory-transactions',
      {
        headers,
        params: {
          query: {
            ...query,
            startDate: query.startDate?.toISOString(),
            endDate: query.endDate?.toISOString(),
          },
        },
      },
    );

    return response.data;
  }

  async getTransactionById(
    id: string,
    headers?: Request['headers'],
  ): Promise<InventoryTransactionDto> {
    this.logger.log(`Finding inventory transaction with id: ${id}`);
    const response = await this.apiClientService.inventory.GET(
      '/inventory-transactions/{id}',
      { params: { path: { id } }, headers },
    );

    return response.data as unknown as InventoryTransactionDto;
  }

  async getTransactionsByInventoryItem(
    inventoryItemId: string,
    headers?: Request['headers'],
  ): Promise<InventoryTransactionDto[]> {
    this.logger.log(
      `Finding inventory transactions for inventory item: ${inventoryItemId}`,
    );
    const response = await this.apiClientService.inventory.GET(
      '/inventory-transactions/item/{inventoryItemId}',
      { params: { path: { inventoryItemId } }, headers },
    );

    return response.data as unknown as InventoryTransactionDto[];
  }

  async getTransactionSummary(
    inventoryItemId: string,
    headers?: Request['headers'],
  ) {
    this.logger.log(
      `Getting transaction summary for inventory item: ${inventoryItemId}`,
    );
    const response = await this.apiClientService.inventory.GET(
      '/inventory-transactions/item/{inventoryItemId}/summary',
      { params: { path: { inventoryItemId } }, headers },
    );

    return response.data;
  }

  // Inventory Reservation Operations

  async createReservation(
    dto: CreateInventoryReservationDto,
    headers?: Request['headers'],
  ): Promise<InventoryReservationDto> {
    this.logger.log(`Creating inventory reservation`);
    const response = await this.apiClientService.inventory.POST(
      '/inventory-reservations',
      {
        headers,
        body: {
          inventoryItemId: dto.inventoryItemId,
          quantity: dto.quantity,
          orderId: dto.orderId,
          expiresAt: dto.expiresAt?.toISOString(),
        },
      },
    );

    return response.data as unknown as InventoryReservationDto;
  }

  async findAllReservations(
    query: QueryInventoryReservationRequest,
    headers?: Request['headers'],
  ) {
    this.logger.log('Finding all inventory reservations');
    const response = await this.apiClientService.inventory.GET(
      '/inventory-reservations',
      {
        headers,
        params: {
          query,
        },
      },
    );

    return response.data as unknown as QueryResponse<InventoryReservationDto>;
  }

  async getReservationById(
    id: string,
    headers?: Request['headers'],
  ): Promise<InventoryReservationDto> {
    this.logger.log(`Finding inventory reservation with id: ${id}`);
    const response = await this.apiClientService.inventory.GET(
      '/inventory-reservations/{id}',
      { params: { path: { id } }, headers },
    );

    return response.data as unknown as InventoryReservationDto;
  }

  async updateReservation(
    id: string,
    dto: UpdateInventoryReservationDto,
    headers?: Request['headers'],
  ): Promise<InventoryReservationDto> {
    this.logger.log(`Updating inventory reservation with id: ${id}`);
    const response = await this.apiClientService.inventory.PUT(
      '/inventory-reservations/{id}',
      {
        params: { path: { id } },
        headers,
        body: {
          quantity: dto.quantity,
          expiresAt: dto.expiresAt?.toISOString(),
        },
      },
    );

    return response.data as unknown as InventoryReservationDto;
  }

  async fulfillReservation(
    id: string,
    dto: FulfillReservationDto,
    headers?: Request['headers'],
  ): Promise<InventoryReservationDto> {
    this.logger.log(`Fulfilling inventory reservation with id: ${id}`);
    const response = await this.apiClientService.inventory.PUT(
      '/inventory-reservations/{id}/fulfill',
      { params: { path: { id } }, headers, body: dto },
    );

    return response.data as unknown as InventoryReservationDto;
  }

  async cancelReservation(
    id: string,
    dto: CancelReservationDto,
    headers?: Request['headers'],
  ): Promise<InventoryReservationDto> {
    this.logger.log(`Canceling inventory reservation with id: ${id}`);
    const response = await this.apiClientService.inventory.PUT(
      '/inventory-reservations/{id}/cancel',
      { params: { path: { id } }, headers, body: dto },
    );

    return response.data as unknown as InventoryReservationDto;
  }

  async deleteReservation(
    id: string,
    headers?: Request['headers'],
  ): Promise<InventoryReservationDto> {
    this.logger.log(`Deleting inventory reservation with id: ${id}`);
    const response = await this.apiClientService.inventory.DELETE(
      '/inventory-reservations/{id}',
      { params: { path: { id } }, headers },
    );

    return response.data as unknown as InventoryReservationDto;
  }

  async processExpiredReservations(headers?: Request['headers']) {
    this.logger.log(`Processing expired reservations`);
    const response = await this.apiClientService.inventory.POST(
      '/inventory-reservations/process-expired',
      { headers },
    );

    return response.data;
  }
}
