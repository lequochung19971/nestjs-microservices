import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AdminController } from './admin.controller';
import { AuthController } from './auth.controller';
import { ProxyService } from '../../services/proxy.service';
import { AppConfigModule } from '../../app-config';

@Module({
  imports: [HttpModule, AppConfigModule],
  controllers: [UsersController, AdminController, AuthController],
  providers: [UsersService, ProxyService],
  exports: [UsersService],
})
export class UsersModule {}
