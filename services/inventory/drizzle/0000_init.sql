CREATE TYPE "public"."inventory_status" AS ENUM('AVAILABLE', 'RESERVED', 'SOLD', 'DAMAGED', 'RETURNED');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('PURCHASE', 'SALE', 'RETURN', 'ADJUSTMENT', 'TRANSFER');--> statement-breakpoint
CREATE TABLE "inventory_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"warehouse_id" uuid NOT NULL,
	"quantity" integer DEFAULT 0 NOT NULL,
	"reserved_quantity" integer DEFAULT 0 NOT NULL,
	"status" "inventory_status" DEFAULT 'AVAILABLE' NOT NULL,
	"reorder_point" integer,
	"reorder_quantity" integer,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"sku" varchar(100) NOT NULL,
	"name" varchar(255) NOT NULL,
	"is_active" boolean NOT NULL,
	"media_url" varchar(1000),
	"last_updated" timestamp NOT NULL,
	"inventory_item_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_reservations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"inventory_item_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"order_id" uuid NOT NULL,
	"expires_at" timestamp,
	"status" varchar(50) DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"inventory_item_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"type" "transaction_type" NOT NULL,
	"reference_id" uuid,
	"reference_type" varchar(50),
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" uuid
);
--> statement-breakpoint
CREATE TABLE "warehouses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"address" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_warehouse_id_warehouses_id_fk" FOREIGN KEY ("warehouse_id") REFERENCES "public"."warehouses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_products" ADD CONSTRAINT "inventory_products_inventory_item_id_inventory_items_id_fk" FOREIGN KEY ("inventory_item_id") REFERENCES "public"."inventory_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_reservations" ADD CONSTRAINT "inventory_reservations_inventory_item_id_inventory_items_id_fk" FOREIGN KEY ("inventory_item_id") REFERENCES "public"."inventory_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_inventory_item_id_inventory_items_id_fk" FOREIGN KEY ("inventory_item_id") REFERENCES "public"."inventory_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "inventory_warehouse_idx" ON "inventory_items" USING btree ("warehouse_id");--> statement-breakpoint
CREATE INDEX "inventory_status_idx" ON "inventory_items" USING btree ("status");--> statement-breakpoint
CREATE INDEX "inventory_product_product_id_idx" ON "inventory_products" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "inventory_product_inventory_item_idx" ON "inventory_products" USING btree ("inventory_item_id");--> statement-breakpoint
CREATE INDEX "reservation_inventory_item_idx" ON "inventory_reservations" USING btree ("inventory_item_id");--> statement-breakpoint
CREATE INDEX "reservation_order_idx" ON "inventory_reservations" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "reservation_status_idx" ON "inventory_reservations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "transaction_inventory_item_idx" ON "inventory_transactions" USING btree ("inventory_item_id");--> statement-breakpoint
CREATE INDEX "transaction_type_idx" ON "inventory_transactions" USING btree ("type");--> statement-breakpoint
CREATE INDEX "transaction_reference_idx" ON "inventory_transactions" USING btree ("reference_id","reference_type");--> statement-breakpoint
CREATE INDEX "warehouse_name_idx" ON "warehouses" USING btree ("name");--> statement-breakpoint
CREATE INDEX "warehouse_active_idx" ON "warehouses" USING btree ("is_active");