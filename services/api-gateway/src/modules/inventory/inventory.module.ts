import { Module } from '@nestjs/common';
import { AppConfigModule } from '../../app-config/app-config.module';
import { ApiClientService } from 'nest-shared/api-clients/api-client.service';
import { InventoryService } from './inventory.service';
import { WarehousesController } from './warehouses.controller';
import { InventoryItemsController } from './inventory-items.controller';
import { InventoryTransactionsController } from './inventory-transactions.controller';
import { InventoryReservationsController } from './inventory-reservations.controller';

@Module({
  imports: [AppConfigModule],
  controllers: [
    WarehousesController,
    InventoryItemsController,
    InventoryTransactionsController,
    InventoryReservationsController,
  ],
  providers: [InventoryService, ApiClientService],
  exports: [InventoryService],
})
export class InventoryModule {}
