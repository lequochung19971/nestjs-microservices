import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface DatabaseConfig {
  url: string;
}

export interface KeycloakConfig {
  serverUrl: string;
  realm: string;
  resource: string;
  sslRequired: string;
  publicClient: boolean;
  confidentialPort: number;
  verifyTokenAudience: boolean;
  useResourceRoleMappings: boolean;
  enableCors: boolean;
  clients: {
    admin: KeycloakClientConfig;
    frontstore: KeycloakClientConfig;
  };
}

export interface KeycloakClientConfig {
  clientId: string;
  clientSecret: string;
}

export interface AppConfig {
  port: number;
  nodeEnv: string;
}

export interface RabbitMQConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  vhost: string;
}

export interface AllConfig {
  database: DatabaseConfig;
  keycloak: KeycloakConfig;
  keycloakClient: KeycloakClientConfig;
  app: AppConfig;
  rabbitmq: RabbitMQConfig;
}

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  get database(): DatabaseConfig {
    return {
      url: this.configService.get<string>('DATABASE_URL'),
    };
  }

  get keycloakAdmin(): KeycloakClientConfig {
    return {
      clientId: this.configService.get<string>('KEYCLOAK_ADMIN_CLIENT_ID'),
      clientSecret: this.configService.get<string>(
        'KEYCLOAK_ADMIN_CLIENT_SECRET',
        '',
      ),
    };
  }

  get keycloakFrontstoreClient(): KeycloakClientConfig {
    return {
      clientId: this.configService.get<string>('KEYCLOAK_FRONTSTORE_CLIENT_ID'),
      clientSecret: this.configService.get<string>(
        'KEYCLOAK_FRONTSTORE_CLIENT_SECRET',
      ),
    };
  }

  get keycloak(): KeycloakConfig {
    return {
      serverUrl: this.configService.get<string>('KEYCLOAK_SERVER_URL'),
      realm: this.configService.get<string>('KEYCLOAK_REALM'),
      resource: this.configService.get<string>('KEYCLOAK_RESOURCE'),
      sslRequired: this.configService.get<string>('KEYCLOAK_SSL_REQUIRED'),
      publicClient: this.configService.get<boolean>('KEYCLOAK_PUBLIC_CLIENT'),
      confidentialPort: this.configService.get<number>(
        'KEYCLOAK_CONFIDENTIAL_PORT',
      ),
      verifyTokenAudience: this.configService.get<boolean>(
        'KEYCLOAK_VERIFY_TOKEN_AUDIENCE',
      ),
      useResourceRoleMappings: this.configService.get<boolean>(
        'KEYCLOAK_USE_RESOURCE_ROLE_MAPPINGS',
      ),
      enableCors: this.configService.get<boolean>('KEYCLOAK_ENABLE_CORS'),
      clients: {
        admin: this.keycloakAdmin,
        frontstore: this.keycloakFrontstoreClient,
      },
    };
  }

  get app(): AppConfig {
    return {
      port: this.configService.get<number>('PORT'),
      nodeEnv: this.configService.get<string>('NODE_ENV'),
    };
  }

  get rabbitmq(): RabbitMQConfig {
    return {
      host: this.configService.get<string>('RABBITMQ_HOST', 'localhost'),
      port: this.configService.get<number>('RABBITMQ_PORT', 5672),
      user: this.configService.get<string>('RABBITMQ_USER', 'rabbitmq_user'),
      password: this.configService.get<string>(
        'RABBITMQ_PASSWORD',
        'rabbitmq_password',
      ),
      vhost: this.configService.get<string>('RABBITMQ_VHOST', '/'),
    };
  }

  get all(): AllConfig {
    return {
      database: this.database,
      keycloak: this.keycloak,
      keycloakClient: this.keycloakAdmin,
      app: this.app,
      rabbitmq: this.rabbitmq,
    };
  }

  /**
   * Get a specific configuration value
   */
  get<T = string>(key: string): T {
    return this.configService.get<T>(key);
  }

  /**
   * Check if the application is in development mode
   */
  isDevelopment(): boolean {
    return this.app.nodeEnv === 'development';
  }

  /**
   * Check if the application is in production mode
   */
  isProduction(): boolean {
    return this.app.nodeEnv === 'production';
  }

  /**
   * Check if the application is in test mode
   */
  isTest(): boolean {
    return this.app.nodeEnv === 'test';
  }

  /**
   * Validate that all required configuration values are present
   */
  validate(): void {
    const requiredConfigs = [
      'DATABASE_URL',
      'KEYCLOAK_SERVER_URL',
      'KEYCLOAK_REALM',
      'KEYCLOAK_RESOURCE',
      'PORT',
      'NODE_ENV',
      'RABBITMQ_HOST',
      'RABBITMQ_PORT',
      'RABBITMQ_USER',
      'RABBITMQ_PASSWORD',
    ];

    const missingConfigs = requiredConfigs.filter(
      (config) => !this.configService.get(config),
    );

    if (missingConfigs.length > 0) {
      throw new Error(
        `Missing required configuration values: ${missingConfigs.join(', ')}`,
      );
    }
  }

  /**
   * Get database connection options for Drizzle
   */
  getDatabaseConfig() {
    return {
      url: this.database.url,
    };
  }

  /**
   * Get Keycloak configuration for authentication
   */
  getKeycloakConfig() {
    return {
      ...this.keycloak,
      admin: this.keycloakAdmin,
    };
  }

  /**
   * Get application server configuration
   */
  getServerConfig() {
    return {
      port: this.app.port,
      nodeEnv: this.app.nodeEnv,
    };
  }

  /**
   * Get RabbitMQ configuration
   */
  getRabbitMQConfig() {
    return this.rabbitmq;
  }
}
