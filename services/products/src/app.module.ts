import { Module } from '@nestjs/common';
import { JwtAuthModule, RabbitMQModule } from 'nest-shared';
import { AppConfigModule } from './app-config/app-config.module';
import { AppConfigService } from './app-config/app-config.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DrizzleModule } from './db/drizzle.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { CategoriesModule } from './modules/categories/categories.module';
import { ProductsModule } from './modules/products/products.module';

@Module({
  imports: [
    AppConfigModule,
    DrizzleModule,
    CategoriesModule,
    ProductsModule,
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
  ],
  controllers: [AppController],
  providers: [AppService, JwtStrategy],
})
export class AppModule {}
