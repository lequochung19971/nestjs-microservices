import { HttpModule } from '@nestjs/axios';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';

import { JwtAuthModule } from 'nest-shared';
import { AppConfigModule, AppConfigService } from './app-config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { ErrorMiddleware } from './middleware/error.middleware';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { ProxyService } from './services/proxy.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from './modules/users/users.module';
import { ProductsModule } from './modules/products';
import { ApiClientModule } from './openapi/clients/api-client.module';

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
    ApiClientModule,
    UsersModule, // Import the Users module
    ProductsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    ProxyService,
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
