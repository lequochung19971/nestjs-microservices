# API Gateway Dockerfile
FROM base AS api-gateway-builder

# Set working directory to the specific service
WORKDIR /app/services/api-gateway

# Build the API Gateway service
RUN pnpm run build

# Production stage for API Gateway
FROM production AS api-gateway-production

# Copy built application from builder stage
COPY --from=api-gateway-builder /app/services/api-gateway/dist ./dist
COPY --from=api-gateway-builder /app/services/api-gateway/package*.json ./

# Install only production dependencies for this service
RUN pnpm install --frozen-lockfile --prod

# Expose API Gateway port
EXPOSE 3000

# Health check for API Gateway
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Start the API Gateway application
CMD ["node", "dist/main"]

# Development stage for API Gateway
FROM development AS api-gateway-development

# Set working directory to the specific service
WORKDIR /app/services/api-gateway

# Expose API Gateway port
EXPOSE 3000

# Start the API Gateway in development mode
CMD ["pnpm", "run", "start:dev"] 