# API Gateway Development Dockerfile
FROM node:18-alpine AS api-gateway-dev

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Install development tools
RUN apk add --no-cache \
    git \
    curl \
    vim \
    htop \
    procps \
    && rm -rf /var/cache/apk/*

# Copy root package files for monorepo setup
COPY package*.json ./
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY lerna.json ./

# Copy shared packages
COPY packages/ ./packages/
COPY services/api-gateway ./services/api-gateway

# Install all dependencies including dev dependencies
RUN pnpm install

# Copy source code for all services

# Set working directory to the specific service
WORKDIR /app/services/api-gateway

# Expose API Gateway port
EXPOSE 3000

CMD ["pnpm", "--filter", "api-gateway", "dev"] 
