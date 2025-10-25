import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppConfigModule } from 'src/app-config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    ConfigModule,
    AppConfigModule,
    // KeycloakModule.forRootAsync({
    //   imports: [AppConfigModule],
    //   inject: [AppConfigService],
    //   useFactory: (configService: AppConfigService) => ({
    //     baseUrl: configService.keycloak.serverUrl,
    //     realmName: configService.keycloak.realm,
    //     clientId: configService.keycloak.clients.admin.clientId,
    //     clientSecret: configService.keycloak.clients.admin.clientSecret,
    //   }),
    // }),
    // JwtAuthModule.forRootAsync({
    //   imports: [AppConfigModule],
    //   inject: [AppConfigService],
    //   useFactory: (configService: AppConfigService) => ({
    //     jwksUrl: `${configService.keycloak.serverUrl}/realms/${configService.keycloak.realm}/protocol/openid-connect/certs`,
    //   }),
    // }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
