import { Module } from '@nestjs/common';
import { JwtAuthModule, KeycloakModule, RolesGuard } from 'nest-shared';
import { AppConfigModule } from './app-config/app-config.module';
import { AppConfigService } from './app-config/app-config.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { AdminModule } from './modules/admin/admin.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  imports: [
    AppConfigModule,
    AuthModule,
    AdminModule,
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
    KeycloakModule.forRootAsync({
      useFactory(appConfigService: AppConfigService) {
        return {
          baseUrl: appConfigService.keycloak.serverUrl,
          clientId: appConfigService.keycloak.clients.admin.clientId,
          clientSecret: appConfigService.keycloak.clients.admin.clientSecret,
          realmName: appConfigService.keycloak.realm,
        };
      },
      inject: [AppConfigService],
      imports: [AppConfigModule],
      global: true,
    }),
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
export class AppModule {}
