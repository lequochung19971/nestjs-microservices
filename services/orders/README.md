# Orders Service

A comprehensive order management microservice for handling customer orders, payments, and order lifecycle management.

## Features

- ✅ Complete order lifecycle management
- ✅ Multiple payment methods support
- ✅ Integration with Products, Inventory, and User services
- ✅ Event-driven architecture with RabbitMQ
- ✅ Real-time order status tracking
- ✅ Payment processing and tracking
- ✅ Order history and audit trail
- ✅ Comprehensive API documentation with Swagger

## Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL with Drizzle ORM
- **Message Queue**: RabbitMQ
- **Authentication**: Keycloak JWT
- **API Documentation**: Swagger/OpenAPI
- **Testing**: Jest

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL
- RabbitMQ
- pnpm

### Installation

```bash
# Install dependencies
pnpm install

# Run database migrations
pnpm drizzle-kit push:pg

# Start the service
pnpm dev
```

### Environment Variables

Create a `.env` file based on `env.example`:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/orders

# RabbitMQ
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USER=guest
RABBITMQ_PASSWORD=guest

# Keycloak
KEYCLOAK_SERVER_URL=http://localhost:8080
KEYCLOAK_REALM=your-realm
KEYCLOAK_CLIENT_ID=orders-service
```

## API Endpoints

### Orders

- `POST /orders` - Create a new order
- `GET /orders` - List orders with filtering and pagination
- `GET /orders/:id` - Get order by ID
- `GET /orders/number/:orderNumber` - Get order by order number
- `PUT /orders/:id` - Update order
- `POST /orders/:id/cancel` - Cancel order

### Payments

- `POST /payments` - Create a payment
- `POST /payments/:id/process` - Process a payment
- `POST /payments/:id/fail` - Mark payment as failed
- `GET /payments/order/:orderId` - Get payments for an order
- `GET /payments/:id` - Get payment details

## Order Lifecycle

```
PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED
                ↓
            CANCELLED
```

## Payment Status

- `PENDING` - Payment initiated but not processed
- `PAID` - Payment successfully processed
- `FAILED` - Payment processing failed
- `REFUNDED` - Payment refunded to customer
- `PARTIALLY_REFUNDED` - Partial refund issued

## Events

### Published Events

- `orders.created` - New order created
- `orders.updated` - Order details updated
- `orders.cancelled` - Order cancelled
- `orders.confirmed` - Order confirmed
- `orders.shipped` - Order shipped
- `orders.delivered` - Order delivered
- `payments.processed` - Payment processed

### Consumed Events

- `products.updated` - Product information updated
- `inventory.reserved` - Inventory reserved for order
- `inventory.reservation.failed` - Inventory reservation failed

## Database Schema

### Main Tables

- **orders** - Core order information
- **order_items** - Items in each order
- **order_products** - Product snapshot at order time
- **shipping_addresses** - Shipping information
- **billing_addresses** - Billing information
- **order_status_history** - Status change audit trail
- **payments** - Payment transactions
- **order_refunds** - Refund records

## Testing

```bash
# Run unit tests
pnpm test

# Run tests with coverage
pnpm test:cov

# Run e2e tests
pnpm test:e2e
```

## Development

```bash
# Start in development mode
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start:prod
```

## API Documentation

Once the service is running, access the Swagger documentation at:
```
http://localhost:3005/api/docs
```

## Integration

### With Products Service

The orders service fetches product details when creating orders to ensure accurate pricing and product information.

### With Inventory Service

Orders trigger inventory reservations and listen for reservation confirmations or failures.

### With User Service

Customer information can be validated through the user service integration.

## Architecture

The service follows a modular architecture:

```
src/
├── modules/
│   ├── orders/          # Order management
│   │   ├── orders.service.ts
│   │   ├── orders.controller.ts
│   │   ├── orders-publishers.ts
│   │   └── orders-consumers.ts
│   └── payments/        # Payment processing
│       ├── payments.service.ts
│       └── payments.controller.ts
├── db/                  # Database configuration
│   ├── schema.ts
│   └── drizzle.service.ts
└── app.module.ts
```

## Contributing

1. Follow the existing code style
2. Write tests for new features
3. Update documentation
4. Use conventional commits

## License

MIT

