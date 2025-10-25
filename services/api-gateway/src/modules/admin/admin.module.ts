import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AppConfigModule } from 'src/app-config/app-config.module';
import { ApiClientService } from 'nest-shared/api-clients/api-client.service';

@Module({
  imports: [AppConfigModule],
  controllers: [AdminController],
  providers: [AdminService, ApiClientService],
  exports: [AdminService],
})
export class AdminModule {}
