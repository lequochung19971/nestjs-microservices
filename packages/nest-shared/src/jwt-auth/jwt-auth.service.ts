// src/auth/jwks.service.ts
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { createRemoteJWKSet, jwtVerify, JWTVerifyResult } from 'jose';
import { URL } from 'node:url';
import { JwksConfig } from './jwks.config';
import { JWKS_CONFIG } from './constants';

@Injectable()
export class JwtAuthService implements OnModuleInit {
  private readonly logger = new Logger(JwtAuthService.name);
  private jwks: ReturnType<typeof createRemoteJWKSet>;
  private _config: JwksConfig;

  constructor(@Inject(JWKS_CONFIG) private injectedConfig?: JwksConfig) {
    this._config = this.injectedConfig;
    this.initializeJwks();
  }

  onModuleInit() {
    this._config = this.injectedConfig;
    this.initializeJwks();
  }

  // private loadJwksConfig(): JwksConfig {
  //   // Start with injected config or defaults
  //   const baseConfig = this.injectedConfig;

  //   if (!baseConfig.jwksUrl) {
  //     throw new Error(
  //       'jwksUrl is required. Set KEYCLOAK_SERVER_URL and KEYCLOAK_REALM.',
  //     );
  //   }

  //   return baseConfig;
  // }

  private initializeJwks(): void {
    try {
      this.logger.log(this._config.jwksUrl);
      const jwksUrl = new URL(this._config.jwksUrl);
      this.jwks = createRemoteJWKSet(jwksUrl, {
        cacheMaxAge: this._config.maxTokenAge,
      });
      this.logger.log(`Initialized JWKS endpoint at ${jwksUrl.href}`);
    } catch (error) {
      this.logger.error('Failed to initialize JWKS:', error.message);
      throw error;
    }
  }

  get config() {
    return this._config;
  }

  public async verifyToken(
    jwt: Parameters<typeof jwtVerify>[0],
    options?: Parameters<typeof jwtVerify>[2],
  ): Promise<JWTVerifyResult> {
    try {
      const result = await jwtVerify(jwt, this.jwks, {
        algorithms: this._config.algorithms,
        audience: this._config.audience,
        issuer: this._config.issuer,
        maxTokenAge: this._config.maxTokenAge,
        currentDate: this._config.currentDate,
        ...options,
      });
      return result;
    } catch (error) {
      this.logger.error('Token verification failed:', error.message);
      throw error; // Re-throw the error for the guard to handle
    }
  }

  public getConfig(): JwksConfig {
    return { ...this._config };
  }

  public updateConfig(newConfig: Partial<JwksConfig>): void {
    this._config = { ...this._config, ...newConfig };
    this.initializeJwks();
  }
}
