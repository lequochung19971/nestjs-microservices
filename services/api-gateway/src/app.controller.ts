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

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Public()
  @Get('health')
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
  @UseGuards(JwtAuthGuard)
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
