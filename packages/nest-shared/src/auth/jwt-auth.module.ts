import { DynamicModule, Module, Provider } from '@nestjs/common';
import { JwtAuthService } from './jwt-auth.service';
import { JwksConfig } from './jwks.config';
import { JWKS_CONFIG } from './constants';

const DEFAULT_JWKS_CONFIG: JwksConfig = {
  jwksUrl: '',
  issuer: undefined,
  audience: undefined,
  algorithms: ['RS256'],
};

@Module({})
export class JwtAuthModule {
  static forRoot(configs: Partial<JwksConfig>): DynamicModule {
    return {
      module: JwtAuthModule,
      controllers: [],
      providers: [
        {
          provide: JWKS_CONFIG,
          useValue: { ...DEFAULT_JWKS_CONFIG, ...configs },
        },
        JwtAuthService,
      ],
      exports: [JwtAuthService, JWKS_CONFIG],
    };
  }

  static forRootAsync(configs: {
    useFactory: (...args: any[]) => Partial<JwksConfig>;
    inject: any[];
    imports?: DynamicModule['imports'];
    global?: boolean;
  }): DynamicModule {
    let provider: Provider;
    if (typeof configs.useFactory === 'function') {
      provider = {
        provide: JWKS_CONFIG,
        useFactory: configs.useFactory,
        inject: configs.inject,
      };
    } else {
      provider = {
        provide: JWKS_CONFIG,
        useValue: DEFAULT_JWKS_CONFIG,
      };
    }
    return {
      module: JwtAuthModule,
      controllers: [],
      providers: [provider, JwtAuthService],
      exports: [JwtAuthService, JWKS_CONFIG],
      imports: configs.imports || [],
      global: configs.global ?? false,
    };
  }
}
