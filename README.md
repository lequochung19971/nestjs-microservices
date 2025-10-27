# Microservices Architecture

A microservices-based application with API Gateway, User Service, Products Service, Media Service, Inventory Service, and Keycloak for authentication. Includes Admin and Storefront applications.

## Architecture Overview

```mermaid
flowchart TD
    AG["API Gateway<br/>(Port 3000)<br/>• Route Proxy<br/>• Token Validation<br/>• Rate Limiting"] <--> KC["Keycloak<br/>(Port 8080)<br/>• Authentication<br/>• Authorization<br/>• Identity Mgmt"]
    AG <--> US["User Service<br/>(Port 3001)<br/>• User Profiles<br/>• Preferences<br/>• Business Logic"]
    AG <--> PS["Products Service<br/>(Port 3002)<br/>• Product Catalog<br/>• Categories<br/>• Product Images"]
    AG <--> MS["Media Service<br/>(Port 3003)<br/>• File Storage<br/>• Media Management<br/>• Image Processing"]
    AG <--> IS["Inventory Service<br/>(Port 3004)<br/>• Inventory Management<br/>• Warehouses<br/>• Reservations"]
    KC <--> DB["PostgreSQL<br/>(Port 5432)<br/>• User Data<br/>• Keycloak Data<br/>• Product Data<br/>• Media Metadata<br/>• Inventory Data"]
    US <--> DB
    PS <--> DB
    MS <--> DB
    IS <--> DB
    AG <--> SP["Shared Packages<br/>• Contracts<br/>• Auth<br/>• Common Code"]
    US <--> SP
    PS <--> SP
    MS <--> SP
    IS <--> SP
    AA["Admin App<br/>(React)<br/>• Admin Interface<br/>• User Management<br/>• Content Management"] <--> AG
    SA["Storefront App<br/>(React)<br/>• Customer Interface<br/>• Product Browsing<br/>• Shopping Experience"] <--> AG
```

## Services

### API Gateway (`services/api-gateway`)

- **Port**: 3000
- **Purpose**: Route requests, handle authentication, rate limiting
- **Features**: Proxy to microservices, health checks

### User Service (`services/user`)

- **Port**: 3001
- **Purpose**: Manage user profiles and preferences
- **Features**: User profile CRUD, preferences management, Keycloak integration

### Products Service (`services/products`)

- **Port**: 3002
- **Purpose**: Manage product catalog and categories
- **Features**: Product CRUD, hierarchical categories, product variants, multi-currency support

### Media Service (`services/media`)

- **Port**: 3003
- **Purpose**: Manage media assets and file storage
- **Features**: Image upload, processing, media management, secure storage

### Inventory Service (`services/inventory`)

- **Port**: 3004
- **Purpose**: Manage inventory and warehouse operations
- **Features**: Inventory tracking, warehouse management, reservations, transactions

### Keycloak (`keycloak`)

- **Port**: 8080
- **Purpose**: Authentication and authorization
- **Features**: OAuth2/OIDC, user management, role-based access

### PostgreSQL (`postgres`)

- **Port**: 5432
- **Purpose**: Database for user data, products, and Keycloak
- **Features**: User profiles, products, categories, Keycloak data

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ and pnpm

### Development Setup

1. Clone and install dependencies:

```bash
git clone <repository>
cd microservices
pnpm install
```

2. Start all services:

```bash
docker compose -f docker compose.dev.yml up -d
```

3. Access services:

