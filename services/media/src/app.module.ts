import { Module } from '@nestjs/common';
import { AppConfigModule } from './app-config/app-config.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DrizzleModule } from './db/drizzle.module';
// import { ServeStaticModule } from '@nestjs/serve-static';
import { JwtAuthModule } from 'nest-shared';
import { StorageModule } from '../modules/storage/storage.module';
import { MediaModule } from '../modules/media/media.module';
import { AppConfigService } from './app-config';
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
    // ServeStaticModule.forRoot({
    //   rootPath: path.join(process.cwd(), 'uploads'),
    //   serveRoot: '/uploads',
    // }),
    StorageModule,
    MediaModule,
  ],
  controllers: [AppController],
  providers: [AppService, JwtStrategy],
})
export class AppModule {}
