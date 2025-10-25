import { Module } from '@nestjs/common';
import { AppConfigModule } from './app-config/app-config.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DrizzleModule } from './db/drizzle.module';
// import { ServeStaticModule } from '@nestjs/serve-static';
import { JwtAuthModule, RabbitMQModule } from 'nest-shared';
import { StorageModule } from '../modules/storage/storage.module';
import { MediaModule } from '../modules/media/media.module';
import { AppConfigService } from './app-config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { MediaPublishers } from 'modules/media/media-publishers';

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
    StorageModule,
    MediaModule,
  ],
  controllers: [AppController],
  providers: [AppService, JwtStrategy, MediaPublishers],
})
export class AppModule {}
