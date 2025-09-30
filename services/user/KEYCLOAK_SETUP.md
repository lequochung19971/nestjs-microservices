# Keycloak Setup Guide

This guide will help you set up Keycloak authentication for the auth service.

## Prerequisites

- Docker and Docker Compose
- Node.js and pnpm
- PostgreSQL (for the auth service database)

## Quick Start

### 1. Start Keycloak

```bash
# Start Keycloak with PostgreSQL
docker-compose -f docker-compose.keycloak.yml up -d

# Wait for Keycloak to be ready (check http://localhost:8080)
```

### 2. Configure Environment Variables

Copy the environment template and configure your settings:

```bash
cp env.example .env
```

Edit `.env` with your configuration:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/auth_db

# Keycloak Configuration
KEYCLOAK_SERVER_URL=http://localhost:8080
KEYCLOAK_REALM=master
KEYCLOAK_RESOURCE=user-service
KEYCLOAK_SSL_REQUIRED=external
KEYCLOAK_PUBLIC_CLIENT=true
KEYCLOAK_CONFIDENTIAL_PORT=0
KEYCLOAK_VERIFY_TOKEN_AUDIENCE=true
KEYCLOAK_USE_RESOURCE_ROLE_MAPPINGS=true
KEYCLOAK_ENABLE_CORS=true

# Keycloak Admin Configuration
KEYCLOAK_ADMIN_CLIENT_ID=admin-cli
KEYCLOAK_ADMIN_CLIENT_SECRET=
KEYCLOAK_ADMIN_USERNAME=admin
KEYCLOAK_ADMIN_PASSWORD=admin

# Application Configuration
PORT=3001
NODE_ENV=development
```

### 3. Install Dependencies

```bash
pnpm install
```

### 4. Setup Keycloak Realm and Client

1. Access Keycloak Admin Console: http://localhost:8080
2. Login with admin/admin
3. Create a new realm (optional, you can use the master realm)
4. Create a new client:
   - Client ID: `auth-service`
   - Client Protocol: `openid-connect`
   - Access Type: `public` or `confidential`
   - Valid Redirect URIs: `http://localhost:3001/*`
   - Web Origins: `http://localhost:3001`

### 5. Create Roles (Optional)

1. Go to Roles in your realm
2. Create roles like: `admin`, `user`, `moderator`

### 6. Start the Auth Service

```bash
# Development mode
pnpm dev

# Or build and start
pnpm build
pnpm start:prod
```

## API Endpoints

### Public Endpoints

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh access token

### Protected Endpoints

- `GET /auth/profile` - Get user profile
- `POST /auth/logout` - Logout user
- `GET /auth/users` - Get all users (admin only)
- `GET /auth/users/:id` - Get user by ID (admin only)
- `PUT /auth/users/:id` - Update user (admin only)
- `DELETE /auth/users/:id` - Delete user (admin only)
- `POST /auth/users/:id/reset-password` - Reset user password (admin only)
- `GET /auth/roles` - Get all roles (admin only)
- `POST /auth/users/:id/roles/:roleName` - Assign role to user (admin only)

## Authentication Flow

1. **Registration**: User registers via `/auth/register`
2. **Login**: User logs in via `/auth/login` (returns JWT tokens)
3. **API Access**: Include `Authorization: Bearer <token>` header
4. **Token Refresh**: Use refresh token via `/auth/refresh`

## Role-Based Access Control

Use the `@Roles()` decorator to protect endpoints:

```typescript
@Get('admin-only')
@Roles('admin')
async adminOnlyEndpoint() {
  return 'Admin only content';
}
```

## Environment Variables

| Variable                  | Description         | Default                 |
| ------------------------- | ------------------- | ----------------------- |
| `KEYCLOAK_SERVER_URL`     | Keycloak server URL | `http://localhost:8080` |
| `KEYCLOAK_REALM`          | Keycloak realm name | `master`                |
| `KEYCLOAK_RESOURCE`       | Client ID           | `user-service`          |
| `KEYCLOAK_ADMIN_USERNAME` | Admin username      | `admin`                 |
| `KEYCLOAK_ADMIN_PASSWORD` | Admin password      | `admin`                 |

## Troubleshooting

### Keycloak Connection Issues

1. Ensure Keycloak is running: `docker ps`
2. Check Keycloak logs: `docker logs keycloak`
3. Verify admin credentials in `.env`

### Authentication Issues

1. Check JWT token format
2. Verify client configuration in Keycloak
3. Ensure roles are properly assigned

### Development Tips

1. Use Keycloak's built-in user management for testing
2. Enable CORS in Keycloak for frontend development
3. Use Keycloak's token introspection for debugging

## Security Considerations

1. Use HTTPS in production
2. Configure proper CORS settings
3. Set up proper role-based access control
4. Regularly rotate admin credentials
5. Monitor authentication logs

## Next Steps

1. Implement proper JWT token validation
2. Add rate limiting
3. Set up monitoring and logging
4. Configure production Keycloak instance
5. Add multi-factor authentication support 