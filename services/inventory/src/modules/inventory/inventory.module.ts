import { Module } from '@nestjs/common';
import { InventoryItemsController } from './inventory-items.controller';
import { InventoryItemsService } from './inventory-items.service';
import { InventoryConsumers } from './inventory-consumers';
import { InventoryProductsSyncService } from './inventory-products-sync.service';
import { InventoryPublishers } from './inventory-publishers';
import { InventoryReservationsController } from './inventory-reservations.controller';
import { InventoryReservationsService } from './inventory-reservations.service';
import { InventoryTransactionsController } from './inventory-transactions.controller';
import { InventoryTransactionsService } from './inventory-transactions.service';
import { WarehousesController } from './warehouses.controller';
import { WarehousesService } from './warehouses.service';
import { InventoryOrderHandlerService } from './inventory-order-handler.service';

@Module({
  controllers: [
    InventoryItemsController,
    InventoryTransactionsController,
    InventoryReservationsController,
    WarehousesController,
  ],
  providers: [
    InventoryItemsService,
    InventoryTransactionsService,
    InventoryReservationsService,
    WarehousesService,
    InventoryProductsSyncService,
    InventoryOrderHandlerService,
    InventoryConsumers,
    InventoryPublishers,
  ],
  exports: [
    InventoryItemsService,
    InventoryTransactionsService,
    InventoryReservationsService,
    WarehousesService,
    InventoryProductsSyncService,
    InventoryOrderHandlerService,
    InventoryConsumers,
    InventoryPublishers,
  ],
})
export class InventoryModule {}
