#!/bin/bash

# Docker helper script for microservices monorepo

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  build-prod     Build production images"
    echo "  build-dev      Build development images"
    echo "  build-debug    Build debug images"
    echo "  up-prod        Start production services"
    echo "  up-dev         Start development services"
    echo "  up-debug       Start debug services"
    echo "  up-test        Start test services"
    echo "  down           Stop all services"
    echo "  down-dev       Stop development services"
    echo "  down-debug     Stop debug services"
    echo "  down-test      Stop test services"
    echo "  logs           Show logs for all services"
    echo "  logs-dev       Show logs for development services"
    echo "  logs-debug     Show logs for debug services"
    echo "  logs-test      Show logs for test services"
    echo "  clean          Remove all containers, networks, and images"
    echo "  restart        Restart all services"
    echo "  health         Check health of all services"
    echo "  shell          Access development tools container"
    echo "  test           Run all tests"
    echo "  test-unit      Run unit tests"
    echo "  test-e2e       Run end-to-end tests"
    echo "  test-integration Run integration tests"
    echo ""
    echo "Examples:"
    echo "  $0 build-prod"
    echo "  $0 up-dev"
    echo "  $0 up-debug"
    echo "  $0 test"
    echo "  $0 logs"
}

# Function to build production images
build_prod() {
    print_status "Building production images..."
    docker-compose build --no-cache
    print_status "Production images built successfully!"
}

# Function to build development images
build_dev() {
    print_status "Building development images..."
    docker-compose -f docker-compose.dev.yml build --no-cache
    print_status "Development images built successfully!"
}

# Function to build debug images
build_debug() {
    print_status "Building debug images..."
    docker-compose -f docker-compose.dev.debug.yml build --no-cache
    print_status "Debug images built successfully!"
}

# Function to start production services
up_prod() {
    print_status "Starting production services..."
    docker-compose up -d
    print_status "Production services started!"
    print_status "API Gateway: http://localhost:3000"
    print_status "Auth Service: http://localhost:3001"
    print_status "PostgreSQL: localhost:5432"
}

# Function to start development services
up_dev() {
    print_status "Starting development services..."
    docker-compose -f docker-compose.dev.yml up -d
    print_status "Development services started!"
    print_status "API Gateway: http://localhost:3000"
    print_status "Auth Service: http://localhost:3001"
    print_status "PostgreSQL: localhost:5432"
    print_info "Hot reloading is enabled for all services"
}

# Function to start debug services
up_debug() {
    print_status "Starting debug services..."
    docker-compose -f docker-compose.dev.debug.yml up -d
    print_status "Debug services started!"
    print_status "API Gateway: http://localhost:3000 (Debug: localhost:9223)"
    print_status "Auth Service: http://localhost:3001 (Debug: localhost:9222)"
    print_status "PostgreSQL: localhost:5432"
    print_info "Debug ports are available for remote debugging"
}

# Function to start test services
up_test() {
    print_status "Starting test services..."
    docker-compose -f docker-compose.dev.test.yml --profile test up -d
    print_status "Test services started!"
    print_status "Test PostgreSQL: localhost:5433"
}

# Function to stop all services
down() {
    print_status "Stopping all services..."
    docker-compose down
    docker-compose -f docker-compose.dev.yml down
    docker-compose -f docker-compose.dev.debug.yml down
    docker-compose -f docker-compose.dev.test.yml down
    print_status "All services stopped!"
}

# Function to stop development services
down_dev() {
    print_status "Stopping development services..."
    docker-compose -f docker-compose.dev.yml down
    print_status "Development services stopped!"
}

# Function to stop debug services
down_debug() {
    print_status "Stopping debug services..."
    docker-compose -f docker-compose.dev.debug.yml down
    print_status "Debug services stopped!"
}

# Function to stop test services
down_test() {
    print_status "Stopping test services..."
    docker-compose -f docker-compose.dev.test.yml down
    print_status "Test services stopped!"
}

# Function to show logs
logs() {
    print_status "Showing logs for production services..."
    docker-compose logs -f
}

