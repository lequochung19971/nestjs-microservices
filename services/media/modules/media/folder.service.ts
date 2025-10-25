import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { and, eq, inArray, isNull, like, sql, SQL } from 'drizzle-orm';
import { DrizzleService } from '../../src/db/drizzle.service';
import {
  media,
  MediaFolder,
  mediaFolders,
  mediaToFolders,
} from '../../src/db/schema';
import {
  CreateFolderDto,
  UpdateFolderDto,
  FolderQueryDto,
  MoveMediaToFolderDto,
  PaginatedFolderResponseDto,
} from 'nest-shared/contracts';

@Injectable()
export class FolderService {
  private readonly logger = new Logger(FolderService.name);

  constructor(private readonly db: DrizzleService) {}

  /**
   * Create a new folder
   */
  async create(createFolderDto: CreateFolderDto): Promise<MediaFolder> {
    const { name, parentId = null, ownerId } = createFolderDto;

    try {
      // Check if folder with same name exists under the same parent
      const existingFolder = await this.db.client.query.mediaFolders.findFirst({
        where: and(
          eq(mediaFolders.name, name),
          parentId
            ? eq(mediaFolders.parentId, parentId)
            : isNull(mediaFolders.parentId),
          eq(mediaFolders.ownerId, ownerId),
        ),
      });

      if (existingFolder) {
        throw new ConflictException(
          `Folder ${name} already exists in this location`,
        );
      }

      // Generate path
      let path = `/${name}`;
      if (parentId) {
        const parent = await this.findOne(parentId, ownerId);
        path = `${parent.path}/${name}`;
      }

      // Create folder
      const [newFolder] = await this.db.client
        .insert(mediaFolders)
        .values({
          name,
          parentId: parentId || null,
          ownerId,
          path,
        })
        .returning();

      return newFolder;
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      this.logger.error(
        `Failed to create folder: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to create folder: ${error.message}`,
      );
    }
  }

  /**
   * Get a single folder by ID
   */
  async findOne(id: string, ownerId?: string): Promise<MediaFolder> {
    try {
      const query = ownerId
        ? and(eq(mediaFolders.id, id), eq(mediaFolders.ownerId, ownerId))
        : eq(mediaFolders.id, id);

      const folder = await this.db.client.query.mediaFolders.findFirst({
        where: query,
      });

      if (!folder) {
        throw new NotFoundException(`Folder with ID ${id} not found`);
      }

      return folder;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to find folder ${id}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(`Failed to get folder: ${error.message}`);
    }
  }

  /**
   * List folders with filtering and pagination
   */
  async findAll(query: FolderQueryDto): Promise<PaginatedFolderResponseDto> {
    const { parentId, search, page = 1, limit = 20, ownerId } = query;

    try {
      const offset = (page - 1) * limit;

      // Build where conditions
      const whereConditions = [];

      if (parentId) {
        whereConditions.push(eq(mediaFolders.parentId, parentId));
      }

      if (search) {
        whereConditions.push(like(mediaFolders.name, `%${search}%`));
      }

      if (ownerId) {
        whereConditions.push(eq(mediaFolders.ownerId, ownerId));
      }

      // Execute query
      const whereClause: SQL | undefined =
        whereConditions.length > 0 ? and(...whereConditions) : undefined;

      const items = await this.db.client.query.mediaFolders.findMany({
        where: whereClause,
        limit: limit,
        offset: offset,
        orderBy: (mediaFolders, { asc }) => [asc(mediaFolders.name)],
        with: {
          // Include parent folder if exists
          parent: true,
        },
      });

      // Get total count for pagination
      const countResult = await this.db.client
        .select({ count: sql`count(*)` })
        .from(mediaFolders)
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
      this.logger.error(
        `Failed to find folders: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(`Failed to list folders: ${error.message}`);
    }
  }

  /**
   * Get media items in a folder
   */
  async getMediaInFolder(folderId: string, ownerId?: string) {
    try {
      // First check if folder exists
      await this.findOne(folderId, ownerId);

      // Get media items in folder
      const mediaItems = await this.db.client.query.mediaToFolders.findMany({
        where: eq(mediaToFolders.folderId, folderId),
        with: {
          media: true,
        },
      });

      return mediaItems.map((item) => ({
        ...item.media,
        metadata: item.media.metadata ? JSON.parse(item.media.metadata) : {},
      }));
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to get media in folder ${folderId}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to get media in folder: ${error.message}`,
      );
    }
  }

