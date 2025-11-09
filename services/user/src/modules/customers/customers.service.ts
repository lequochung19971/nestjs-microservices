import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { KeycloakService } from 'nest-shared/keycloak';
import {
  CreateCustomerDto,
  CustomerDto,
  QueryCustomerRequestDto,
  QueryCustomerResponseDto,
} from 'nest-shared/contracts';
import { AppConfigService } from 'src/app-config';

@Injectable()
export class CustomersService {
  private readonly logger = new Logger(CustomersService.name);
  private readonly adminRoles = ['admin', 'super-admin'];
  private readonly customerRoles = ['customer'];

  constructor(
    private readonly keycloakService: KeycloakService,
    private readonly configService: AppConfigService,
  ) {}

  async getAllCustomers(
    query: QueryCustomerRequestDto,
  ): Promise<QueryCustomerResponseDto> {
    try {
      const { limit, page, search } = query;

      // Get users from Keycloak
      const users = await this.keycloakService.findUsers({
        search,
        page,
        limit,
        q: 'userType:customer',
      });

      // Filter out admin users to get only customers
      const customers: CustomerDto[] = users.map((user) => ({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        enabled: user.enabled,
        emailVerified: user.emailVerified,
        createdTimestamp: user.createdTimestamp,
      }));

      // For total count, we need to fetch all and filter
      // In production, you might want to cache this or use a more efficient method
      const total = customers.length;

      return {
        data: customers,
        meta: {
          page,
          limit,
          totalCount: total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this.logger.error(
        `Failed to get customers: ${error.message}`,
        error.stack,
      );
      throw new Error('Failed to get customers');
    }
  }

  async getCustomerById(customerId: string): Promise<CustomerDto> {
    try {
      const user = await this.keycloakService.findOneUser({ id: customerId });

      if (!user) {
        throw new Error('Customer not found');
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
      };
    } catch (error) {
      this.logger.error(
        `Failed to get customer by ID: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async createCustomer(userData: CreateCustomerDto): Promise<CustomerDto> {
    let userId: string;
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
          userType: ['customer'],
        },
      });
      userId = user.id;
      // Update user if enabled or emailVerified are specified
      if (
        userData.enabled !== undefined ||
        userData.emailVerified !== undefined
      ) {
        await this.keycloakService.updateUser(user.id, {
          enabled: userData.enabled ?? true,
          emailVerified: userData.emailVerified ?? false,
        });
      }

      // Assign customer role
      await this.assignCustomerRole(user.id);

      // Get the created user
      return this.getCustomerById(user.id);
    } catch (error) {
      if (userId) {
        await this.keycloakService.deleteUser(userId);
      }
      if (error instanceof ConflictException) {
        throw error;
      }
      this.logger.error(
        `Failed to create customer: ${error.message}`,
        error.stack,
      );
      throw new Error('Failed to create customer');
    }
  }

  private async assignCustomerRole(userId: string): Promise<void> {
    try {
      // Find the customer role
      const client =
        await this.keycloakService.keycloakAdminClient.clients.find({
          clientId: this.configService.keycloak.clients.frontstore.clientId,
          realm: this.configService.keycloak.realm,
        });

      const role =
        await this.keycloakService.keycloakAdminClient.clients.findRole({
          roleName: 'customer',
          id: client[0].id,
        });

      if (!role) {
        this.logger.warn('Customer role not found in Keycloak');
        throw new NotFoundException('Customer role not found');
      }

      // Assign the role to the user
      await this.keycloakService.keycloakAdminClient.users.addClientRoleMappings(
        {
          clientUniqueId: client[0].id,
          id: userId,
          roles: [{ id: role.id, name: role.name }],
        },
      );

      this.logger.log(`Assigned customer role to user ${userId}`);
    } catch (error) {
      this.logger.error(
        `Failed to assign customer role: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
