# Base Dockerfile for all services in the monorepo
FROM node:18-alpine AS base

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy root package files for monorepo setup
COPY package*.json ./
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY lerna.json ./

# Copy shared packages
COPY packages/ ./packages/

# Install all dependencies for the monorepo
RUN pnpm install --frozen-lockfile

# Development stage
FROM base AS development

# Copy source code for all services
COPY services/ ./services/

# Expose default port (will be overridden by specific services)
EXPOSE 3000

# Default command (will be overridden by specific services)
CMD ["pnpm", "run", "start:dev"]

# Production build stage
FROM base AS builder

# Copy source code for all services
COPY services/ ./services/

# Build all services
RUN pnpm run build --recursive

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Change ownership of the app directory
RUN chown -R nestjs:nodejs /app
USER nestjs

# Expose default port (will be overridden by specific services)
EXPOSE 3000

# Default command (will be overridden by specific services)
CMD ["node", "dist/main"] 