- API Gateway: [http://localhost:3000](http://localhost:3000)
- User Service: [http://localhost:3001](http://localhost:3001)
- Products Service: [http://localhost:3002](http://localhost:3002)
- Media Service: [http://localhost:3003](http://localhost:3003)
- Inventory Service: [http://localhost:3004](http://localhost:3004)
- Keycloak: [http://localhost:8080](http://localhost:8080)
- PostgreSQL: localhost:5432
- Admin App: [http://localhost:4000](http://localhost:4000)
- Storefront: [http://localhost:4001](http://localhost:4001)

## Front-end Applications

### Admin App (`apps/admin`)

- **Technology**: React with Vite
- **Purpose**: Administration interface
- **Features**: User management, product catalog management, media management

### Storefront App (`apps/storefront`)

- **Technology**: React
- **Purpose**: Customer-facing e-commerce interface
- **Features**: Product browsing, shopping experience, user account management

## API Endpoints

### User Management (via API Gateway)

- `GET /users/profile` - Get user profile
- `POST /users/profile` - Create user profile
- `PUT /users/profile` - Update user profile
- `DELETE /users/profile` - Delete user profile
- `GET /users/preferences` - Get user preferences
- `PUT /users/preferences` - Update user preferences

### Admin User Endpoints

- `GET /admin/users` - Get all users
- `GET /admin/users/:id` - Get user by ID

### Categories Endpoints

- `POST /categories` - Create a new category
- `GET /categories` - Get all categories with pagination and filtering
  - Query parameters: `search`, `parentId`, `page`, `limit`, `sortBy`, `sortOrder`
- `GET /categories/:id` - Get a category by ID with its children
- `PATCH /categories/:id` - Update a category
- `DELETE /categories/:id` - Delete a category

### Products Endpoints

- `POST /products` - Create a new product
- `GET /products` - Get products with filters and pagination
- `GET /products/:id` - Get product by ID
- `PATCH /products/:id` - Update a product
- `DELETE /products/:id` - Delete a product

## Development

### Individual Service Development

```bash
# User Service
cd services/user
pnpm dev

# API Gateway
cd services/api-gateway
pnpm dev

# Products Service
cd services/products
pnpm dev

# Media Service
cd services/media
pnpm dev

# Inventory Service
cd services/inventory
pnpm dev
```

### Front-end Development

```bash
# Admin App
cd apps/admin
pnpm dev

# Storefront App
cd apps/storefront
pnpm dev
```

### Database Migrations

```bash
# Generate migrations (User Service)
cd services/user
pnpm db:generate

# Apply migrations (User Service)
pnpm db:push

# Generate migrations (Products Service)
cd services/products
pnpm db:generate

# Apply migrations (Products Service)
pnpm db:push

# Generate migrations (Media Service)
cd services/media
pnpm db:generate

# Apply migrations (Media Service)
pnpm db:push

# Generate migrations (Inventory Service)
cd services/inventory
pnpm db:generate

# Apply migrations (Inventory Service)
pnpm db:push
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
PORT=3001
```

### Products Service

```env
DATABASE_URL=postgresql://products_user:products_password@postgres:5432/products_db
KEYCLOAK_URL=http://keycloak:8080
KEYCLOAK_REALM=master
KEYCLOAK_CLIENT_ID=products-service
KEYCLOAK_CLIENT_SECRET=your-client-secret
PORT=3002
```

### Media Service

```env
DATABASE_URL=postgresql://media_user:media_password@postgres:5432/media_db
KEYCLOAK_URL=http://keycloak:8080
KEYCLOAK_REALM=master
KEYCLOAK_CLIENT_ID=media-service
KEYCLOAK_CLIENT_SECRET=your-client-secret
PORT=3003
STORAGE_PATH=/app/uploads
```

### Inventory Service

```env
DATABASE_URL=postgresql://inventory_user:inventory_password@postgres:5432/inventory_db
KEYCLOAK_URL=http://keycloak:8080
KEYCLOAK_REALM=master
KEYCLOAK_CLIENT_ID=inventory-service
KEYCLOAK_CLIENT_SECRET=your-client-secret
PORT=3004
RABBITMQ_HOST=rabbitmq
RABBITMQ_PORT=5672
RABBITMQ_USER=guest
RABBITMQ_PASSWORD=guest
```

### API Gateway

```env
USER_SERVICE_URL=http://user:3001
PRODUCTS_SERVICE_URL=http://products:3002
MEDIA_SERVICE_URL=http://media:3003
INVENTORY_SERVICE_URL=http://inventory:3004
KEYCLOAK_URL=http://keycloak:8080
```

### Admin App

```env
VITE_API_URL=http://localhost:3000/api
VITE_AUTH_URL=http://localhost:8080
VITE_AUTH_REALM=master
VITE_AUTH_CLIENT_ID=admin-app
```

### Storefront App

```env
VITE_API_URL=http://localhost:3000/api
VITE_AUTH_URL=http://localhost:8080
VITE_AUTH_REALM=master
VITE_AUTH_CLIENT_ID=storefront-app
```

## Architecture Benefits

### Separation of Concerns

- **Keycloak**: Handles authentication and authorization
- **User Service**: Manages user profiles and preferences
- **Products Service**: Manages product catalog and categories
- **Media Service**: Manages media files and storage
- **Inventory Service**: Manages inventory and warehouse operations
- **API Gateway**: Routes requests and handles cross-cutting concerns
- **Admin App**: Provides administration interface
- **Storefront App**: Provides customer-facing interface
- **Shared Packages**: Common code and contracts between services

### Scalability

- Each service can scale independently
- Database can be optimized for specific use cases
- Services can be deployed separately

### Maintainability

- Clear service boundaries
- Single responsibility principle
- Easy to add new features

## Recent Changes

### Inventory Service Addition

A new Inventory service was added to handle inventory management:

**Features**:

- Inventory item tracking with quantities and status
- Warehouse management for multiple locations
- Inventory reservations for order processing
- Transaction history for inventory movements
- Integration with product catalog
- Real-time stock availability

**Benefits**:

- Centralized inventory management
- Support for multi-warehouse operations
- Order fulfillment with reservation system
- Comprehensive audit trail of inventory movements
- Scalable architecture for complex inventory scenarios

### Media Service Addition

A new Media service was added to handle media files and storage:

**Features**:

- Secure file upload and storage
- Image processing and optimization
- Media metadata management
- Integration with product images
- Access control for media assets

**Benefits**:

- Centralized media management
- Separation of media concerns from other services
- Optimized handling of binary data
- Scalable architecture for growing media needs

### Products Service Addition

A new Products service was added to handle product catalog management:

**Features**:

- Complete product catalog management system
- Hierarchical category structure with parent-child relationships
- Support for product variants and multiple images
- Multi-currency support (USD, EUR, GBP, JPY, CAD, AUD)
- Category search and filtering

**Benefits**:

- Domain-specific service for product management
- Clear separation of product data from user data
- Optimized data schema for e-commerce use cases
- Scalable architecture for growing product catalogs

### Front-end Applications Addition

Two new front-end applications were added:

**Admin App**:

- React-based administrative interface
- User management interface
- Product catalog management
- Media library management

**Storefront App**:

- Customer-facing e-commerce interface
- Product browsing experience
- User account management

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