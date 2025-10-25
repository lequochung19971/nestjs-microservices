import {
  Controller,
  Get,
  Param,
  Req,
  Res,
  HttpStatus,
  HttpException,
  Logger,
  All,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AppService } from './app.service';
import { Public } from './decorators/public.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiSecurity,
} from '@nestjs/swagger';

@ApiTags('system')
@Controller()
@UseGuards(JwtAuthGuard) // Apply JWT guard to all routes by default
@ApiBearerAuth('access-token') // Apply bearer auth to all routes by default
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) {}

  @Public() // This decorator bypasses the JWT guard
  @Get()
  @ApiOperation({ summary: 'Get welcome message' })
  @ApiSecurity({}) // Override the default bearer auth for this endpoint
  getHello(): string {
    return this.appService.getHello();
  }

  @Public() // This decorator bypasses the JWT guard
  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiSecurity({}) // Override the default bearer auth for this endpoint
  health() {
    const response = {
      status: 'ok',
      service: 'api-gateway',
      timestamp: new Date().toISOString(),
    };
    this.logger.log('Health check requested');
    return response;
  }

  @Get('protected')
  @ApiOperation({ summary: 'Protected endpoint example' })
  protected() {
    const response = {
      status: 'ok',
      service: 'api-gateway',
      timestamp: new Date().toISOString(),
    };
    this.logger.log('Protected endpoint requested');
    return response;
  }
}
