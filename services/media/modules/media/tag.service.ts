import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { DrizzleService } from '../../src/db/drizzle.service';
import { eq, and, like, sql, inArray, SQL } from 'drizzle-orm';
import { mediaTags, mediaToTags, media, MediaTag } from '../../src/db/schema';
import {
  CreateTagDto,
  UpdateTagDto,
  TagQueryDto,
  AddTagsToMediaDto,
  RemoveTagsFromMediaDto,
} from 'nest-shared/contracts';

@Injectable()
export class TagService {
  private readonly logger = new Logger(TagService.name);

  constructor(private readonly db: DrizzleService) {}

  /**
   * Create a new tag
   */
  async create(createTagDto: CreateTagDto): Promise<MediaTag> {
    const { name, description } = createTagDto;

    try {
      // Check if tag with same name exists
      const existingTag = await this.db.client.query.mediaTags.findFirst({
        where: eq(mediaTags.name, name),
      });

      if (existingTag) {
        throw new ConflictException(`Tag with name ${name} already exists`);
      }

      // Create tag
      const [newTag] = await this.db.client
        .insert(mediaTags)
        .values({
          name,
          description: description || null,
        })
        .returning();

      return newTag;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      this.logger.error(`Failed to create tag: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to create tag: ${error.message}`);
    }
  }

  /**
   * Get a single tag by ID
   */
  async findOne(id: string): Promise<MediaTag> {
    try {
      const tag = await this.db.client.query.mediaTags.findFirst({
        where: eq(mediaTags.id, id),
      });

      if (!tag) {
        throw new NotFoundException(`Tag with ID ${id} not found`);
      }

      return tag;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to find tag ${id}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(`Failed to get tag: ${error.message}`);
    }
  }

