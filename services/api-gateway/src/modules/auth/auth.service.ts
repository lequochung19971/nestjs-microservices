import { Injectable } from '@nestjs/common';
import {
  LoginDto,
  RegisterDto,
  TokenDto,
  TokenResponse,
  CodeExchangeDto,
  LogoutDto,
} from 'nest-shared/contracts';
import { ApiClientService } from 'nest-shared/api-clients/api-client.service';

/**
 * Service responsible for authentication operations
 * Acts as a proxy to the user service auth endpoints
 */
@Injectable()
export class AuthService {
  constructor(private readonly apiClient: ApiClientService) {}

  /**
   * Register a new user
   */
  async register(userData: RegisterDto): Promise<TokenResponse> {
    return this.apiClient.users
      .POST('/auth/register', {
        body: userData,
      })
      .then((response) => response.data);
  }

  /**
   * Login with username and password
   */
  async login(credentials: LoginDto): Promise<TokenResponse> {
    return this.apiClient.users
      .POST('/auth/login', {
        body: credentials,
      })
      .then((response) => response.data);
  }

  /**
   * Exchange authorization code for tokens (OAuth flow)
   */
  async exchangeCode(codeExchange: CodeExchangeDto): Promise<TokenResponse> {
    return this.apiClient.users
      .POST('/auth/exchange-code', {
        body: codeExchange,
      })
      .then((response) => response.data);
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(tokenData: TokenDto): Promise<TokenResponse> {
    return this.apiClient.users
      .POST('/auth/refresh', {
        body: tokenData,
      })
      .then((response) => response.data);
  }

  /**
   * Logout and invalidate refresh token
   */
  async logout(logoutData: LogoutDto): Promise<void> {
    return this.apiClient.users
      .POST('/auth/logout', {
        body: logoutData,
      })
      .then(() => undefined);
  }

  /**
   * Introspect token to check validity and get token information
   */
  async introspectToken(accessToken: string, refreshToken?: string) {
    return this.apiClient.users
      .POST('/auth/introspect', {
        body: {
          accessToken,
          refreshToken,
        },
      })
      .then((response) => response.data);
  }
}
