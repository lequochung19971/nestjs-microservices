# Use the base production image
FROM microservices-base:latest as user-prod

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/ ./packages/
COPY services/user/package.json ./services/user/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy user service source code
COPY services/user/ ./services/user/

# Build the user service
RUN pnpm --filter "@microservices/user" build

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3002

# Expose port
EXPOSE 3002

# Start the user service
CMD ["pnpm", "--filter", "@microservices/user", "start:prod"] 