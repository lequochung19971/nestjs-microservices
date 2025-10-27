import { Module } from '@nestjs/common';
import { DrizzleService } from '../../src/db/drizzle.service';
import { StorageModule } from '../storage/storage.module';
import { FolderController } from './folder.controller';
import { FolderService } from './folder.service';
import { MediaPublishers } from './media-publishers';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { TagController } from './tag.controller';
import { TagService } from './tag.service';
import { VariantService } from './variant.service';

@Module({
  imports: [StorageModule],
  controllers: [MediaController, FolderController, TagController],
  providers: [
    MediaService,
    FolderService,
    TagService,
    VariantService,
    DrizzleService,
    MediaPublishers,
  ],
  exports: [MediaService, FolderService, TagService, VariantService],
})
export class MediaModule {}
