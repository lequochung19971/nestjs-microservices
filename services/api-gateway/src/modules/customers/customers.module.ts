import { Module } from '@nestjs/common';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { ApiClientService } from 'nest-shared/api-clients/api-client.service';

@Module({
  imports: [],
  controllers: [CustomersController],
  providers: [CustomersService, ApiClientService],
  exports: [CustomersService],
})
export class CustomersModule {}
