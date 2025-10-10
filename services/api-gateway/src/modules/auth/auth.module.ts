import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ApiClientService } from 'nest-shared/api-clients/api-client.service';

@Module({
  imports: [],
  controllers: [AuthController],
  providers: [AuthService, ApiClientService],
  exports: [AuthService],
})
export class AuthModule {}
