import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { Roles } from '../../decorators/roles.decorator';
import { UsersService } from './users.service';
import { QueryParams, Headers } from '../../services/proxy.service';

@Controller('admin')
@Roles('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  private readonly logger = new Logger(AdminController.name);

  constructor(private readonly usersService: UsersService) {}

  @Get('users')
  async getAllUsers(@Req() req: Request, @Query() query: QueryParams) {
    try {
      return await this.usersService.getAllUsers(req.headers as Headers, query);
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Failed to fetch users',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('users/:id')
  async getUserById(@Param('id') id: string, @Req() req: Request) {
    try {
      return await this.usersService.getUserById(id, req.headers as Headers);
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Failed to fetch user',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
