import { relations } from 'drizzle-orm';
import {
  AnyPgColumn,
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

// Media type enum for better type safety
export const mediaTypeEnum = pgEnum('media_type', [
  'IMAGE',
  'VIDEO',
  'DOCUMENT',
  'AUDIO',
]);

// Storage provider enum
export const storageProviderEnum = pgEnum('storage_provider', [
  'LOCAL',
  'S3',
  'CLOUDINARY',
  'AZURE',
]);

// Status enum for media processing
export const mediaStatusEnum = pgEnum('media_status', [
  'PENDING',
  'PROCESSING',
  'COMPLETED',
  'FAILED',
]);

// Media table - Core table for media information
export const media = pgTable(
  'media',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    filename: varchar('filename', { length: 255 }).notNull(),
    originalFilename: varchar('original_filename', { length: 255 }).notNull(),
    mimeType: varchar('mime_type', { length: 100 }).notNull(),
    size: integer('size').notNull(), // Size in bytes
    type: mediaTypeEnum('media_type').notNull(),
    provider: storageProviderEnum('provider').notNull(),
    path: varchar('path', { length: 1000 }).notNull(),
    url: varchar('url', { length: 1000 }).notNull(),
    status: mediaStatusEnum('status').notNull().default('PENDING'),
    ownerId: uuid('owner_id').notNull(), // User ID who owns this media
    isPublic: boolean('is_public').notNull().default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    metadata: text('metadata'), // JSON storage for additional metadata
  },
  (table) => [
    index('media_owner_idx').on(table.ownerId),
    index('media_type_idx').on(table.type),
    index('media_status_idx').on(table.status),
    index('media_public_idx').on(table.isPublic),
  ],
);

// Media Tags table - For tagging and categorizing media
export const mediaTags = pgTable(
  'media_tags',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 100 }).notNull().unique(),
    description: text('description'),
  },
  (table) => [index('media_tags_name_idx').on(table.name)],
);

// Media to Tags relation - Many-to-many relationship
export const mediaToTags = pgTable(
  'media_to_tags',
  {
    mediaId: uuid('media_id')
      .notNull()
      .references(() => media.id, { onDelete: 'cascade' }),
    tagId: uuid('tag_id')
      .notNull()
      .references(() => mediaTags.id, { onDelete: 'cascade' }),
  },
  (table) => [
    primaryKey({ columns: [table.mediaId, table.tagId] }),
    index('media_to_tags_media_idx').on(table.mediaId),
    index('media_to_tags_tag_idx').on(table.tagId),
  ],
);

// Media Variants table - For different sizes/formats of the same media
export const mediaVariants = pgTable(
  'media_variants',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    mediaId: uuid('media_id')
      .notNull()
      .references(() => media.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 100 }).notNull(), // e.g., 'thumbnail', 'medium', 'large'
    path: varchar('path', { length: 1000 }).notNull(),
    url: varchar('url', { length: 1000 }).notNull(),
    width: integer('width'),
    height: integer('height'),
    size: integer('size'), // Size in bytes
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    index('media_variants_media_idx').on(table.mediaId),
    index('media_variants_name_idx').on(table.name),
  ],
);

// Media Folders - For organizing media in folders
export const mediaFolders = pgTable(
  'media_folders',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    parentId: uuid('parent_id').references((): AnyPgColumn => mediaFolders.id, {
      onDelete: 'set null',
    }),
    ownerId: uuid('owner_id').notNull(), // User ID who owns this folder
    path: varchar('path', { length: 1000 }).notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('media_folders_owner_idx').on(table.ownerId),
    index('media_folders_parent_idx').on(table.parentId),
    index('media_folders_path_idx').on(table.path),
  ],
);

// Media to Folders relation - Many-to-many relationship
export const mediaToFolders = pgTable(
  'media_to_folders',
  {
    mediaId: uuid('media_id')
      .notNull()
      .references(() => media.id, { onDelete: 'cascade' }),
    folderId: uuid('folder_id')
      .notNull()
      .references(() => mediaFolders.id, { onDelete: 'cascade' }),
  },
  (table) => [
    primaryKey({ columns: [table.mediaId, table.folderId] }),
    index('media_to_folders_media_idx').on(table.mediaId),
    index('media_to_folders_folder_idx').on(table.folderId),
  ],
);

// Relations
export const mediaRelations = relations(media, ({ many }) => ({
  tags: many(mediaToTags),
  variants: many(mediaVariants),
  folders: many(mediaToFolders),
}));

export const mediaTagsRelations = relations(mediaTags, ({ many }) => ({
  media: many(mediaToTags),
}));

export const mediaToTagsRelations = relations(mediaToTags, ({ one }) => ({
  media: one(media, {
    fields: [mediaToTags.mediaId],
    references: [media.id],
  }),
  tag: one(mediaTags, {
    fields: [mediaToTags.tagId],
    references: [mediaTags.id],
  }),
}));

export const mediaVariantsRelations = relations(mediaVariants, ({ one }) => ({
  media: one(media, {
    fields: [mediaVariants.mediaId],
    references: [media.id],
  }),
}));

export const mediaFoldersRelations = relations(
  mediaFolders,
  ({ one, many }) => ({
    parent: one(mediaFolders, {
      fields: [mediaFolders.parentId],
      references: [mediaFolders.id],
    }),
    children: many(mediaFolders),
    media: many(mediaToFolders),
  }),
);

export const mediaToFoldersRelations = relations(mediaToFolders, ({ one }) => ({
  media: one(media, {
    fields: [mediaToFolders.mediaId],
    references: [media.id],
  }),
  folder: one(mediaFolders, {
    fields: [mediaToFolders.folderId],
    references: [mediaFolders.id],
  }),
}));

// Export types for use in the application
export type Media = typeof media.$inferSelect;
export type NewMedia = typeof media.$inferInsert;
export type MediaTag = typeof mediaTags.$inferSelect;
export type NewMediaTag = typeof mediaTags.$inferInsert;
export type MediaToTag = typeof mediaToTags.$inferSelect;
export type NewMediaToTag = typeof mediaToTags.$inferInsert;
export type MediaVariant = typeof mediaVariants.$inferSelect;
export type NewMediaVariant = typeof mediaVariants.$inferInsert;
export type MediaFolder = typeof mediaFolders.$inferSelect;
export type NewMediaFolder = typeof mediaFolders.$inferInsert;
export type MediaToFolder = typeof mediaToFolders.$inferSelect;
export type NewMediaToFolder = typeof mediaToFolders.$inferInsert;

// Export enum types
export type MediaType = (typeof mediaTypeEnum.enumValues)[number];
export type StorageProvider = (typeof storageProviderEnum.enumValues)[number];
export type MediaStatus = (typeof mediaStatusEnum.enumValues)[number];
