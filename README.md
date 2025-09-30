# Microservices Architecture

A microservices-based application with API Gateway, User Service, and Keycloak for authentication.

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   API Gateway   │    │     Keycloak    │    │  User Service   │
│   (Port 3000)   │◄──►│   (Port 8080)   │◄──►│  (Port 3002)   │
│                 │    │                 │    │                 │
│ • Route Proxy   │    │ • Authentication│    │ • User Profiles │
│ • Token Valid   │    │ • Authorization │    │ • Preferences   │
│ • Rate Limiting │    │ • Identity Mgmt │    │ • Business Logic│
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   PostgreSQL    │
                    │   (Port 5432)   │
                    │                 │
                    │ • User Data     │
                    │ • Keycloak Data │
                    └─────────────────┘
```

## Services

### API Gateway (`services/api-gateway`)
- **Port**: 3000
- **Purpose**: Route requests, handle authentication, rate limiting
- **Features**: Proxy to user service, health checks

### User Service (`services/user`)
- **Port**: 3002
- **Purpose**: Manage user profiles and preferences
- **Features**: User profile CRUD, preferences management, Keycloak integration

### Keycloak (`keycloak`)
- **Port**: 8080
- **Purpose**: Authentication and authorization
- **Features**: OAuth2/OIDC, user management, role-based access

### PostgreSQL (`postgres`)
- **Port**: 5432
- **Purpose**: Database for user data and Keycloak
- **Features**: User profiles, preferences, Keycloak data

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ and pnpm

### Development Setup

1. **Clone and install dependencies**:
```bash
git clone <repository>
cd microservices
pnpm install
```

2. **Start all services**:
```bash
docker compose -f docker compose.dev.yml up -d
```

3. **Access services**:
- API Gateway: http://localhost:3000
- User Service: http://localhost:3002
- Keycloak: http://localhost:8080
- PostgreSQL: localhost:5432

### API Endpoints

#### User Management (via API Gateway)
- `GET /users/profile` - Get user profile
- `POST /users/profile` - Create user profile
- `PUT /users/profile` - Update user profile
- `DELETE /users/profile` - Delete user profile
- `GET /users/preferences` - Get user preferences
- `PUT /users/preferences` - Update user preferences

#### Admin Endpoints
- `GET /admin/users` - Get all users
- `GET /admin/users/:id` - Get user by ID

## Development

### Individual Service Development

```bash
# User Service
cd services/user
pnpm start:dev

# API Gateway
cd services/api-gateway
pnpm start:dev
```

### Database Migrations

```bash
# Generate migrations
cd services/user
pnpm drizzle-kit generate

# Apply migrations
pnpm drizzle-kit push
```

### Docker Development

```bash
# Build and start all services
docker compose -f docker compose.dev.yml up --build

# Start specific service
docker compose -f docker compose.dev.yml up user

# View logs
docker compose -f docker compose.dev.yml logs -f user
```

## Environment Variables

### User Service
```env
DATABASE_URL=postgresql://auth_user:auth_password@postgres:5432/auth_db
KEYCLOAK_URL=http://keycloak:8080
KEYCLOAK_REALM=master
KEYCLOAK_CLIENT_ID=user-service
KEYCLOAK_CLIENT_SECRET=your-client-secret
```

### API Gateway
```env
USER_SERVICE_URL=http://user:3002
KEYCLOAK_URL=http://keycloak:8080
```

## Architecture Benefits

### Separation of Concerns
- **Keycloak**: Handles authentication and authorization
- **User Service**: Manages user profiles and preferences
- **API Gateway**: Routes requests and handles cross-cutting concerns

### Scalability
- Each service can scale independently
- Database can be optimized for specific use cases
- Services can be deployed separately

### Maintainability
- Clear service boundaries
- Single responsibility principle
- Easy to add new features

## Recent Changes

### Auth → User Service Transformation
The auth service was transformed into a user service to better separate concerns:

**Before**: Auth service handled both authentication and user management
**After**: 
- Keycloak handles authentication directly
- User service focuses on user profile management
- Clear separation between identity and user data

**Benefits**:
- Cleaner architecture
- Better scalability
- Easier maintenance
- Future-proof design

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License 