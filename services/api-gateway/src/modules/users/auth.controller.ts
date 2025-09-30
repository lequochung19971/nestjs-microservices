import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpException,
  Logger,
  UseGuards,
} from '@nestjs/common';
import { ProxyService } from '../../services/proxy.service';
import { Public } from '../../decorators/public.decorator';
import { LoginDto, RegisterDto, TokenDto } from './dto/auth.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { ApiClientService } from 'src/openapi/clients/api-client';

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: Record<string, unknown>;
}

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly proxyService: ProxyService,
    private readonly apiClient: ApiClientService,
  ) {}

  @Public()
  @Post('login')
  async login(@Body() credentials: LoginDto): Promise<AuthResponse> {
    try {
      return await this.proxyService.post<AuthResponse>(
        'user',
        '/auth/login',
        credentials as unknown as Record<string, unknown>,
      );
    } catch (error) {
      this.logger.error(
        `Login error: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new HttpException('Authentication failed', HttpStatus.UNAUTHORIZED);
    }
  }

  @Public()
  @Post('register')
  async register(@Body() userData: RegisterDto): Promise<AuthResponse> {
    try {
      return await this.proxyService.post<AuthResponse>(
        'user',
        '/auth/register',
        userData as unknown as Record<string, unknown>,
      );
    } catch (error) {
      this.logger.error(
        `Registration error: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new HttpException(
        error.response?.data || 'Registration failed',
        error.response?.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Public()
  @UseGuards(JwtAuthGuard)
  @Post('refresh-token')
  async refreshToken(@Body() tokenData: TokenDto): Promise<AuthResponse> {
    try {
      return await this.proxyService.post<AuthResponse>(
        'user',
        '/auth/refresh-token',
        tokenData as unknown as Record<string, unknown>,
      );
    } catch (error) {
      throw new HttpException('Token refresh failed', HttpStatus.UNAUTHORIZED);
    }
  }
}
