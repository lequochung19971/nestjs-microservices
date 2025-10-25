import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RabbitMQService } from './rabbitmq.service';
import {
  RABBITMQ_CONNECTION,
  RABBITMQ_MODULE_OPTIONS,
  RabbitMQModuleOptions,
} from './rabbitmq.constants';
import * as amqp from 'amqplib';

@Global()
@Module({})
export class RabbitMQModule {
  static forRoot(
    options: RabbitMQModuleOptions,
    global?: boolean,
  ): DynamicModule {
    const optionsProvider = {
      provide: RABBITMQ_MODULE_OPTIONS,
      useValue: options,
    };

    const connectionProvider = {
      provide: RABBITMQ_CONNECTION,
      useFactory: async (
        configService: ConfigService,
        options: RabbitMQModuleOptions,
      ) => {
        const uri =
          options?.uri ||
          `amqp://${configService.get<string>('RABBITMQ_USER')}:${configService.get<string>('RABBITMQ_PASSWORD')}@${configService.get<string>('RABBITMQ_HOST')}:${configService.get<string>('RABBITMQ_PORT')}/${encodeURIComponent(configService.get<string>('RABBITMQ_VHOST') || '/')}`;
        const connection = await amqp.connect(
          uri,
          options?.connectionInitOptions || {},
        );
        if (!connection) {
          throw new Error('Failed to connect to RabbitMQ');
        }
        return connection;
      },
      inject: [ConfigService, RABBITMQ_MODULE_OPTIONS],
      global: global ?? false,
    };

    return {
      module: RabbitMQModule,
      imports: [ConfigModule],
      providers: [optionsProvider, connectionProvider, RabbitMQService],
      exports: [RabbitMQService],
    };
  }

  static forRootAsync(options: {
    imports?: any[];
    useFactory: (
      ...args: any[]
    ) => Promise<RabbitMQModuleOptions> | RabbitMQModuleOptions;
    inject?: any[];
    global?: boolean;
  }): DynamicModule {
    const optionsProvider = {
      provide: RABBITMQ_MODULE_OPTIONS,
      useFactory: options.useFactory,
      inject: options.inject || [],
    };

    const connectionProvider = {
      provide: RABBITMQ_CONNECTION,
      useFactory: async (
        configService: ConfigService,
        options: RabbitMQModuleOptions,
      ) => {
        const uri =
          options?.uri ||
          `amqp://${configService.get<string>('RABBITMQ_USER')}:${configService.get<string>('RABBITMQ_PASSWORD')}@${configService.get<string>('RABBITMQ_HOST')}:${configService.get<string>('RABBITMQ_PORT')}/${encodeURIComponent(configService.get<string>('RABBITMQ_VHOST') || '/')}`;
        const connection = await amqp.connect(
          uri,
          options?.connectionInitOptions || {},
        );
        if (!connection) {
          throw new Error('Failed to connect to RabbitMQ');
        }
        return connection;
      },
      inject: [ConfigService, RABBITMQ_MODULE_OPTIONS],
    };

    return {
      module: RabbitMQModule,
      imports: [...(options.imports || []), ConfigModule],
      providers: [optionsProvider, connectionProvider, RabbitMQService],
      exports: [RabbitMQService],
    };
  }
}
