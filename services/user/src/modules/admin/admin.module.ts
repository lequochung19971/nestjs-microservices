import { Module } from '@nestjs/common';
import { KeycloakModule } from 'nest-shared';
import { AppConfigModule } from 'src/app-config';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [KeycloakModule, AppConfigModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
