import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import {
  ApiBody,
  ApiExcludeEndpoint,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { KeycloakService } from 'nest-shared';
import { Public } from '../../decorators/public.decorator';
import { AuthService } from './auth.service';
import {
  CodeExchangeDto,
  LoginDto,
  LogoutDto,
  RegisterDto,
  TokenDto,
  TokenResponse,
} from 'nest-shared/contracts';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly keycloakService: KeycloakService,
  ) {}

  @Post('register')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User successfully registered',
    type: TokenResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'User already exists',
  })
  async register(@Body() userData: RegisterDto) {
    return this.authService.register(userData);
  }

  // Endpoint for SPAs to directly exchange authorization code received on frontend
  // Frontend would send the 'code' and 'code_verifier' to this endpoint
  @Post('exchange-code')
  @Public()
  @ApiOperation({ summary: 'Exchange authorization code for tokens' })
  @ApiBody({ type: CodeExchangeDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Authorization code exchanged successfully',
    type: TokenResponse,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Failed to exchange code',
  })
  async exchangeCode(@Body() body: CodeExchangeDto, @Res() res: Response) {
    const token = await this.authService.exchangeCode(body);

    try {
      return res.status(HttpStatus.OK).json(token);
    } catch (error) {
      console.error('Error exchanging code:', error);
      res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: 'Failed to exchange code for tokens.' });
    }
  }

  @Get('callback')
  @Public()
  @ApiExcludeEndpoint() // Excluding from Swagger as it's primarily for OAuth flow
  async callback(@Req() req: Request, @Res() res: Response) {
    const client = this.keycloakService.openidClient;
    const params = client.callbackParams(req);

    try {
      const token = await this.authService.callback(params);

      if (
        req.headers['x-requested-with'] === 'XMLHttpRequest' ||
        req.accepts('application/json')
      ) {
        return res.status(HttpStatus.OK).json(token);
      }

      // Example for server-side redirect (set cookies)
      res.cookie('access_token', token.accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
      });
      res.cookie('refresh_token', token.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
      });
      res.redirect('/profile');
      return res.status(HttpStatus.OK).json({
        accessToken: token.accessToken,
        refreshToken: token.refreshToken,
        idToken: token.idToken,
        expiresIn: token.expiresIn,
      });
    } catch (error) {
      console.error('OIDC Callback Error:', error);
      res.status(HttpStatus.UNAUTHORIZED).send('Authentication failed');
    }
  }

  // @Get('roles')
  // @Roles('admin')
  // async getRoles() {
  //   return this.authService.getRoles();
  // }

  // @Post('users/:id/roles/:roleName')
  // @Roles('admin')
  // async assignRole(
  //   @Param('id') id: string,
  //   @Param('roleName') roleName: string,
  // ) {
  //   return this.authService.assignRoleToUser(id, roleName);
  // }

  @Post('login')
  @Public()
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User successfully logged in',
    type: TokenResponse,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid credentials',
  })
  async login(@Body() credentials: LoginDto) {
    return this.authService.login(credentials);
  }

  @Post('logout')
  @Public()
  @ApiOperation({ summary: 'Logout and invalidate refresh token' })
  @ApiBody({ type: LogoutDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully logged out',
  })
  async logout(
    @Body('refreshToken') refreshToken: string,
    @Res() res: Response,
  ) {
    const endSessionUrl = await this.authService.logout(refreshToken);
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.redirect(endSessionUrl);
    return { message: 'Logged out successfully.' };
  }

  @Post('refresh')
  @Public()
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiBody({ type: TokenDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Token successfully refreshed',
    type: TokenResponse,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or expired refresh token',
  })
  async refresh(@Body() data: TokenDto) {
    return this.authService.refreshToken(data.refreshToken);
  }

  @Post('introspect')
  @Public()
  @ApiOperation({ summary: 'Introspect token validity' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        refreshToken: { type: 'string' },
        accessToken: { type: 'string' },
      },
      required: ['accessToken'],
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Token introspection result',
    schema: {
      type: 'object',
      properties: {
        active: { type: 'boolean' },
        exp: { type: 'number' },
        iat: { type: 'number' },
        jti: { type: 'string' },
        aud: { type: 'string' },
        sub: { type: 'string' },
        typ: { type: 'string' },
      },
    },
  })
  async introspect(
    @Body() data: { refreshToken: string; accessToken: string },
  ) {
    return this.keycloakService.introspect(data.accessToken);
  }
}
