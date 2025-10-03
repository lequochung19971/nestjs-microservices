import { Module } from '@nestjs/common';
import { ApiClientModule } from 'src/api-clients/api-client.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [ApiClientModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
