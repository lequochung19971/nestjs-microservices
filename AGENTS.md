# AGENTS.md — Coding Agent Reference

This file provides guidance for AI coding agents working in this repository.

---

## Project Overview

NestJS microservices monorepo managed with **pnpm workspaces** and **Lerna**.

- `services/` — 6 NestJS backend microservices (api-gateway, user, products, media, inventory, orders)
- `packages/` — shared libraries (nest-shared, eslint-config, ts-config)
- `apps/` — frontend applications (admin: React 19 + Vite, storefront)
- `docker/` — per-service Dockerfiles

---

## Package Manager

**Use pnpm exclusively. Never use npm or yarn.**

```bash
pnpm add <package>                          # add dependency
pnpm add -D <package>                       # add dev dependency
pnpm --filter <workspace> <command>         # run command in specific workspace
pnpm --filter services/products test        # example: test a single service
```

Internal dependencies use the workspace protocol:
```bash
pnpm add @chill-microservice/nest-shared    # adds workspace:* dep
```

---

## Build Commands

```bash
# Build a single NestJS service
pnpm --filter services/<name> build         # e.g., services/products

# Build the shared nest-shared package (required before using it)
pnpm --filter @chill-microservice/nest-shared build

# Watch mode for nest-shared during development
pnpm --filter @chill-microservice/nest-shared dev

# Build frontend admin app
pnpm --filter apps/admin build

# Dev server for admin app (port 4000)
pnpm --filter apps/admin dev
```

---

## Lint Commands

```bash
# Lint a specific service (auto-fix enabled)
pnpm --filter services/<name> lint

# Lint the admin app
pnpm --filter apps/admin lint
```

Prettier is integrated via `eslint-plugin-prettier` for NestJS services.  
Prettier config for all NestJS services and packages:
```json
{ "singleQuote": true, "trailingComma": "all" }
```

---

## Test Commands

Tests use **Jest 29** with **ts-jest**. Config is inline in each service's `package.json`.

```bash
# Run all unit tests in a service
pnpm --filter services/<name> test

# Watch mode
pnpm --filter services/<name> test:watch

# Coverage report
pnpm --filter services/<name> test:cov

# E2E tests
pnpm --filter services/<name> test:e2e

# Run a single test file (from within the service directory)
pnpm --filter services/<name> test -- path/to/file.spec.ts

# Run tests matching a name pattern
pnpm --filter services/<name> test -- --testNamePattern="should create product"

# Run tests matching a file pattern
pnpm --filter services/<name> test -- --testPathPattern="products.service"
```

Test file conventions: `*.spec.ts` (unit), `*.e2e-spec.ts` (e2e).  
Test files live alongside source files in `src/`.

---

## Database Commands (per service)

```bash
pnpm --filter services/<name> db:generate   # generate Drizzle migration
pnpm --filter services/<name> db:push       # push schema to DB
pnpm --filter services/<name> db:migrate    # run migrations
```

---

## Infrastructure (Docker)

```bash
# Start all infrastructure (Postgres DBs, Keycloak, MinIO, RabbitMQ)
docker-compose up -d

# Services (ports):
#   api-gateway  3000    user      3001    products  3002
#   media        3003    inventory 3004    orders    3005
#   admin        4000    keycloak  8080    minio     9000/9001
#   rabbitmq     5672/15672
```

Copy `env.example` to `.env` in each service before running locally.

---

## Code Style Guidelines

### Naming Conventions
- **Files**: `kebab-case` — `auth.controller.ts`, `app-config.service.ts`
- **Classes & Interfaces**: `PascalCase`
- **Variables, functions, methods**: `camelCase`
- **Constants & env vars**: `ALL_CAPS`
- **NestJS file suffixes**: `.controller.ts`, `.service.ts`, `.module.ts`, `.guard.ts`, `.decorator.ts`, `.strategy.ts`, `.dto.ts`

### TypeScript
- **Backend (NestJS)**: `target: ES2021`, `module: nodenext`, `moduleResolution: nodenext`
  - `emitDecoratorMetadata: true`, `experimentalDecorators: true` required for NestJS DI
  - `strictNullChecks` and `noImplicitAny` are off — but avoid `any` regardless (`@typescript-eslint/no-explicit-any` is a warning)
- **Frontend (admin)**: `target: ES2022`, strict mode enabled, `verbatimModuleSyntax: true`
  - Path alias: `@/` maps to `./src/`

### Imports
- Third-party imports before internal imports
- Use multi-line destructured imports for many items
- Barrel exports via `index.ts` using `export * from './...'`

### NestJS Architecture
- **Keep controllers thin** — business logic belongs in services
- **Constructor injection** with `private readonly` pattern
- **App config**: each service has `src/app-config/` with `AppConfigModule` + `AppConfigService`
- **DTOs**: Classes with `class-validator` decorators + `@ApiProperty` from `@nestjs/swagger`
- **Barrel exports**: each module exposes an `index.ts`

### Authentication & Authorization
- Global `JwtAuthGuard` + `RolesGuard` applied as `APP_GUARD` in `AppModule`
- `@Public()` decorator bypasses JWT auth for open endpoints
- `@Roles({ resource: 'client', roles: ['role'] })` for RBAC
- JWT validated against Keycloak JWKS endpoint

### Error Handling
- Use NestJS HTTP exceptions: `NotFoundException`, `ConflictException`, `BadRequestException`, etc.
- Services use try/catch and re-throw typed NestJS exceptions
- Use `Logger` (from `@nestjs/common`) for logging — inject as `private readonly logger = new Logger(ClassName.name)`
- Do not swallow errors silently

### Database (Drizzle ORM)
- Schema defined in `src/db/schema.ts` per service
- Export inferred types: `export type User = typeof users.$inferSelect`
- `DrizzleModule` and `DrizzleService` injected into feature services

### Messaging (RabbitMQ)
- Event classes live in `packages/nest-shared/src/events/`
- Publishers and consumers are injectable NestJS services
- Use `RabbitMQModule.forRootAsync` in service `AppModule`

### Frontend (React / admin app)
- **TanStack Query** (`useQuery`, `useMutation`) for all server state
- **Query key factories** as typed `const` objects
- **React Hook Form + Zod** for forms and validation
- **shadcn/ui** (new-york style) + Radix UI + TailwindCSS v4
- Custom hooks in `src/hooks/`, named `use-*.ts` (kebab-case file, camelCase export)

### OpenAPI Clients
- Each service exposes Swagger at `/api/docs` and JSON at `/api/docs/json`
- Generated typed clients live in `src/api-clients/*.generated.ts`
- `nest-shared` aggregates all clients via `ApiClientService` using `openapi-fetch`

---

## Monorepo Rules (from .cursor/rules)

- Follow package isolation — only import shared code from `packages/`
- All external requests go through `api-gateway`; authentication is validated at the gateway level
- Use `@Public()` decorator for endpoints that should be publicly accessible
- Follow Single Responsibility Principle
- Document all public APIs with `@ApiOperation`, `@ApiResponse`, etc. from `@nestjs/swagger`
