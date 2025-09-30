import { Injectable, Logger } from '@nestjs/common';
import {
  ProxyService,
  Headers,
  QueryParams,
} from '../../services/proxy.service';
import { UserProfileDto, UserPreferencesDto } from './dto/user.dto';

export interface UserProfile extends Record<string, unknown> {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
}

export interface UserPreferences extends Record<string, unknown> {
  id: string;
  userId: string;
  darkMode?: boolean;
  language?: string;
}

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private readonly serviceName = 'user';

  constructor(private readonly proxyService: ProxyService) {}

  async getUserProfile(headers: Headers): Promise<UserProfile> {
    return this.proxyService.get<UserProfile>(
      this.serviceName,
      '/users/profile',
      headers,
    );
  }

  async createUserProfile(
    userData: UserProfileDto,
    headers: Headers,
  ): Promise<UserProfile> {
    return this.proxyService.post<UserProfile>(
      this.serviceName,
      '/users/profile',
      userData as Record<string, unknown>,
      headers,
    );
  }

  async updateUserProfile(
    userData: UserProfileDto,
    headers: Headers,
  ): Promise<UserProfile> {
    return this.proxyService.put<UserProfile>(
      this.serviceName,
      '/users/profile',
      userData as Record<string, unknown>,
      headers,
    );
  }

  async deleteUserProfile(
    headers: Headers,
  ): Promise<{ success: boolean; message: string }> {
    return this.proxyService.delete<{ success: boolean; message: string }>(
      this.serviceName,
      '/users/profile',
      headers,
    );
  }

  async getUserPreferences(headers: Headers): Promise<UserPreferences> {
    return this.proxyService.get<UserPreferences>(
      this.serviceName,
      '/users/preferences',
      headers,
    );
  }

  async updateUserPreferences(
    preferenceData: UserPreferencesDto,
    headers: Headers,
  ): Promise<UserPreferences> {
    return this.proxyService.put<UserPreferences>(
      this.serviceName,
      '/users/preferences',
      preferenceData as Record<string, unknown>,
      headers,
    );
  }

  async getAllUsers(
    headers: Headers,
    query: QueryParams,
  ): Promise<UserProfile[]> {
    return this.proxyService.get<UserProfile[]>(
      this.serviceName,
      '/users',
      headers,
      query,
    );
  }

  async getUserById(id: string, headers: Headers): Promise<UserProfile> {
    return this.proxyService.get<UserProfile>(
      this.serviceName,
      `/users/${id}`,
      headers,
    );
  }
}
