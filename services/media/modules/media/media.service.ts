import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { and, eq, inArray, like, sql, SQL, exists } from 'drizzle-orm';
import { DrizzleService } from '../../src/db/drizzle.service';
import {
  Media,
  media,
  mediaFolders,
  mediaToFolders,
  MediaVariant,
} from '../../src/db/schema';
import { StorageService } from '../storage/storage.service';
import { VariantService } from './variant.service';
import {
  CreateMediaDto,
  FolderResponseDto,
  MediaQueryDto,
  MediaResponseDto,
  MediaType,
  MediaVariantResponseDto,
  UpdateMediaDto,
} from 'nest-shared/contracts';
import { MediaPublishers } from './media-publishers';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    private readonly storageService: StorageService,
    private readonly db: DrizzleService,
    private readonly variantService: VariantService,
    private readonly mediaPublishers: MediaPublishers,
  ) {}

  /**
   * Upload and create a new media entry
   */
  async create(createMediaDto: CreateMediaDto): Promise<MediaResponseDto> {
    const {
      file,
      ownerId = crypto.randomUUID(),
      isPublic = false,
      metadata = {},
      path = '',
      folderId,
    } = createMediaDto;

    try {
      // Generate a unique filename
      const fileExtension = file.originalname.split('.').pop();
      const uniqueFilename = `${crypto.randomUUID()}.${fileExtension}`;

      // Determine media type based on mimetype
      const type = this.getMediaTypeFromMimetype(file.mimetype);

      // Upload file to storage
      const url = await this.storageService.upload({
        filename: uniqueFilename,
        buffer: file.buffer,
        mimetype: file.mimetype,
        path,
      });

      return this.db.client.transaction(async (tx) => {
        // Create media record in database
        const [newMedia] = await tx
          .insert(media)
          .values({
            filename: uniqueFilename,
            originalFilename: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            type: type,
            provider: 'S3',
            path: path || null,
            url,
            status: 'COMPLETED',
            ownerId,
            isPublic,
            metadata: metadata ? JSON.stringify(metadata) : null,
          })
          .returning()
          .execute();

        const folder = folderId
          ? await tx.query.mediaFolders.findFirst({
              where: eq(mediaFolders.id, folderId),
            })
          : undefined;

        if (folder) {
          await tx
            .insert(mediaToFolders)
            .values({
              mediaId: newMedia.id,
              folderId: folder.id,
            })
            .execute();
        }

        const newMediaResponse = new MediaResponseDto();
        newMediaResponse.id = newMedia.id;
        newMediaResponse.filename = newMedia.filename;
        newMediaResponse.originalFilename = newMedia.originalFilename;
        newMediaResponse.mimeType = newMedia.mimeType;
        newMediaResponse.size = newMedia.size;
        newMediaResponse.type = newMedia.type as MediaType;
        newMediaResponse.provider = newMedia.provider;
        newMediaResponse.path = newMedia.path;
        newMediaResponse.url = newMedia.url;
        newMediaResponse.status = newMedia.status;
        newMediaResponse.ownerId = newMedia.ownerId;
        newMediaResponse.isPublic = newMedia.isPublic;
        newMediaResponse.metadata = newMedia.metadata
          ? JSON.parse(newMedia.metadata)
          : {};
        newMediaResponse.folder = folder;

        // Generate variants for images
        if (file.mimetype.startsWith('image/')) {
          try {
            const variants = await this.variantService.generateVariants({
              mediaId: newMedia.id,
              file: file.buffer,
              mimeType: file.mimetype,
              path,
            });

            newMediaResponse.variants = variants as MediaVariantResponseDto[];
          } catch (error) {
            this.logger.error(`Failed to generate variants: ${error.message}`);
            // Continue even if variant generation fails
          }
        }

        return newMediaResponse;
      });
    } catch (error) {
      this.logger.error(
        `Failed to create media: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(`Failed to upload media: ${error.message}`);
    }
  }

  /**
   * Get a single media by ID
   */
  async findOne(id: string, ownerId?: string) {
    try {
      const query = ownerId
        ? and(eq(media.id, id), eq(media.ownerId, ownerId))
        : eq(media.id, id);

      const mediaItem = await this.db.client.query.media.findFirst({
        where: query,
      });

      if (!mediaItem) {
        throw new NotFoundException(`Media with ID ${id} not found`);
      }

      // Get variants if this is an image
      let variants = [];
      if (mediaItem.mimeType.startsWith('image/')) {
        try {
          variants = await this.variantService.getVariantsForMedia(id);
        } catch (error) {
          this.logger.error(`Failed to fetch variants: ${error.message}`);
          // Continue even if variant fetching fails
        }
      }

      return {
        ...mediaItem,
        metadata: mediaItem.metadata ? JSON.parse(mediaItem.metadata) : {},
        variants,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to find media ${id}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(`Failed to get media: ${error.message}`);
    }
  }

  /**
   * Get media by IDs
   */
  async findByIds(ids: string[]): Promise<Media[]> {
    const mediaItems = await this.db.client.query.media.findMany({
      where: inArray(media.id, ids),
    });
    return mediaItems;
  }

  /**
   * List media with filtering and pagination
   */
  async findAll(query: MediaQueryDto) {
    const {
      page = 1,
      limit = 20,
      type,
      search,
      tags,
      ownerId,
      folderId,
    } = query;

    try {
      const offset = (page - 1) * limit;

      // Build where conditions
      const whereConditions: SQL[] = [];

      if (type) {
        whereConditions.push(eq(media.type, type as MediaType));
      }

      if (search) {
        whereConditions.push(like(media.originalFilename, `%${search}%`));
      }

      if (ownerId) {
        whereConditions.push(eq(media.ownerId, ownerId));
      }

      // Handle folderId filtering using EXISTS subquery
      if (folderId) {
        whereConditions.push(
          exists(
            this.db.client
              .select()
              .from(mediaToFolders)
              .where(
                and(
                  eq(mediaToFolders.mediaId, media.id),
                  eq(mediaToFolders.folderId, folderId),
                ),
              ),
          ),
        );
      }

      // Execute query using the relational query API
      const whereClause =
        whereConditions.length > 0 ? and(...whereConditions) : undefined;

      const items = await this.db.client.query.media.findMany({
        where: whereClause,
        limit: limit,
        offset: offset,
        orderBy: (media, { asc }) => [asc(media.createdAt)],
      });

      // Get total count for pagination
      const countResult = await this.db.client
        .select({ count: sql`count(*)` })
        .from(media)
        .where(whereClause);

      const total = Number(countResult[0].count) || 0;

      // Process metadata for each item
      const processedItems = items.map((item) => ({
        ...item,
        metadata: item.metadata ? JSON.parse(item.metadata as string) : {},
      }));

      return {
        items: processedItems,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this.logger.error(`Failed to find media: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to list media: ${error.message}`);
    }
  }

  /**
   * Update media metadata
   */
  async update(id: string, updateData: UpdateMediaDto, ownerId?: string) {
    try {
      // Check if media exists and user has access
      await this.findOne(id, ownerId);

      // Process metadata if provided
      let processedData: Partial<Media> = {
        originalFilename: updateData.originalFilename,
        mimeType: updateData.mimeType,
        type: updateData.type,
        provider: updateData.provider,
        path: updateData.path,
        url: updateData.url,
        status: updateData.status,
        isPublic: updateData.isPublic,
        metadata: updateData.metadata
          ? JSON.stringify(updateData.metadata)
          : undefined,
        updatedAt: new Date(),
      };

      // Update in database
      const [updatedMedia] = await this.db.client
        .update(media)
        .set(processedData)
        .where(eq(media.id, id))
        .returning();

      this.mediaPublishers.publishMediaUpdated({
        id: updatedMedia.id,
        originalFilename: updatedMedia.originalFilename,
        mimeType: updatedMedia.mimeType,
        size: updatedMedia.size,
        type: updatedMedia.type as MediaType,
        url: updatedMedia.url,
      });

      return {
        ...updatedMedia,
        metadata: updatedMedia.metadata
          ? JSON.parse(updatedMedia.metadata)
          : {},
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to update media ${id}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(`Failed to update media: ${error.message}`);
    }
  }

  /**
   * Delete media and associated file
   */
  async delete(id: string, ownerId?: string) {
    try {
      // Get media details first to have access to filename and path for storage deletion
      const mediaItem = await this.findOne(id, ownerId);

      // Delete all variants if exist
      if (mediaItem.variants && mediaItem.variants.length > 0) {
        try {
          await this.variantService.deleteAllVariantsForMedia(id);
        } catch (error) {
          this.logger.error(`Failed to delete variants: ${error.message}`);
          // Continue even if variant deletion fails
        }
      }

      // Delete file from storage
      await this.storageService.delete({
        filename: mediaItem.filename,
        path: mediaItem.path || undefined,
      });

      // Delete from database
      await this.db.client.delete(media).where(eq(media.id, id));
      this.mediaPublishers.publishMediaDeleted(id);

      return { id, success: true };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to delete media ${id}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(`Failed to delete media: ${error.message}`);
    }
  }

  /**
   * Helper method to determine media type from mimetype
   */
  private getMediaTypeFromMimetype(mimetype: string): MediaType {
    if (mimetype.startsWith('image/')) {
      return MediaType.IMAGE;
    } else if (mimetype.startsWith('video/')) {
      return MediaType.VIDEO;
    } else if (mimetype.startsWith('audio/')) {
      return MediaType.AUDIO;
    } else {
      return MediaType.DOCUMENT;
    }
  }
}
