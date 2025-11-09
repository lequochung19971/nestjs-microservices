ALTER TABLE "inventory_products" DROP CONSTRAINT "inventory_products_inventory_item_id_inventory_items_id_fk";
--> statement-breakpoint
DROP INDEX "inventory_product_inventory_item_idx";--> statement-breakpoint
ALTER TABLE "inventory_items" ADD COLUMN "inventory_product_id" uuid;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_inventory_product_id_inventory_products_id_fk" FOREIGN KEY ("inventory_product_id") REFERENCES "public"."inventory_products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "inventory_product_inventory_product_id_idx" ON "inventory_items" USING btree ("inventory_product_id");--> statement-breakpoint
ALTER TABLE "inventory_products" DROP COLUMN "inventory_item_id";