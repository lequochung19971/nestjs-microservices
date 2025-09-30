# API Gateway Service

The API Gateway serves as a unified entry point for all microservices in our architecture. It handles authentication, request routing, and proxying to the appropriate microservices.

## Features

- **Authentication & Authorization**: JWT authentication with role-based access control
- **Request Routing**: Routes client requests to the appropriate microservices
- **Response Formatting**: Standardizes response formats
- **Error Handling**: Provides consistent error responses across services
- **Rate Limiting**: Protects services from abuse and DOS attacks
- **Logging**: Comprehensive request logging for monitoring and debugging
- **Circuit Breaking**: Gracefully handles service failures

## API Endpoints

### Public Endpoints

No authentication required:

- `GET /health` - Health check endpoint
- `POST /auth/login` - Login with email and password
- `POST /auth/register` - Register a new user
- `POST /auth/refresh-token` - Refresh JWT tokens

### Protected Endpoints

Authentication required:

- `GET /users/profile` - Get current user profile
- `POST /users/profile` - Create user profile
- `PUT /users/profile` - Update user profile
- `DELETE /users/profile` - Delete user profile
- `GET /users/preferences` - Get user preferences
- `PUT /users/preferences` - Update user preferences

### Admin Endpoints

Admin role required:

- `GET /admin/users` - List all users
- `GET /admin/users/:id` - Get a specific user by ID

### Generic Proxy Endpoint

- `ALL /proxy/:service/*` - Direct proxy to a specific microservice

## Environment Configuration

Configuration is done via environment variables:

```
# API Gateway Configuration
PORT=3000

# Microservice URLs
USER_SERVICE_URL=http://user:3001

# JWT Configuration
JWKS_URL=http://auth:3001/.well-known/jwks.json
JWT_ISSUER=http://auth:3001
JWT_AUDIENCE=api-gateway

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080

# Environment
NODE_ENV=development
```

## Architecture

The API Gateway implements:

1. **Authentication Layer**: JWT validation and role-based access
2. **Rate Limiting**: Prevents abuse by limiting requests
3. **Service Discovery**: Routes to the correct microservice
4. **Error Handling**: Standardized error responses
5. **Request Validation**: Input validation with DTO classes
6. **Logging**: Comprehensive request logging

## Development

To run the API Gateway in development mode:

```bash
pnpm dev
```

For production:

```bash
pnpm build
pnpm start:prod
```

## Docker

The API Gateway can be deployed with Docker:

```bash
docker-compose up api-gateway
```
