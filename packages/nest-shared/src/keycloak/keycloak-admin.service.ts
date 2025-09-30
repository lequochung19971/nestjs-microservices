import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { KeycloakAdminClient } from '@s3pweb/keycloak-admin-client-cjs';
import { KEYCLOAK_CONFIG } from './constants';
import { KeycloakConfig } from './keycloak.config';

@Injectable()
export class KeycloakAdminService implements OnModuleInit {
  private readonly logger = new Logger(KeycloakAdminService.name);
  private readonly kcAdminClient: KeycloakAdminClient;

  get adminClient() {
    return this.kcAdminClient;
  }

  constructor(@Inject(KEYCLOAK_CONFIG) private keycloakConfig: KeycloakConfig) {
    this.kcAdminClient = new KeycloakAdminClient({
      baseUrl: this.keycloakConfig.baseUrl,
      realmName: this.keycloakConfig.realmName,
    });
  }

  async onModuleInit() {
    try {
      await this.kcAdminClient.auth({
        grantType: 'client_credentials',
        clientId: this.keycloakConfig.clientId,
        clientSecret: this.keycloakConfig.clientSecret,
      });
      this.logger.log('Keycloak Admin Client authenticated successfully');
    } catch (error) {
      this.logger.error('Failed to authenticate Keycloak Admin Client:', error);
      throw error;
    }
  }
}
