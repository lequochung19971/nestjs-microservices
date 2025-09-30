// export interface KeycloakConfig {
//   realm: string;
//   'auth-server-url': string;
//   'ssl-required': string;
//   resource: string;
//   'public-client': boolean;
//   'confidential-port': number;
//   'verify-token-audience': boolean;
//   'use-resource-role-mappings': boolean;
//   'enable-cors': boolean;
// }

// export const getKeycloakConfig = (
//   configService: ConfigService,
// ): KeycloakConfig => ({
//   realm: configService.get<string>('KEYCLOAK_REALM', 'master'),
//   'auth-server-url': configService.get<string>(
//     'KEYCLOAK_SERVER_URL',
//     'http://localhost:8080',
//   ),
//   'ssl-required': configService.get<string>(
//     'KEYCLOAK_SSL_REQUIRED',
//     'external',
//   ),
//   resource: configService.get<string>('KEYCLOAK_RESOURCE', 'auth-service'),
//   'public-client': configService.get<boolean>('KEYCLOAK_PUBLIC_CLIENT', true),
//   'confidential-port': configService.get<number>(
//     'KEYCLOAK_CONFIDENTIAL_PORT',
//     0,
//   ),
//   'verify-token-audience': configService.get<boolean>(
//     'KEYCLOAK_VERIFY_TOKEN_AUDIENCE',
//     true,
//   ),
//   'use-resource-role-mappings': configService.get<boolean>(
//     'KEYCLOAK_USE_RESOURCE_ROLE_MAPPINGS',
//     true,
//   ),
//   'enable-cors': configService.get<boolean>('KEYCLOAK_ENABLE_CORS', true),
// });

// export const getKeycloakAdminConfig = (
//   configService: ConfigService,
// ): KeycloakConfig => ({
//   baseUrl: configService.get<string>(
//     'KEYCLOAK_SERVER_URL',
//     'http://localhost:8080',
//   ),
//   realmName: configService.get<string>('KEYCLOAK_REALM', 'master'),
//   clientId: configService.get<string>('KEYCLOAK_ADMIN_CLIENT_ID', 'admin-cli'),
//   clientSecret: configService.get<string>('KEYCLOAK_ADMIN_CLIENT_SECRET', ''),
//   username: configService.get<string>('KEYCLOAK_ADMIN_USERNAME', 'admin'),
//   password: configService.get<string>('KEYCLOAK_ADMIN_PASSWORD', 'admin'),
// });

export interface KeycloakConfig {
  baseUrl: string;
  realmName: string;
  clientId: string;
  clientSecret: string;
  username?: string;
  password?: string;
}
