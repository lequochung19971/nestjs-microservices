import { Module } from '@nestjs/common';
import { JwtAuthModule, RabbitMQModule } from 'nest-shared';
import { AppConfigModule } from './app-config/app-config.module';
import { AppConfigService } from './app-config/app-config.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DrizzleModule } from './db/drizzle.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    AppConfigModule,
    DrizzleModule,
    JwtAuthModule.forRootAsync({
      useFactory: (appConfigService: AppConfigService) => {
        return {
          jwksUrl: `${appConfigService.keycloak.serverUrl}/realms/${appConfigService.keycloak.realm}/protocol/openid-connect/certs`,
        };
      },
      inject: [AppConfigService],
      imports: [AppConfigModule],
      global: true,
    }),
    RabbitMQModule.forRootAsync({
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: (appConfigService: AppConfigService) => {
        return {
          uri: `amqp://${appConfigService.rabbitmq.user}:${appConfigService.rabbitmq.password}@${appConfigService.rabbitmq.host}:${appConfigService.rabbitmq.port}/${encodeURIComponent(appConfigService.rabbitmq.vhost || '/')}`,
        };
      },
      global: true,
    }),
    InventoryModule,
  ],
  controllers: [AppController],
  providers: [AppService, JwtStrategy],
})
export class AppModule {}