  /**
   * List tags with filtering and pagination
   */
  async findAll(query: TagQueryDto) {
    const { search, page = 1, limit = 50 } = query;

    try {
      const offset = (page - 1) * limit;

      // Build where conditions
      const whereConditions: SQL[] = [];

      if (search) {
        whereConditions.push(like(mediaTags.name, `%${search}%`));
      }

      // Execute query
      const whereClause: SQL | undefined =
        whereConditions.length > 0 ? and(...whereConditions) : undefined;

      const items = await this.db.client.query.mediaTags.findMany({
        where: whereClause,
        limit: limit,
        offset: offset,
        orderBy: (mediaTags, { asc }) => [asc(mediaTags.name)],
      });

      // Get total count for pagination
      const countResult = await this.db.client
        .select({ count: sql`count(*)` })
        .from(mediaTags)
        .where(whereClause);

      const total = Number(countResult[0].count) || 0;

      return {
        items,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this.logger.error(`Failed to find tags: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to list tags: ${error.message}`);
    }
  }

  /**
   * Get media items with a specific tag
   */
  async getMediaWithTag(tagId: string, ownerId?: string) {
    try {
      // First check if tag exists
      await this.findOne(tagId);

      // Get media items with this tag
      const mediaItems = await this.db.client.query.mediaToTags.findMany({
        where: eq(mediaToTags.tagId, tagId),
        with: {
          media: true,
        },
      });

      // Filter by owner if provided
      const filteredItems = ownerId
        ? mediaItems.filter((item) => item.media.ownerId === ownerId)
        : mediaItems;

      return filteredItems.map((item) => ({
        ...item.media,
        metadata: item.media.metadata ? JSON.parse(item.media.metadata) : {},
      }));
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to get media with tag ${tagId}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to get media with tag: ${error.message}`,
      );
    }
  }

  /**
   * Update tag details
   */
  async update(id: string, updateData: UpdateTagDto) {
    try {
      // Check if tag exists
      await this.findOne(id);

      // If updating name, check if name is unique
      if (updateData.name) {
        const existingTag = await this.db.client.query.mediaTags.findFirst({
          where: and(
            eq(mediaTags.name, updateData.name),
            sql`${mediaTags.id} != ${id}`,
          ),
        });

        if (existingTag) {
          throw new ConflictException(
            `Tag with name ${updateData.name} already exists`,
          );
        }
      }

      // Update tag
      const [updatedTag] = await this.db.client
        .update(mediaTags)
        .set({
          ...(updateData.name && { name: updateData.name }),
          ...(updateData.description !== undefined && {
            description: updateData.description || null,
          }),
        })
        .where(eq(mediaTags.id, id))
        .returning();

      return updatedTag;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      this.logger.error(
        `Failed to update tag ${id}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(`Failed to update tag: ${error.message}`);
    }
  }

  /**
   * Delete a tag
   */
  async delete(id: string) {
    try {
      // Check if tag exists
      await this.findOne(id);

      // Delete the tag (relationships will cascade due to foreign key constraint)
      await this.db.client.delete(mediaTags).where(eq(mediaTags.id, id));

      return { id, success: true };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to delete tag ${id}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(`Failed to delete tag: ${error.message}`);
    }
  }

  /**
   * Get tags for a specific media item
   */
  async getTagsForMedia(mediaId: string) {
    try {
      // Check if media exists
      const mediaItem = await this.db.client.query.media.findFirst({
        where: eq(media.id, mediaId),
      });

      if (!mediaItem) {
        throw new NotFoundException(`Media with ID ${mediaId} not found`);
      }

      // Get tags for this media
      const tagRelations = await this.db.client.query.mediaToTags.findMany({
        where: eq(mediaToTags.mediaId, mediaId),
        with: {
          tag: true,
        },
      });

      return tagRelations.map((relation) => relation.tag);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to get tags for media ${mediaId}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to get tags for media: ${error.message}`,
      );
    }
  }

  /**
   * Add tags to media items
   */
  async addTagsToMedia(addTagsDto: AddTagsToMediaDto, ownerId?: string) {
    const { mediaIds, tagIds } = addTagsDto;

    try {
      // Verify all media items exist and user has access
      for (const mediaId of mediaIds) {
        const mediaItem = await this.db.client.query.media.findFirst({
          where: and(
            eq(media.id, mediaId),
            ownerId ? eq(media.ownerId, ownerId) : undefined,
          ),
        });

        if (!mediaItem) {
          throw new NotFoundException(
            `Media with ID ${mediaId} not found or access denied`,
          );
        }
      }

      // Verify all tags exist
      for (const tagId of tagIds) {
        await this.findOne(tagId);
      }

      // Create relationships in batches to avoid too many queries
      const relationships = [];
      for (const mediaId of mediaIds) {
        for (const tagId of tagIds) {
          // Check if relationship already exists
          const existingRelation =
            await this.db.client.query.mediaToTags.findFirst({
              where: and(
                eq(mediaToTags.mediaId, mediaId),
                eq(mediaToTags.tagId, tagId),
              ),
            });

          if (!existingRelation) {
            relationships.push({
              mediaId,
              tagId,
            });
          }
        }
      }

      // Insert new relationships if any
      if (relationships.length > 0) {
        await this.db.client.insert(mediaToTags).values(relationships);
      }

      return {
        success: true,
        count: relationships.length,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to add tags to media: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(`Failed to add tags: ${error.message}`);
    }
  }

  /**
   * Remove tags from media items
   */
  async removeTagsFromMedia(
    removeTagsDto: RemoveTagsFromMediaDto,
    ownerId?: string,
  ) {
    const { mediaIds, tagIds } = removeTagsDto;

    try {
      // Verify all media items exist and user has access
      for (const mediaId of mediaIds) {
        const mediaItem = await this.db.client.query.media.findFirst({
          where: and(
            eq(media.id, mediaId),
            ownerId ? eq(media.ownerId, ownerId) : undefined,
          ),
        });

        if (!mediaItem) {
          throw new NotFoundException(
            `Media with ID ${mediaId} not found or access denied`,
          );
        }
      }

      // Delete relationships
      await this.db.client
        .delete(mediaToTags)
        .where(
          and(
            inArray(mediaToTags.mediaId, mediaIds),
            inArray(mediaToTags.tagId, tagIds),
          ),
        );

      return { success: true };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to remove tags from media: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(`Failed to remove tags: ${error.message}`);
    }
  }
}
