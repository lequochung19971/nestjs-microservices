import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  KeycloakAdminClient,
  UserRepresentation,
} from '@s3pweb/keycloak-admin-client-cjs';
import { BaseClient, Issuer } from 'openid-client';
import { firstValueFrom } from 'rxjs';
import { KeycloakAdminService } from './keycloak-admin.service';
import { KeycloakTokenRequest, KeycloakTokenResponse } from './types/token';
import { KEYCLOAK_CONFIG } from './constants';
import { KeycloakConfig } from './keycloak.config';
@Injectable()
export class KeycloakService {
  private readonly logger = new Logger(KeycloakService.name);
  private _openidClient: BaseClient;
  private issuer: Issuer;
  private readonly _keycloakAdminClient: KeycloakAdminClient;

  constructor(
    private httpService: HttpService,
    @Inject(KEYCLOAK_CONFIG) private keycloakConfig: KeycloakConfig,
    private keycloakAdminService: KeycloakAdminService,
  ) {
    this._keycloakAdminClient = this.keycloakAdminService.adminClient;
  }

  async onModuleInit() {
    try {
      // Create configuration using the new API
      this.issuer = await Issuer.discover(
        `${this.keycloakConfig.baseUrl}/realms/${this.keycloakConfig.realmName}`,
      );

      this._openidClient = new this.issuer.Client({
        client_id: this.keycloakConfig.clientId,
        client_secret: this.keycloakConfig.clientSecret, // Only for confidential clients
        // redirect_uris: [this.configService.get<string>('OIDC_REDIRECT_URI')], // Your backend callback URL
        response_types: ['code'], // For Authorization Code Flow
      });

      this.logger.log('Keycloak OIDC Client initialized.');
    } catch (error) {
      this.logger.error(
        'Failed to discover Keycloak or initialize OIDC client:',
        error,
      );
      throw error;
    }
  }

  get keycloakAdminClient() {
    return this._keycloakAdminClient;
  }

  get openidClient() {
    return this._openidClient;
  }

  async getToken(
    request: KeycloakTokenRequest,
  ): Promise<KeycloakTokenResponse> {
    try {
      const tokenEndpoint = this.issuer.metadata.token_endpoint;
      const response = await firstValueFrom(
        this.httpService.post<KeycloakTokenResponse>(
          tokenEndpoint,
          new URLSearchParams({
            ...request,
          }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        ),
      );

      this.logger.log('Access token obtained successfully');
      return response.data;
    } catch (error) {
      this.logger.error('Failed to obtain access token', error);
      throw error;
    }
  }

  async createUser(userData: {
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    password: string;
    attributes?: Record<string, any>;
  }) {
    try {
      const user = await this.keycloakAdminService.adminClient.users.create({
        username: userData.username,
        email: userData.email,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        enabled: true,
        credentials: [
          {
            type: 'password',
            value: userData.password,
            temporary: false,
          },
        ],
        attributes: userData.attributes || {},
      });

      this.logger.log(`User created successfully: ${userData.username}`);
      return user;
    } catch (error) {
      this.logger.error('Failed to create user', error);
      throw error;
    }
  }

  async findOneUser(
    args: Parameters<
      typeof this.keycloakAdminService.adminClient.users.find
    >[0],
  ) {
    try {
      return this.keycloakAdminService.adminClient.users
        .find(args)
        .then((users) => users[0]);
    } catch (error) {
      this.logger.error('Failed to get user by ID', error);
      throw error;
    }
  }

  async findUsers(
    args: Parameters<
      typeof this.keycloakAdminService.adminClient.users.find
    >[0],
  ) {
    return this.keycloakAdminService.adminClient.users.find(args);
  }

  async updateUser(userId: string, userData: UserRepresentation) {
    try {
      return this.keycloakAdminService.adminClient.users.update(
        {
          id: userId,
          realm: this.keycloakConfig.realmName,
        },
        userData,
      );
    } catch (error) {
      this.logger.error('Failed to update user', error);
      throw error;
    }
  }

  async deleteUser(userId: string) {
    try {
      await this.keycloakAdminService.adminClient.users.del({
        id: userId,
        realm: this.keycloakConfig.realmName,
      });
    } catch (error) {
      this.logger.error('Failed to delete user', error);
      throw error;
    }
  }

  async resetUserPassword(userId: string, newPassword: string) {
    try {
      await this.keycloakAdminService.adminClient.users.resetPassword({
        id: userId,
        realm: this.keycloakConfig.realmName,
        credential: {
          type: 'password',
          value: newPassword,
          temporary: false,
        },
      });
    } catch (error) {
      this.logger.error('Failed to reset user password', error);
      throw error;
    }
  }

  async getUsers(search?: string, first?: number, max?: number) {
    try {
      return this.keycloakAdminService.adminClient.users.find({
        search,
        first,
        max,
      });
    } catch (error) {
      this.logger.error('Failed to get users', error);
      throw error;
    }
  }

  async introspect(token: string) {
    return this._openidClient.introspect(token);
  }
}
