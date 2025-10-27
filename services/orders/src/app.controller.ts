import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Request } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('public')
  getPublic(): string {
    return 'This is a public endpoint.';
  }

  @Get('health')
  health() {
    const response = {
      status: 'ok',
      service: 'orders-service',
      timestamp: new Date().toISOString(),
    };
    console.log('HEALTH-CHECK', response);
    return response;
  }

  @Get('protected')
  @UseGuards(JwtAuthGuard)
  protected(@Req() req: Request) {
    console.log(req.user);
    return 'Authenticated';
  }
}
