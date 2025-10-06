CREATE TYPE "public"."media_status" AS ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."media_type" AS ENUM('IMAGE', 'VIDEO', 'DOCUMENT', 'AUDIO');--> statement-breakpoint
CREATE TYPE "public"."storage_provider" AS ENUM('LOCAL', 'S3', 'CLOUDINARY', 'AZURE');--> statement-breakpoint
CREATE TABLE "media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"filename" varchar(255) NOT NULL,
	"original_filename" varchar(255) NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"size" integer NOT NULL,
	"media_type" "media_type" NOT NULL,
	"provider" "storage_provider" NOT NULL,
	"path" varchar(1000) NOT NULL,
	"url" varchar(1000) NOT NULL,
	"status" "media_status" DEFAULT 'PENDING' NOT NULL,
	"owner_id" uuid NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"metadata" text
);
--> statement-breakpoint
CREATE TABLE "media_folders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"parent_id" uuid,
	"owner_id" uuid NOT NULL,
	"path" varchar(1000) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media_tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	CONSTRAINT "media_tags_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "media_to_folders" (
	"media_id" uuid NOT NULL,
	"folder_id" uuid NOT NULL,
	CONSTRAINT "media_to_folders_media_id_folder_id_pk" PRIMARY KEY("media_id","folder_id")
);
--> statement-breakpoint
CREATE TABLE "media_to_tags" (
	"media_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	CONSTRAINT "media_to_tags_media_id_tag_id_pk" PRIMARY KEY("media_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "media_variants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"media_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"path" varchar(1000) NOT NULL,
	"url" varchar(1000) NOT NULL,
	"width" integer,
	"height" integer,
	"size" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "media_folders" ADD CONSTRAINT "media_folders_parent_id_media_folders_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."media_folders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_to_folders" ADD CONSTRAINT "media_to_folders_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_to_folders" ADD CONSTRAINT "media_to_folders_folder_id_media_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."media_folders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_to_tags" ADD CONSTRAINT "media_to_tags_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_to_tags" ADD CONSTRAINT "media_to_tags_tag_id_media_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."media_tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_variants" ADD CONSTRAINT "media_variants_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "media_owner_idx" ON "media" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "media_type_idx" ON "media" USING btree ("media_type");--> statement-breakpoint
CREATE INDEX "media_status_idx" ON "media" USING btree ("status");--> statement-breakpoint
CREATE INDEX "media_public_idx" ON "media" USING btree ("is_public");--> statement-breakpoint
CREATE INDEX "media_folders_owner_idx" ON "media_folders" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "media_folders_parent_idx" ON "media_folders" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "media_folders_path_idx" ON "media_folders" USING btree ("path");--> statement-breakpoint
CREATE INDEX "media_tags_name_idx" ON "media_tags" USING btree ("name");--> statement-breakpoint
CREATE INDEX "media_to_folders_media_idx" ON "media_to_folders" USING btree ("media_id");--> statement-breakpoint
CREATE INDEX "media_to_folders_folder_idx" ON "media_to_folders" USING btree ("folder_id");--> statement-breakpoint
CREATE INDEX "media_to_tags_media_idx" ON "media_to_tags" USING btree ("media_id");--> statement-breakpoint
CREATE INDEX "media_to_tags_tag_idx" ON "media_to_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE INDEX "media_variants_media_idx" ON "media_variants" USING btree ("media_id");--> statement-breakpoint
CREATE INDEX "media_variants_name_idx" ON "media_variants" USING btree ("name");