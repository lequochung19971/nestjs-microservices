import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { KeycloakService } from 'nest-shared';
import { CallbackParamsType, TokenSet } from 'openid-client';
import { AppConfigService } from 'src/app-config';
import {
  CodeExchangeDto,
  LoginDto,
  RegisterDto,
  TokenResponse,
} from 'nest-shared/contracts';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly keycloakService: KeycloakService,
    private readonly configService: AppConfigService,
  ) {}

  async callback(params: CallbackParamsType) {
    const client = this.keycloakService.openidClient;

    const code_verifier = (global as any)._codeVerifier; // Retrieve securely in real app
    const tokenSet: TokenSet = await client.callback(
      this.configService.get<string>('OIDC_REDIRECT_URI'),
      params,
      { code_verifier },
    );

    return {
      accessToken: tokenSet.access_token,
      refreshToken: tokenSet.refresh_token,
      idToken: tokenSet.id_token,
      expiresIn: tokenSet.expires_in,
    };
  }

  // Endpoint for SPAs to directly exchange authorization code received on frontend
  // Frontend would send the 'code' and 'code_verifier' to this endpoint
  async exchangeCode({
    code,
    codeVerifier,
  }: CodeExchangeDto): Promise<TokenResponse> {
    const client = this.keycloakService.openidClient;

    const tokenSet: TokenSet = await client.callback(
      this.configService.get<string>('OIDC_REDIRECT_URI'), // This should match the redirect_uri used by frontend
      { code },
      { code_verifier: codeVerifier },
    );

    return {
      accessToken: tokenSet.access_token,
      refreshToken: tokenSet.refresh_token,
      idToken: tokenSet.id_token,
      expiresIn: tokenSet.expires_in,
    };
  }

  async register(userData: RegisterDto) {
    try {
      // Check if user already exists
      const existingUser = await this.keycloakService.findOneUser({
        username: userData.username,
      });
      if (!!existingUser) {
        throw new ConflictException('User already exists');
      }

      // Create user in Keycloak
      const user = await this.keycloakService.createUser({
        username: userData.username,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        password: userData.password,
      });

      return {
        message: 'User registered successfully',
        userId: user.id,
        // username: user.username,
        // email: user.email,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new Error('Failed to register user');
    }
  }

  async login(loginDto: LoginDto): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    refreshExpiresIn: number;
    idToken: string;
    tokenType: string;
    scope: string;
    sessionState: string;
    notBeforePolicy: number;
  }> {
    const keycloak = this.configService.keycloak;
    try {
      this.logger.debug(`Attempting to login user: ${loginDto.username}`);
      const response = await this.keycloakService.getToken({
        grant_type: 'password',
        username: loginDto.username,
        password: loginDto.password,
        client_id: keycloak.clients.admin.clientId,
        client_secret: keycloak.clients.admin.clientSecret,
      });

      return {
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
        expiresIn: response.expires_in,
        refreshExpiresIn: response.refresh_expires_in,
        idToken: response.id_token,
        tokenType: response.token_type,
        scope: response.scope,
        sessionState: response.session_state,
        notBeforePolicy: response['not-before-policy'],
      };

      // Return tokens and basic user info
    } catch (error) {
      if (error.response && error.response.status === 401) {
        // Keycloak returns 401 for invalid credentials
        this.logger.warn(
          `Failed login attempt for user ${loginDto.username}: Invalid credentials.`,
        );
        throw new UnauthorizedException('Invalid username or password.');
      } else {
        this.logger.error(
          'Error during Keycloak login:',
          error.response?.data || error.message,
        );
        throw new InternalServerErrorException(
          'Failed to login with Keycloak.',
        );
      }
    }
  }

  async logout(refreshToken: string) {
    const client = this.keycloakService.openidClient;
    await client.revoke(refreshToken, 'refresh_token');

    const endSessionUrl = client.endSessionUrl({
      id_token_hint: '',
      post_logout_redirect_uri: this.configService.get<string>(
        'OIDC_POST_LOGOUT_REDIRECT_URI',
      ),
    });
    return endSessionUrl;
  }

  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    const client = this.keycloakService.openidClient;

    const tokenSet: TokenSet = await client.refresh(refreshToken);
    console.log('Tokens refreshed:', tokenSet);

    return {
      accessToken: tokenSet.access_token,
      refreshToken: tokenSet.refresh_token,
      expiresIn: tokenSet.expires_in,
    };
  }

  async resetUserPassword(id: string, newPassword: string) {
    try {
      await this.keycloakService.resetUserPassword(id, newPassword);
      return {
        message: 'Password reset successfully',
        userId: id,
      };
    } catch (error) {
      this.logger.error('Failed to reset password', error);
      throw new Error('Failed to reset password');
    }
  }
}
