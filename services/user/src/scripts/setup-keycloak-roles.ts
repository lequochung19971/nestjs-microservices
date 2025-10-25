import * as dotenv from 'dotenv';
import { KeycloakAdminClient } from '@s3pweb/keycloak-admin-client-cjs';
import * as path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

/**
 * This script sets up the necessary roles in Keycloak for admin dashboard access
 */
async function setupKeycloakRoles() {
  // Create a Keycloak admin client
  const keycloakAdminClient = new KeycloakAdminClient({
    baseUrl: process.env.KEYCLOAK_SERVER_URL,
    realmName: process.env.KEYCLOAK_REALM,
  });

  try {
    // Authenticate
    await keycloakAdminClient.auth({
      grantType: 'client_credentials',
      clientId: process.env.KEYCLOAK_ADMIN_CLIENT_ID,
      clientSecret: process.env.KEYCLOAK_ADMIN_CLIENT_SECRET,
    });

    console.log('Authentication successful');

    // Define roles to be created
    const rolesToCreate = [
      {
        name: 'admin',
        description: 'Administrator with full access to the dashboard',
      },
      {
        name: 'super-admin',
        description: 'Super administrator with system-level privileges',
      },
      {
        name: 'user-manager',
        description: 'Can manage regular users but not admins',
      },
      {
        name: 'content-manager',
        description: 'Can manage content but not users',
      },
      {
        name: 'viewer',
        description: 'Read-only access to the dashboard',
      },
    ];

    // Create each role if it doesn't exist
    for (const roleData of rolesToCreate) {
      try {
        // Check if role already exists
        const existingRole = await keycloakAdminClient.roles.findOneByName({
          name: roleData.name,
          realm: process.env.KEYCLOAK_REALM,
        });

        if (existingRole) {
          console.log(`Role '${roleData.name}' already exists`);
          continue;
        }

        // Create the role
        await keycloakAdminClient.roles.create({
          name: roleData.name,
          description: roleData.description,
          realm: process.env.KEYCLOAK_REALM,
        });

        console.log(`Created role: ${roleData.name}`);
      } catch (error) {
        console.error(`Error creating role '${roleData.name}':`, error.message);
      }
    }

    // Set up role hierarchy (super-admin contains admin)
    try {
      const superAdminRole = await keycloakAdminClient.roles.findOneByName({
        name: 'super-admin',
        realm: process.env.KEYCLOAK_REALM,
      });

      const adminRole = await keycloakAdminClient.roles.findOneByName({
        name: 'admin',
        realm: process.env.KEYCLOAK_REALM,
      });

      if (superAdminRole && adminRole) {
        // Add 'admin' as a composite role to 'super-admin'
        await keycloakAdminClient.roles.createComposite(
          { roleId: superAdminRole.id, realm: process.env.KEYCLOAK_REALM },
          [{ id: adminRole.id, name: adminRole.name }],
        );

        console.log("Added 'admin' as a composite role to 'super-admin'");
      }
    } catch (error) {
      console.error('Error setting up role hierarchy:', error.message);
    }

    // Create an initial super-admin user if specified
    if (process.env.SETUP_INITIAL_ADMIN === 'true') {
      try {
        const initialAdminUsername =
          process.env.INITIAL_ADMIN_USERNAME || 'superadmin';
        const initialAdminPassword =
          process.env.INITIAL_ADMIN_PASSWORD || 'password';
        const initialAdminEmail =
          process.env.INITIAL_ADMIN_EMAIL || 'admin@example.com';

        // Check if user already exists
        const existingUsers = await keycloakAdminClient.users.find({
          username: initialAdminUsername,
          realm: process.env.KEYCLOAK_REALM,
        });

        if (existingUsers.length > 0) {
          console.log(`User '${initialAdminUsername}' already exists`);
        } else {
          // Create the user
          const user = await keycloakAdminClient.users.create({
            username: initialAdminUsername,
            email: initialAdminEmail,
            enabled: true,
            realm: process.env.KEYCLOAK_REALM,
            credentials: [
              {
                type: 'password',
                value: initialAdminPassword,
                temporary: false,
              },
            ],
          });

          console.log(`Created initial admin user: ${initialAdminUsername}`);

          // Assign super-admin role
          const superAdminRole = await keycloakAdminClient.roles.findOneByName({
            name: 'super-admin',
            realm: process.env.KEYCLOAK_REALM,
          });

          if (superAdminRole && user.id) {
            await keycloakAdminClient.users.addRealmRoleMappings({
              id: user.id,
              realm: process.env.KEYCLOAK_REALM,
              roles: [{ id: superAdminRole.id, name: superAdminRole.name }],
            });

            console.log(
              `Assigned 'super-admin' role to user '${initialAdminUsername}'`,
            );
          }
        }
      } catch (error) {
        console.error('Error creating initial admin user:', error.message);
      }
    }

    console.log('Keycloak roles setup completed successfully');
  } catch (error) {
    console.error('Failed to set up Keycloak roles:', error.message);
    process.exit(1);
  }
}

// Run the script
setupKeycloakRoles().catch(console.error);
