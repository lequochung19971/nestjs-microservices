import { Controller, Post, Body } from '@nestjs/common';
import { Public } from '../../decorators/public.decorator';
import {
  LoginDto,
  RegisterDto,
  TokenDto,
  TokenResponse,
  CodeExchangeDto,
  LogoutDto,
} from 'nest-shared/contracts';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    type: TokenResponse,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiConflictResponse({ description: 'User already exists' })
  async register(@Body() userData: RegisterDto): Promise<TokenResponse> {
    return this.authService.register(userData);
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged in',
    type: TokenResponse,
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  async login(@Body() credentials: LoginDto): Promise<TokenResponse> {
    return this.authService.login(credentials);
  }

  @Public()
  @Post('exchange-code')
  @ApiOperation({ summary: 'Exchange authorization code for tokens' })
  @ApiResponse({
    status: 200,
    description: 'Authorization code exchanged successfully',
    type: TokenResponse,
  })
  @ApiUnauthorizedResponse({ description: 'Failed to exchange code' })
  async exchangeCode(
    @Body() codeExchange: CodeExchangeDto,
  ): Promise<TokenResponse> {
    return this.authService.exchangeCode(codeExchange);
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiResponse({
    status: 200,
    description: 'Token successfully refreshed',
    type: TokenResponse,
  })
  @ApiUnauthorizedResponse({ description: 'Invalid or expired refresh token' })
  async refreshToken(@Body() tokenData: TokenDto): Promise<TokenResponse> {
    return this.authService.refreshToken(tokenData);
  }

  @Public()
  @Post('logout')
  @ApiOperation({ summary: 'Logout and invalidate refresh token' })
  @ApiResponse({ status: 200, description: 'Successfully logged out' })
  async logout(@Body() logoutData: LogoutDto): Promise<void> {
    return this.authService.logout(logoutData);
  }

  @Public()
  @Post('introspect')
  @ApiOperation({ summary: 'Introspect token validity' })
  @ApiResponse({ status: 200, description: 'Token introspection result' })
  async introspect(
    @Body() body: { accessToken: string; refreshToken?: string },
  ) {
    return this.authService.introspectToken(
      body.accessToken,
      body.refreshToken,
    );
  }
}
