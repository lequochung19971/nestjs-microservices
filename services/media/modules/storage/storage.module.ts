import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { AppConfigModule } from 'src/app-config';

@Module({
  imports: [AppConfigModule],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
