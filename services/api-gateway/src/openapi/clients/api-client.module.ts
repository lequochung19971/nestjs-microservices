import { Module } from '@nestjs/common';
import { ApiClientService } from './api-client';
import { AppConfigModule } from 'src/app-config';

/**
 * Module for providing OpenAPI-generated type-safe API clients throughout the application
 */
@Module({
  imports: [AppConfigModule],
  providers: [ApiClientService],
  exports: [ApiClientService],
})
export class ApiClientModule {}
