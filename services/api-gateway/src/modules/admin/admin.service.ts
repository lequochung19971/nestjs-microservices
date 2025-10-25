import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import {
  AdminQueryDto,
  AdminUserDto,
  AdminUserPaginatedResponse,
  CreateAdminUserDto,
  RoleDto,
  RolesListResponse,
  UpdateAdminUserDto,
} from 'nest-shared/contracts';
import { ApiClientService } from 'nest-shared/api-clients/api-client.service';
import { AppConfigService } from 'src/app-config';
import { Request } from 'express';
import { headersForwarding } from 'nest-shared/utils';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly apiClientService: ApiClientService,
    private readonly configService: AppConfigService,
  ) {}

  async createAdmin(
    createAdminDto: CreateAdminUserDto,
    headers?: Request['headers'],
  ): Promise<AdminUserDto> {
    try {
      const response = await this.apiClientService.users.POST('/admin/users', {
        body: createAdminDto,
        headers: headersForwarding.extractForwardingHeaders(headers),
      });

      if (!response.data) {
        throw new Error('Failed to create admin user');
      }

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to create admin user: ${error.message}`);
      throw error;
    }
  }

  async getAllAdmins(
    query: AdminQueryDto,
    headers?: Request['headers'],
  ): Promise<AdminUserPaginatedResponse> {
    try {
      const response = await this.apiClientService.users.GET('/admin/users', {
        params: {
          query,
        },
        headers: headersForwarding.extractForwardingHeaders(headers),
      });

      if (!response.data) {
        throw new Error('Failed to get admin users');
      }

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get admin users: ${error.message}`);
      throw error;
    }
  }

  async getAdminById(
    id: string,
    headers?: Request['headers'],
  ): Promise<AdminUserDto> {
    try {
      const response = await this.apiClientService.users.GET(
        '/admin/users/{id}',
        {
          params: {
            path: {
              id,
            },
          },
          headers: headersForwarding.extractForwardingHeaders(headers),
        },
      );

      if (!response.data) {
        throw new Error('Failed to get admin user');
      }

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get admin user: ${error.message}`);
      throw error;
    }
  }

  async updateAdmin(
    id: string,
    updateAdminDto: UpdateAdminUserDto,
    headers?: Request['headers'],
  ): Promise<AdminUserDto> {
    try {
      const response = await this.apiClientService.users.PUT(
        '/admin/users/{id}',
        {
          params: {
            path: {
              id,
            },
          },
          body: updateAdminDto,
          headers: headersForwarding.extractForwardingHeaders(headers),
        },
      );

      if (!response.data) {
        throw new Error('Failed to update admin user');
      }

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to update admin user: ${error.message}`);
      throw error;
    }
  }

  async deleteAdmin(id: string, headers?: Request['headers']): Promise<void> {
    try {
      await this.apiClientService.users.DELETE('/admin/users/{id}', {
        params: {
          path: {
            id,
          },
        },
        headers: headersForwarding.extractForwardingHeaders(headers),
      });
    } catch (error) {
      this.logger.error(`Failed to delete admin user: ${error.message}`);
      throw error;
    }
  }

  async assignRoles(
    id: string,
    roles: string[],
    headers?: Request['headers'],
  ): Promise<void> {
    try {
      await this.apiClientService.users.POST('/admin/users/{id}/roles', {
        params: {
          path: {
            id,
          },
        },
        body: { roles },
        headers: headersForwarding.extractForwardingHeaders(headers),
      });
    } catch (error) {
      this.logger.error(`Failed to assign roles: ${error.message}`);
      throw error;
    }
  }

  async removeRole(
    id: string,
    roleName: string,
    headers?: Request['headers'],
  ): Promise<void> {
    try {
      await this.apiClientService.users.DELETE(
        '/admin/users/{id}/roles/{roleName}',
        {
          params: {
            path: {
              id,
              roleName,
            },
          },
          headers: headersForwarding.extractForwardingHeaders(headers),
        },
      );
    } catch (error) {
      this.logger.error(`Failed to remove role: ${error.message}`);
      throw error;
    }
  }

  async getAllRoles(headers?: Request['headers']): Promise<RolesListResponse> {
    try {
      const response = await this.apiClientService.users.GET(
        '/admin/users/roles',
        {
          headers: headersForwarding.extractForwardingHeaders(headers),
        },
      );

      if (!response.data) {
        throw new Error('Failed to get roles');
      }

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get roles: ${error.message}`);
      throw error;
    }
  }
}
