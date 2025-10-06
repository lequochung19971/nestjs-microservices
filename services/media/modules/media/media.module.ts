import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { FolderController } from './folder.controller';
import { FolderService } from './folder.service';
import { TagController } from './tag.controller';
import { TagService } from './tag.service';
import { VariantService } from './variant.service';
import { StorageModule } from '../storage/storage.module';
import { DrizzleModule } from '../../src/db/drizzle.module';
import { DrizzleService } from '../../src/db/drizzle.service';

@Module({
  imports: [StorageModule, DrizzleModule],
  controllers: [MediaController, FolderController, TagController],
  providers: [
    MediaService,
    FolderService,
    TagService,
    VariantService,
    DrizzleService,
  ],
  exports: [MediaService, FolderService, TagService, VariantService],
})
export class MediaModule {}
