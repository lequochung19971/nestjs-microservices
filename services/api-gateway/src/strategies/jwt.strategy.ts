import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { passportJwtSecret } from 'jwks-rsa';
import { JwtAuthService } from 'nest-shared';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AppConfigService } from 'src/app-config';

// Define payload interface to properly type the token data
interface JwtPayload {
  sub: string;
  email?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  realm_access?: {
    roles?: string[];
  };
  [key: string]: unknown;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: AppConfigService,
    private jwtAuthService: JwtAuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        cacheMaxAge: jwtAuthService.config.maxTokenAge,
        jwksUri: jwtAuthService.config.jwksUrl,
      }),
    });
  }

  async validate(payload: JwtPayload) {
    return {
      ...payload,
      // Add custom properties or transform data as needed
      userId: payload.sub,
      roles: payload.realm_access?.roles || [],
    };
  }
}
