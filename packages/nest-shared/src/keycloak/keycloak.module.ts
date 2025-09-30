import { HttpModule } from '@nestjs/axios';
import { DynamicModule, Module, Provider } from '@nestjs/common';
import { KEYCLOAK_CONFIG } from './constants';
import { KeycloakAdminService } from './keycloak-admin.service';
import { KeycloakConfig } from './keycloak.config';
import { KeycloakService } from './keycloak.service';

@Module({
  // imports: [AppConfigModule, HttpModule],
  // providers: [
  //   KeycloakService,
  //   KeycloakAdminService,
  //   KeycloakAuthGuard,
  //   KeycloakAuthStrategy,
  // ],
  // exports: [
  //   KeycloakService,
  //   KeycloakAdminService,
  //   KeycloakAuthGuard,
  //   KeycloakAuthStrategy,
  // ],
})
export class KeycloakModule {
  static forRoot(configs: KeycloakConfig): DynamicModule {
    return {
      module: KeycloakModule,
      imports: [HttpModule],
      controllers: [],
      providers: [
        {
          provide: KEYCLOAK_CONFIG,
          useValue: configs,
        },
        KeycloakService,
        KeycloakAdminService,
      ],
      exports: [KeycloakService, KEYCLOAK_CONFIG],
    };
  }

  static forRootAsync(configs: {
    useFactory: (...args: any[]) => Partial<KeycloakConfig>;
    inject: any[];
    imports?: DynamicModule['imports'];
    global?: boolean;
  }): DynamicModule {
    if (typeof configs.useFactory !== 'function')
      throw Error('useFactory must be a function');

    let provider: Provider = {
      provide: KEYCLOAK_CONFIG,
      useFactory: configs.useFactory,
      inject: configs.inject,
    };

    return {
      module: KeycloakModule,
      controllers: [],
      providers: [KeycloakService, KeycloakAdminService, provider],
      exports: [KeycloakService, KEYCLOAK_CONFIG],
      imports: [HttpModule, ...(configs.imports ?? [])],
      global: configs.global ?? false,
    };
  }
}
