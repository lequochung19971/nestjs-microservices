import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { FolderController } from './folder.controller';
import { TagController } from './tag.controller';
import { MediaService } from './media.service';
import { ApiClientModule } from '../../api-clients/api-client.module';

@Module({
  imports: [ApiClientModule],
  controllers: [MediaController, FolderController, TagController],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}
