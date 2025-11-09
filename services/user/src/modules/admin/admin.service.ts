import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { KeycloakService } from 'nest-shared';
import {
  AdminQueryDto,
  AdminUserDto,
  CreateAdminUserDto,
  UpdateAdminUserDto,
} from 'nest-shared/contracts';
import { AppConfigService } from 'src/app-config';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);
  private readonly adminRoles = ['admin', 'super-admin'];

  constructor(
    private readonly keycloakService: KeycloakService,
    private readonly configService: AppConfigService,
  ) {}

  async createAdminUser(userData: CreateAdminUserDto): Promise<AdminUserDto> {
    try {
      // Check if user already exists
      const existingUser = await this.keycloakService.findOneUser({
        username: userData.username,
      });
      if (!!existingUser) {
        throw new ConflictException('User already exists');
      }

      // Create user in Keycloak
      const user = await this.keycloakService.createUser({
        username: userData.username,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        password: userData.password,
        attributes: {
          userType: 'admin',
        },
      });

      // Assign admin role(s)
      if (userData.roles && userData.roles.length > 0) {
        await this.assignRolesToUser(user.id, userData.roles);
      } else {
        // Assign default admin role
        await this.assignRoleToUser(user.id, 'admin');
      }

      // Get the user with roles
      return this.getAdminUserById(user.id);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      this.logger.error(
        `Failed to create admin user: ${error.message}`,
        error.stack,
      );
      throw new Error('Failed to create admin user');
    }
  }

  async getAllAdminUsers(query: AdminQueryDto) {
    try {
      const { limit = 10, page = 1, search } = query;

      // Get users from Keycloak
      const users = await this.keycloakService.findUsers({
        max: limit,
        first: (page - 1) * limit,
        search,
        q: 'userType:admin',
      });

      // Filter users with admin roles
      const adminUsers = [];
      let total = 0;

      for (const user of users) {
        const userRoles = await this.getUserClientRoles(user.id);

        adminUsers.push({
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          enabled: user.enabled,
          emailVerified: user.emailVerified,
          createdTimestamp: user.createdTimestamp,
          roles: userRoles.map((role) => role.name),
        });
      }

      return {
        items: adminUsers,
        total,
        page,
        limit,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get admin users: ${error.message}`,
        error.stack,
      );
      throw new Error('Failed to get admin users');
    }
  }

  async getAdminUserById(userId: string): Promise<AdminUserDto> {
    try {
      // Get user from Keycloak
      const user = await this.keycloakService.findOneUser({ id: userId });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      // Get user roles
      const userRoles = await this.getUserClientRoles(userId);
      const hasAdminRole = userRoles.some((role) =>
        this.adminRoles.includes(role.name),
      );

      if (!hasAdminRole) {
        throw new NotFoundException(
          `User with ID ${userId} is not an admin user`,
        );
      }

      return {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        enabled: user.enabled,
        emailVerified: user.emailVerified,
        createdTimestamp: user.createdTimestamp,
        roles: userRoles.map((role) => role.name),
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to get admin user: ${error.message}`,
        error.stack,
      );
      throw new Error('Failed to get admin user');
    }
  }

  async updateAdminUser(
    userId: string,
    userData: UpdateAdminUserDto,
  ): Promise<AdminUserDto> {
    try {
      // Check if user exists and is an admin
      await this.getAdminUserById(userId);

      // Update user in Keycloak
      await this.keycloakService.updateUser(userId, {
        username: userData.username,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        enabled: userData.enabled,
      });

      // If password is provided, update it
      if (userData.password) {
        await this.keycloakService.resetUserPassword(userId, userData.password);
      }

      // Return the updated user
      return this.getAdminUserById(userId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to update admin user: ${error.message}`,
        error.stack,
      );
      throw new Error('Failed to update admin user');
    }
  }

  async deleteAdminUser(userId: string): Promise<void> {
    try {
      // Check if user exists and is an admin
      await this.getAdminUserById(userId);

      // Delete user from Keycloak
      await this.keycloakService.deleteUser(userId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to delete admin user: ${error.message}`,
        error.stack,
      );
      throw new Error('Failed to delete admin user');
    }
  }

  async assignRolesToUser(userId: string, roles: string[]): Promise<void> {
    try {
      for (const roleName of roles) {
        await this.assignRoleToUser(userId, roleName);
      }
    } catch (error) {
      this.logger.error(
        `Failed to assign roles to user: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async assignRoleToUser(userId: string, roleName: string): Promise<void> {
    try {
      // Check if user exists
      const user = await this.keycloakService.findOneUser({ id: userId });
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      const client =
        await this.keycloakService.keycloakAdminClient.clients.find({
          clientId: this.configService.keycloak.clients.admin.clientId,
          realm: this.configService.keycloak.realm,
        });

      // Find the role
      const role =
        await this.keycloakService.keycloakAdminClient.clients.findRole({
          roleName: roleName,
          id: client[0].id,
        });

      if (!role) {
        throw new NotFoundException(`Role ${roleName} not found`);
      }

      // Assign the role to the user
      await this.keycloakService.keycloakAdminClient.users.addClientRoleMappings(
        {
          clientUniqueId: client[0].id,
          id: userId,
          roles: [{ id: role.id, name: role.name }],
        },
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to assign role to user: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to assign role ${roleName} to user ${userId}`);
    }
  }

  async removeRoleFromUser(userId: string, roleName: string): Promise<void> {
    try {
      // Check if user exists
      const user = await this.keycloakService.findOneUser({ id: userId });
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      // Find the role
      const role =
        await this.keycloakService.keycloakAdminClient.roles.findOneByName({
          name: roleName,
          realm: this.configService.keycloak.realm,
        });

      if (!role) {
        throw new NotFoundException(`Role ${roleName} not found`);
      }

      // Remove the role from the user
      await this.keycloakService.keycloakAdminClient.users.delRealmRoleMappings(
        {
          id: userId,
          realm: this.configService.keycloak.realm,
          roles: [{ id: role.id, name: role.name }],
        },
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to remove role from user: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to remove role ${roleName} from user ${userId}`);
    }
  }

  async getAllRoles() {
    try {
      const roles = await this.keycloakService.keycloakAdminClient.roles.find({
        realm: this.configService.keycloak.realm,
      });

      return {
        roles: roles.map((role) => ({
          id: role.id,
          name: role.name,
          description: role.description,
          composite: role.composite,
        })),
      };
    } catch (error) {
      this.logger.error(`Failed to get roles: ${error.message}`, error.stack);
      throw new Error('Failed to get roles');
    }
  }

  private async getUserClientRoles(userId: string) {
    const client = await this.keycloakService.keycloakAdminClient.clients.find({
      clientId: this.configService.keycloak.clients.admin.clientId,
      realm: this.configService.keycloak.realm,
    });

    if (!client.length) {
      throw new NotFoundException(
        `Client ${this.configService.keycloak.clients.admin.clientId} not found`,
      );
    }

    return this.keycloakService.keycloakAdminClient.users.listClientRoleMappings(
      {
        id: userId,
        clientUniqueId: client[0].id,
        realm: this.configService.keycloak.realm,
      },
    );
  }

  // private async getUserRoles(userId: string) {
  //   return this.keycloakService.keycloakAdminClient.users.listClientRoleMappings(
  //     {
  //       id: userId,
  //       clientUniqueId: this.configService.keycloak.clients.admin.clientId,
  //     },
  //   );
  // }
}