  /**
   * Update folder details
   */
  async update(id: string, updateData: UpdateFolderDto, ownerId?: string) {
    try {
      // Check if folder exists and user has access
      const currentFolder = await this.findOne(id, ownerId);

      let path = currentFolder.path;

      // If parent is changed, update path
      if (updateData.parentId !== undefined) {
        if (updateData.parentId === id) {
          throw new BadRequestException('Folder cannot be its own parent');
        }

        // Check for circular reference
        if (updateData.parentId) {
          await this.checkCircularReference(id, updateData.parentId);

          // Update path based on new parent
          const parent = await this.findOne(updateData.parentId, ownerId);
          path = `${parent.path}/${currentFolder.name}`;
        } else {
          // Moving to root
          path = `/${currentFolder.name}`;
        }
      }

      // If name is changed, update path for this folder and all children
      if (updateData.name && updateData.name !== currentFolder.name) {
        const oldNamePattern = new RegExp(`/${currentFolder.name}(/|$)`);
        path = path.replace(oldNamePattern, `/${updateData.name}$1`);

        // Update path for all children recursively
        await this.updateChildrenPaths(id, currentFolder.path, path);
      }

      // Update folder
      const [updatedFolder] = await this.db.client
        .update(mediaFolders)
        .set({
          ...(updateData.name && { name: updateData.name }),
          ...(updateData.parentId !== undefined && {
            parentId: updateData.parentId || null,
          }),
          path,
          updatedAt: new Date(),
        })
        .where(eq(mediaFolders.id, id))
        .returning();

      return updatedFolder;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(
        `Failed to update folder ${id}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to update folder: ${error.message}`,
      );
    }
  }

  /**
   * Delete a folder and optionally its contents
   */
  async delete(id: string, deleteContents: boolean = false, ownerId?: string) {
    try {
      // Check if folder exists and user has access
      const folder = await this.findOne(id, ownerId);

      // Check if folder has children
      const children = await this.db.client.query.mediaFolders.findMany({
        where: eq(mediaFolders.parentId, id),
      });

      if (children.length > 0 && !deleteContents) {
        throw new BadRequestException(
          'Folder is not empty. Set deleteContents to true to delete anyway.',
        );
      }

      // Delete folder contents if requested
      if (deleteContents) {
        // Delete child folders recursively
        for (const child of children) {
          await this.delete(child.id, true, ownerId);
        }

        // Delete media-to-folder relationships
        await this.db.client
          .delete(mediaToFolders)
          .where(eq(mediaToFolders.folderId, id));

        // Note: We don't delete the media items themselves, just the relationship
      }

      // Delete the folder
      await this.db.client.delete(mediaFolders).where(eq(mediaFolders.id, id));

      return { id, success: true };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(
        `Failed to delete folder ${id}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to delete folder: ${error.message}`,
      );
    }
  }

  /**
   * Move media items to a folder
   */
  async moveMediaToFolder(moveDto: MoveMediaToFolderDto, ownerId?: string) {
    const { mediaIds, folderId } = moveDto;

    try {
      // Check if folder exists and user has access
      if (folderId) {
        await this.findOne(folderId, ownerId);
      }

      // Check if all media items exist and user has access
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

      // Remove existing folder relationships for these media items
      await this.db.client
        .delete(mediaToFolders)
        .where(inArray(mediaToFolders.mediaId, mediaIds));

      // If folderId is provided, create new relationships
      if (folderId) {
        // Create new folder relationships
        const relationships = mediaIds.map((mediaId) => ({
          mediaId,
          folderId,
        }));

        await this.db.client.insert(mediaToFolders).values(relationships);
      }

      return { success: true, count: mediaIds.length };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to move media to folder: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(`Failed to move media: ${error.message}`);
    }
  }

  /**
   * Helper method to check for circular references in folder hierarchy
   */
  private async checkCircularReference(folderId: string, parentId: string) {
    if (folderId === parentId) {
      throw new BadRequestException('Folder cannot be its own parent');
    }

    // Check all ancestors of the parent folder
    let currentParentId = parentId;
    const visitedIds = new Set<string>();

    while (currentParentId) {
      if (visitedIds.has(currentParentId)) {
        throw new BadRequestException(
          'Circular reference detected in folder hierarchy',
        );
      }

      visitedIds.add(currentParentId);

      const parent = await this.db.client.query.mediaFolders.findFirst({
        where: eq(mediaFolders.id, currentParentId),
        columns: {
          parentId: true,
        },
      });

      if (!parent || !parent.parentId) {
        break;
      }

      if (parent.parentId === folderId) {
        throw new BadRequestException(
          'Circular reference detected in folder hierarchy',
        );
      }

      currentParentId = parent.parentId;
    }
  }

  /**
   * Helper method to update paths for all children of a folder
   */
  private async updateChildrenPaths(
    folderId: string,
    oldBasePath: string,
    newBasePath: string,
  ) {
    // Get all children
    const children = await this.db.client.query.mediaFolders.findMany({
      where: eq(mediaFolders.parentId, folderId),
    });

    // Update each child's path and then recursively update their children
    for (const child of children) {
      const newPath = child.path.replace(oldBasePath, newBasePath);

      await this.db.client
        .update(mediaFolders)
        .set({ path: newPath })
        .where(eq(mediaFolders.id, child.id));

      // Recursively update children
      await this.updateChildrenPaths(child.id, child.path, newPath);
    }
  }
}
