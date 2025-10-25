# Admin Roles Setup Guide

This guide explains how to set up the required roles in Keycloak for the admin dashboard.

## Admin Roles

The system uses the following roles for admin access:

1. **super-admin**: Has complete access to all functions and can manage other admins
2. **admin**: General administrator with access to most dashboard functions
3. **user-manager**: Can manage regular users but not admins
4. **content-manager**: Can manage content (products, categories, etc.) but not users
5. **viewer**: Read-only access to the dashboard

## Setup Options

### Option 1: Using the Setup Script

The easiest way to configure these roles is to use the provided setup script:

```bash
# Navigate to the user service directory
cd services/user

# Install dependencies if needed
pnpm install

# Make sure the .env file is properly configured
# See the Environment Variables section below

# Run the setup script
npx ts-node src/scripts/setup-keycloak-roles.ts
```

### Option 2: Manual Setup via Keycloak Admin Console

You can also set up the roles manually using the Keycloak Admin Console:

1. Login to the Keycloak Admin Console (http://localhost:8080)
2. Select your realm (e.g., "master" or your custom realm)
3. Go to "Roles" in the left menu
4. Click "Add Role" for each of the roles listed above:
   - admin
   - super-admin
   - user-manager
   - content-manager
   - viewer
5. Fill in the name and description for each role
6. To create role hierarchy:
   - Click on the "super-admin" role
   - Go to "Composite Roles" tab
   - Enable "Composite Roles"
   - Select "admin" from the available roles and click "Add"

## Environment Variables

For the script to work correctly, make sure these variables are defined in your `.env` file:

```
# Keycloak Configuration
KEYCLOAK_SERVER_URL=http://localhost:8080
KEYCLOAK_REALM=master
KEYCLOAK_ADMIN_CLIENT_ID=admin-cli
KEYCLOAK_ADMIN_CLIENT_SECRET=your-client-secret

# Optional: Create initial admin user
SETUP_INITIAL_ADMIN=true
INITIAL_ADMIN_USERNAME=superadmin
INITIAL_ADMIN_PASSWORD=your-strong-password
INITIAL_ADMIN_EMAIL=admin@example.com
```

## Assigning Roles to Users

To assign admin roles to users:

1. Through the API: Use the admin endpoints to assign roles to users
2. Through Keycloak Console:
   - Go to Users in Keycloak
   - Find and select the user
   - Go to "Role Mappings" tab
   - Select a role from "Available Roles" and click "Add Selected"

## Role-Based Access Control

The system implements role-based access control using NestJS guards. Endpoints are protected with the `@Roles()` decorator:

```typescript
@Get('admin-dashboard')
@Roles('admin', 'super-admin')
getAdminDashboard() {
  // Only accessible to users with 'admin' or 'super-admin' roles
}
```

## Troubleshooting

If you encounter issues with role assignments:

1. Verify that the roles exist in Keycloak
2. Check that the user has the roles assigned
3. Ensure the JWT token contains the roles in the correct format
4. Check that the user's session is valid and not expired
5. Review server logs for authorization failures
