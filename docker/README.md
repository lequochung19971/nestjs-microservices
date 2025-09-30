# Docker Configuration

This directory contains centralized Docker configurations for the microservices monorepo.

## Structure

- `base.Dockerfile` - Base Dockerfile used by all services
- `dev.Dockerfile` - Development base Dockerfile with tools
- `auth.Dockerfile` - Auth service production Dockerfile
- `auth.dev.Dockerfile` - Auth service development Dockerfile
- `api-gateway.Dockerfile` - API Gateway production Dockerfile
- `api-gateway.dev.Dockerfile` - API Gateway development Dockerfile
- `README.md` - This documentation file

## Architecture

The Docker setup uses a multi-stage build approach:

1. **Base Stage**: Installs pnpm and all monorepo dependencies
2. **Development Stage**: Includes source code and development tools
3. **Builder Stage**: Builds all services
4. **Production Stage**: Creates minimal production images for each service

## Development Configurations

### Standard Development
- **File**: `docker-compose.dev.yml`
- **Features**: Hot reloading, volume mounts, development tools
- **Usage**: `./scripts/docker.sh up-dev`

### Debug Development
- **File**: `docker-compose.dev.debug.yml`
- **Features**: Remote debugging, Node.js inspector, debug ports
- **Usage**: `./scripts/docker.sh up-debug`
- **Debug Ports**:
  - Auth Service: `localhost:9222`
  - API Gateway: `localhost:9223`
  - Dev Tools: `localhost:9229`

### Test Environment
- **File**: `docker-compose.dev.test.yml`
- **Features**: Isolated test database, test-specific environment
- **Usage**: `./scripts/docker.sh up-test`
- **Test Database**: `localhost:5433`

## Usage

### Production
```bash
docker-compose up --build
```

### Development
```bash
# Standard development
docker-compose -f docker-compose.dev.yml up --build

# Debug development
docker-compose -f docker-compose.dev.debug.yml up --build

# Test environment
docker-compose -f docker-compose.dev.test.yml --profile test up --build
```

### Using Helper Script
```bash
# Make executable
chmod +x scripts/docker.sh

# Development
./scripts/docker.sh build-dev
./scripts/docker.sh up-dev

# Debug
./scripts/docker.sh build-debug
./scripts/docker.sh up-debug

# Testing
./scripts/docker.sh test
./scripts/docker.sh test-unit
./scripts/docker.sh test-e2e
```

## Development Features

### Hot Reloading
- All development configurations include hot reloading
- File changes are automatically detected and services restart
- Volume mounts ensure code changes are reflected immediately

### Debugging
- Debug configurations expose Node.js inspector ports
- Remote debugging support for VS Code and other IDEs
- Separate debug containers for each service

### Testing
- Isolated test environment with separate database
- Unit tests, e2e tests, and integration tests
- Test-specific environment variables

### Development Tools
- Optional development tools container
- Includes git, curl, vim, htop, procps
- Access via: `./scripts/docker.sh shell`

## Benefits

- **Centralized Configuration**: All Docker configurations are in one place
- **Monorepo Support**: Properly handles shared packages and dependencies
- **Optimized Builds**: Uses multi-stage builds for smaller production images
- **Consistent Environment**: All services use the same base configuration
- **Easy Maintenance**: Changes to Docker setup only need to be made in one place
- **Multiple Environments**: Development, debug, and test configurations
- **Hot Reloading**: Fast development cycle with automatic restarts
- **Debugging Support**: Remote debugging capabilities
- **Testing Support**: Isolated test environment

## Adding New Services

To add a new service:

1. Create a new Dockerfile in this directory (e.g., `new-service.Dockerfile`)
2. Create a development version (e.g., `new-service.dev.Dockerfile`)
3. Follow the pattern of existing service Dockerfiles
4. Update the docker-compose files to reference the new Dockerfile
5. Update the build context to use the root directory

## Ports

### Production
- API Gateway: 3000
- Auth Service: 3001
- PostgreSQL: 5432

### Development
- API Gateway: 3000
- Auth Service: 3001
- PostgreSQL: 5432
- Dev Tools: 9229

### Debug
- API Gateway: 3000 (Debug: 9223)
- Auth Service: 3001 (Debug: 9222)
- PostgreSQL: 5432
- Dev Tools: 9229

### Test
- API Gateway: 3000
- Auth Service: 3001
- PostgreSQL: 5433 (separate test database)

## Environment Variables

### Development
- `NODE_ENV=development`
- Hot reloading enabled
- Debug tools available

### Debug
- `NODE_ENV=development`
- Node.js inspector enabled
- Debug ports exposed

### Test
- `NODE_ENV=test`
- Test database connection
- Test-specific secrets 