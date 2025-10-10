import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { FolderController } from './folder.controller';
import { TagController } from './tag.controller';
import { MediaService } from './media.service';
import { ApiClientService } from 'nest-shared/api-clients/api-client.service';

@Module({
  imports: [],
  controllers: [MediaController, FolderController, TagController],
  providers: [MediaService, ApiClientService],
  exports: [MediaService],
})
export class MediaModule {}