# Function to show development logs
logs_dev() {
    print_status "Showing logs for development services..."
    docker-compose -f docker-compose.dev.yml logs -f
}

# Function to show debug logs
logs_debug() {
    print_status "Showing logs for debug services..."
    docker-compose -f docker-compose.dev.debug.yml logs -f
}

# Function to show test logs
logs_test() {
    print_status "Showing logs for test services..."
    docker-compose -f docker-compose.dev.test.yml logs -f
}

# Function to clean everything
clean() {
    print_warning "This will remove all containers, networks, and images. Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_status "Cleaning up Docker resources..."
        docker-compose down --volumes --remove-orphans
        docker-compose -f docker-compose.dev.yml down --volumes --remove-orphans
        docker-compose -f docker-compose.dev.debug.yml down --volumes --remove-orphans
        docker-compose -f docker-compose.dev.test.yml down --volumes --remove-orphans
        docker system prune -a -f
        print_status "Cleanup completed!"
    else
        print_status "Cleanup cancelled."
    fi
}

# Function to restart services
restart() {
    print_status "Restarting services..."
    docker-compose restart
    print_status "Services restarted!"
}

# Function to check health
health() {
    print_status "Checking service health..."
    
    # Check if services are running
    if docker-compose ps | grep -q "Up"; then
        print_status "Production services are running"
        
        # Check API Gateway health
        if curl -f http://localhost:3000/health > /dev/null 2>&1; then
            print_status "✓ API Gateway is healthy"
        else
            print_error "✗ API Gateway health check failed"
        fi
        
        # Check Auth Service health
        if curl -f http://localhost:3001/health > /dev/null 2>&1; then
            print_status "✓ Auth Service is healthy"
        else
            print_error "✗ Auth Service health check failed"
        fi
        
        # Check PostgreSQL
        if docker-compose exec -T postgres pg_isready -U auth_user -d auth_db > /dev/null 2>&1; then
            print_status "✓ PostgreSQL is healthy"
        else
            print_error "✗ PostgreSQL health check failed"
        fi
    else
        print_warning "No production services are running"
    fi
}

# Function to access development tools container
shell() {
    print_status "Accessing development tools container..."
    docker-compose -f docker-compose.dev.yml exec dev-tools sh
}

# Function to run all tests
test() {
    print_status "Running all tests..."
    docker-compose -f docker-compose.dev.test.yml --profile test up --abort-on-container-exit
}

# Function to run unit tests
test_unit() {
    print_status "Running unit tests..."
    docker-compose -f docker-compose.dev.yml run --rm api-gateway pnpm run test
    docker-compose -f docker-compose.dev.yml run --rm auth pnpm run test
}

# Function to run e2e tests
test_e2e() {
    print_status "Running end-to-end tests..."
    docker-compose -f docker-compose.dev.test.yml --profile test up --abort-on-container-exit auth-test api-gateway-test
}

# Function to run integration tests
test_integration() {
    print_status "Running integration tests..."
    docker-compose -f docker-compose.dev.test.yml --profile test up --abort-on-container-exit integration-test
}

# Main script logic
case "${1:-}" in
    "build-prod")
        build_prod
        ;;
    "build-dev")
        build_dev
        ;;
    "build-debug")
        build_debug
        ;;
    "up-prod")
        up_prod
        ;;
    "up-dev")
        up_dev
        ;;
    "up-debug")
        up_debug
        ;;
    "up-test")
        up_test
        ;;
    "down")
        down
        ;;
    "down-dev")
        down_dev
        ;;
    "down-debug")
        down_debug
        ;;
    "down-test")
        down_test
        ;;
    "logs")
        logs
        ;;
    "logs-dev")
        logs_dev
        ;;
    "logs-debug")
        logs_debug
        ;;
    "logs-test")
        logs_test
        ;;
    "clean")
        clean
        ;;
    "restart")
        restart
        ;;
    "health")
        health
        ;;
    "shell")
        shell
        ;;
    "test")
        test
        ;;
    "test-unit")
        test_unit
        ;;
    "test-e2e")
        test_e2e
        ;;
    "test-integration")
        test_integration
        ;;
    *)
        show_usage
        exit 1
        ;;
esac 