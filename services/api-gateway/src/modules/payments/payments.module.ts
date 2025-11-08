import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { ApiClientService } from 'nest-shared/api-clients/api-client.service';
import { AppConfigModule } from '../../app-config';

@Module({
  imports: [HttpModule, AppConfigModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, ApiClientService],
  exports: [PaymentsService],
})
export class PaymentsModule {}

