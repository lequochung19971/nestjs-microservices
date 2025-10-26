import { Inject, Injectable, Logger } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DrizzleService } from '../../db/drizzle.service';
import { inventoryItems, inventoryProducts } from '../../db/schema';
import { InventoryStatus } from 'nest-shared/contracts';

@Injectable()
export class InventoryProductsSyncService {
  private readonly logger = new Logger(InventoryProductsSyncService.name);

  constructor(private readonly drizzle: DrizzleService) {}

  async createInventoryProduct(productData: {
    id: string;
    name: string;
    sku: string;
    isActive: boolean;
  }): Promise<void> {
    try {
      // Check if product already exists in inventory_products
      const existingProduct =
        await this.drizzle.client.query.inventoryProducts.findFirst({
          where: eq(inventoryProducts.productId, productData.id),
        });

      if (existingProduct) {
        this.logger.warn(
          `Product ${productData.id} already exists in inventory_products`,
        );
        return;
      }

      await this.drizzle.client.transaction(async (tx) => {
        const [inventoryItem] = await tx
          .insert(inventoryItems)
          .values({
            quantity: 0,
            reservedQuantity: 0,
            status: InventoryStatus.AVAILABLE,
          })
          .returning({
            id: inventoryItems.id,
          });

        await tx.insert(inventoryProducts).values({
          productId: productData.id,
          sku: productData.sku,
          name: productData.name,
          isActive: productData.isActive,
          lastUpdated: new Date(),
          inventoryItemId: inventoryItem.id,
        });
      });

      this.logger.log(
        `Inventory product created for product: ${productData.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to create inventory product for product ${productData.id}: ${error}`,
      );
      throw error;
    }
  }

  async updateInventoryProduct(productData: {
    id: string;
    name: string;
    sku: string;
    isActive: boolean;
  }): Promise<void> {
    try {
      const existingProduct =
        await this.drizzle.client.query.inventoryProducts.findFirst({
          where: eq(inventoryProducts.productId, productData.id),
        });

      if (!existingProduct) {
        this.logger.warn(
          `Product ${productData.id} not found in inventory_products, creating new entry`,
        );
        await this.createInventoryProduct(productData);
        return;
      }

      await this.drizzle.client
        .update(inventoryProducts)
        .set({
          sku: productData.sku,
          name: productData.name,
          isActive: productData.isActive,
          lastUpdated: new Date(),
        })
        .where(eq(inventoryProducts.productId, productData.id));

      this.logger.log(
        `Updated inventory product entry for product: ${productData.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to update inventory product entry for product ${productData.id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async deleteProduct(productId: string): Promise<void> {
    try {
      const existingProduct =
        await this.drizzle.client.query.inventoryProducts.findFirst({
          where: eq(inventoryProducts.productId, productId),
        });

      if (!existingProduct) {
        this.logger.warn(
          `Product ${productId} not found in inventory_products`,
        );
        return;
      }

      // Soft delete by setting isActive to false
      await this.drizzle.client
        .update(inventoryProducts)
        .set({
          isActive: false,
          lastUpdated: new Date(),
        })
        .where(eq(inventoryProducts.productId, productId));

      this.logger.log(
        `Soft deleted inventory product entry for product: ${productId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to delete inventory product entry for product ${productId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async linkProductToInventoryItem(
    productId: string,
    inventoryItemId: string,
  ): Promise<void> {
    try {
      await this.drizzle.client
        .update(inventoryProducts)
        .set({
          inventoryItemId,
          lastUpdated: new Date(),
        })
        .where(eq(inventoryProducts.productId, productId));

      this.logger.log(
        `Linked product ${productId} to inventory item ${inventoryItemId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to link product ${productId} to inventory item ${inventoryItemId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async unlinkProductFromInventoryItem(productId: string): Promise<void> {
    try {
      await this.drizzle.client
        .update(inventoryProducts)
        .set({
          inventoryItemId: null,
          lastUpdated: new Date(),
        })
        .where(eq(inventoryProducts.productId, productId));

      this.logger.log(`Unlinked product ${productId} from inventory item`);
    } catch (error) {
      this.logger.error(
        `Failed to unlink product ${productId} from inventory item: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
