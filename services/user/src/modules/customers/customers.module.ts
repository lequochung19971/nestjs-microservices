import { Module } from '@nestjs/common';
import { KeycloakModule } from 'nest-shared/keycloak';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { AppConfigModule, AppConfigService } from 'src/app-config';

@Module({
  imports: [KeycloakModule, AppConfigModule],
  controllers: [CustomersController],
  providers: [CustomersService, AppConfigService],
  exports: [CustomersService],
})
export class CustomersModule {}
