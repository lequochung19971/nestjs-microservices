import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Request } from 'express';
import { MediaPublishers } from 'modules/media/media-publishers';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly mediaPublishers: MediaPublishers,
  ) {}

  @Get('public')
  getPublic(): string {
    return 'This is a public endpoint.';
  }

  @Get('health')
  health() {
    const response = {
      status: 'ok',
      service: 'media-service',
      timestamp: new Date().toISOString(),
    };
    this.mediaPublishers.publishMediaDeleted('123');
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
