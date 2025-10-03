import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { Headers } from '../../services/proxy.service';
import { UserProfile, UserPreferences } from './users.service';
import { UserProfileDto, UserPreferencesDto } from 'nest-shared/contracts';

@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getUserProfile(@Req() req: Request) {
    try {
      return await this.usersService.getUserProfile(req.headers as Headers);
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Failed to get user profile',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('profile')
  @UseGuards(JwtAuthGuard)
  async createUserProfile(
    @Body() userData: UserProfileDto,
    @Req() req: Request,
  ) {
    try {
      return await this.usersService.createUserProfile(
        userData,
        req.headers as Headers,
      );
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Failed to create user profile',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  async updateUserProfile(
    @Body() userData: UserProfileDto,
    @Req() req: Request,
  ) {
    try {
      return await this.usersService.updateUserProfile(
        userData,
        req.headers as Headers,
      );
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Failed to update user profile',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('profile')
  @UseGuards(JwtAuthGuard)
  async deleteUserProfile(@Req() req: Request) {
    try {
      return await this.usersService.deleteUserProfile(req.headers as Headers);
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Failed to delete user profile',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('preferences')
  @UseGuards(JwtAuthGuard)
  async getUserPreferences(@Req() req: Request) {
    try {
      return await this.usersService.getUserPreferences(req.headers as Headers);
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Failed to get user preferences',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('preferences')
  @UseGuards(JwtAuthGuard)
  async updateUserPreferences(
    @Body() preferenceData: UserPreferencesDto,
    @Req() req: Request,
  ) {
    try {
      return await this.usersService.updateUserPreferences(
        preferenceData,
        req.headers as Headers,
      );
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Failed to update user preferences',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
