import { HttpModule } from '@nestjs/axios';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';

import { JwtAuthModule, RolesGuard } from 'nest-shared';
import { AppConfigModule, AppConfigService } from './app-config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ErrorMiddleware } from './middleware/error.middleware';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthModule } from './modules/auth/auth.module';
import { ProductsModule } from './modules/products';
import { CategoriesModule } from './modules/categories';
import { MediaModule } from './modules/media';
import { AdminModule } from './modules/admin/admin.module';
import { InventoryModule } from './modules/inventory';
import { OrdersModule } from './modules/orders';
import { PaymentsModule } from './modules/payments';

@Module({
  imports: [
    AppConfigModule,
    HttpModule.registerAsync({
      imports: [AppConfigModule],
      useFactory: () => ({
        timeout: 5000,
        maxRedirects: 5,
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRootAsync({
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({
        throttlers: [
          {
            ttl: config.throttle.ttl,
            limit: config.throttle.limit,
          },
        ],
      }),
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
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
    AuthModule, // Import the Auth module
    ProductsModule,
    CategoriesModule,
    MediaModule,
    AdminModule,
    InventoryModule,
    OrdersModule,
    PaymentsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware, ErrorMiddleware).forRoutes('*');
  }
}
