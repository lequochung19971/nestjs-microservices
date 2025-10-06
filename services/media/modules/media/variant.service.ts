import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import sharp from 'sharp';
import { DrizzleService } from '../../src/db/drizzle.service';
import { media, MediaVariant, mediaVariants } from '../../src/db/schema';
import { StorageService } from '../storage/storage.service';
import {
  VariantConfigDto,
  GenerateVariantsOptionsDto,
  FitType,
} from 'nest-shared/contracts';

const DEFAULT_VARIANT_CONFIGS: VariantConfigDto[] = [
  {
    name: 'thumbnail',
    width: 150,
    height: 150,
    fit: FitType.COVER,
    quality: 80,
  },
  { name: 'small', width: 320, quality: 80 },
  { name: 'medium', width: 640, quality: 80 },
  { name: 'large', width: 1024, quality: 85 },
];

@Injectable()
export class VariantService {
  private readonly logger = new Logger(VariantService.name);

  constructor(
    private readonly db: DrizzleService,
    private readonly storageService: StorageService,
  ) {}

  /**
   * Generate variants for a media item
   */
  async generateVariants(
    options: GenerateVariantsOptionsDto,
    tx?: Parameters<Parameters<typeof this.db.client.transaction>[0]>[0],
  ): Promise<MediaVariant[]> {
    const client = tx || this.db.client;
    const {
      mediaId,
      file,
      mimeType,
      path,
      configs = DEFAULT_VARIANT_CONFIGS,
    } = options;

    try {
      // Check if media exists
      const mediaItem = await client.query.media.findFirst({
        where: eq(media.id, mediaId),
      });

      if (!mediaItem) {
        throw new NotFoundException(`Media with ID ${mediaId} not found`);
      }

      // Check if media is an image
      if (!mimeType.startsWith('image/')) {
        throw new BadRequestException(
          'Variants can only be generated for images',
        );
      }

      // Process each variant
      const generatedVariants: MediaVariant[] = [];

      for (const config of configs) {
        try {
          // Generate variant
          const variantBuffer = await this.processImage(file, config);

          // Generate unique filename with variant name
          const filenameParts = mediaItem.filename.split('.');
          const extension = filenameParts.pop();
          const variantFilename = `${filenameParts.join('.')}_${config.name}.${extension}`;

          // Upload variant to storage
          const url = await this.storageService.upload({
            filename: variantFilename,
            buffer: variantBuffer,
            mimetype: mimeType,
            path: path || '',
          });

          // Create variant record
          const [variant] = await client
            .insert(mediaVariants)
            .values({
              mediaId,
              name: config.name,
              path: path || '',
              url,
              width: config.width,
              height: config.height,
              size: variantBuffer.length,
            })
            .returning();

          generatedVariants.push(variant);
        } catch (error) {
          this.logger.error(
            `Failed to generate variant ${config.name} for media ${mediaId}: ${error.message}`,
            error.stack,
          );
          // Continue with next variant even if this one fails
          continue;
        }
      }

      return generatedVariants;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(
        `Failed to generate variants for media ${mediaId}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to generate variants: ${error.message}`,
      );
    }
  }

  /**
   * Get variants for a media item
   */
  async getVariantsForMedia(mediaId: string): Promise<MediaVariant[]> {
    try {
      // Check if media exists
      const mediaItem = await this.db.client.query.media.findFirst({
        where: eq(media.id, mediaId),
      });

      if (!mediaItem) {
        throw new NotFoundException(`Media with ID ${mediaId} not found`);
      }

      // Get variants
      const variants = await this.db.client.query.mediaVariants.findMany({
        where: eq(mediaVariants.mediaId, mediaId),
        orderBy: (mediaVariants, { asc }) => [asc(mediaVariants.name)],
      });

      return variants;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to get variants for media ${mediaId}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(`Failed to get variants: ${error.message}`);
    }
  }

  /**
   * Delete a variant
   */
  async deleteVariant(id: string): Promise<{ id: string; success: boolean }> {
    try {
      // Get variant details
      const variant = await this.db.client.query.mediaVariants.findFirst({
        where: eq(mediaVariants.id, id),
      });

      if (!variant) {
        throw new NotFoundException(`Variant with ID ${id} not found`);
      }

      // Delete from storage
      await this.storageService.delete({
        filename: variant.url.split('/').pop() || '',
        path: variant.path,
      });

      // Delete from database
      await this.db.client
        .delete(mediaVariants)
        .where(eq(mediaVariants.id, id));

      return { id, success: true };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to delete variant ${id}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to delete variant: ${error.message}`,
      );
    }
  }

  /**
   * Delete all variants for a media item
   */
  async deleteAllVariantsForMedia(
    mediaId: string,
  ): Promise<{ count: number; success: boolean }> {
    try {
      // Get all variants
      const variants = await this.db.client.query.mediaVariants.findMany({
        where: eq(mediaVariants.mediaId, mediaId),
      });

      // Delete each variant from storage
      for (const variant of variants) {
        await this.storageService.delete({
          filename: variant.url.split('/').pop() || '',
          path: variant.path,
        });
      }

      // Delete all variants from database
      await this.db.client
        .delete(mediaVariants)
        .where(eq(mediaVariants.mediaId, mediaId));

      return { count: variants.length, success: true };
    } catch (error) {
      this.logger.error(
        `Failed to delete variants for media ${mediaId}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to delete variants: ${error.message}`,
      );
    }
  }

  /**
   * Process image to create a variant using Sharp
   */
  private async processImage(
    buffer: Buffer,
    config: VariantConfigDto,
  ): Promise<Buffer> {
    try {
      let sharpInstance = sharp(buffer);

      // Get image info
      const metadata = await sharpInstance.metadata();

      // Resize based on config
      if (config.width || config.height) {
        sharpInstance = sharpInstance.resize({
          width: config.width,
          height: config.height,
          fit: config.fit || 'cover',
          withoutEnlargement: true,
        });
      }

      // Set quality
      if (
        (config.quality && metadata.format === 'jpeg') ||
        metadata.format === 'jpg'
      ) {
        sharpInstance = sharpInstance.jpeg({ quality: config.quality });
      } else if (config.quality && metadata.format === 'png') {
        sharpInstance = sharpInstance.png({ quality: config.quality });
      } else if (config.quality && metadata.format === 'webp') {
        sharpInstance = sharpInstance.webp({ quality: config.quality });
      }

      // Process image
      return await sharpInstance.toBuffer();
    } catch (error) {
      this.logger.error(
        `Error processing image: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
