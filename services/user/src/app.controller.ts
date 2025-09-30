import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AppService } from './app.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Request } from 'express';

@ApiTags('system')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('public')
  @ApiOperation({ summary: 'Public endpoint for testing' })
  @ApiResponse({
    status: 200,
    description: 'Returns a public message',
    schema: {
      type: 'string',
      example: 'This is a public endpoint.',
    },
  })
  getPublic(): string {
    return 'This is a public endpoint.';
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Service health status',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        service: { type: 'string', example: 'user-service' },
        timestamp: { type: 'string', example: '2023-01-01T00:00:00.000Z' },
      },
    },
  })
  health() {
    const response = {
      status: 'ok',
      service: 'user-service',
      timestamp: new Date().toISOString(),
    };
    console.log('HEALTH-CHECK', response);
    return response;
  }

  @Get('protected')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Protected endpoint requiring authentication' })
  @ApiResponse({
    status: 200,
    description: 'Returns confirmation of authentication',
    schema: {
      type: 'string',
      example: 'Authenticated',
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing JWT',
  })
  protected(@Req() req: Request) {
    console.log(req.user);
    return 'Authenticated';
  }
}
