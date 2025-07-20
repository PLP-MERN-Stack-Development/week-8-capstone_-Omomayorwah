#!/bin/bash

# LearnBase Platform Deployment Script
# Usage: ./scripts/deploy.sh [environment]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default environment
ENVIRONMENT=${1:-production}

echo -e "${BLUE}🚀 LearnBase Platform Deployment${NC}"
echo -e "${BLUE}Environment: ${ENVIRONMENT}${NC}"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from template...${NC}"
    cp env.example .env
    echo -e "${YELLOW}⚠️  Please edit .env file with your configuration before continuing.${NC}"
    exit 1
fi

# Load environment variables
source .env

# Function to log with timestamp
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

# Function to log errors
error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

# Function to check if service is healthy
check_health() {
    local service=$1
    local max_attempts=30
    local attempt=1
    
    log "Checking health of $service..."
    
    while [ $attempt -le $max_attempts ]; do
        if docker-compose ps $service | grep -q "healthy"; then
            log "✅ $service is healthy"
            return 0
        fi
        
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    error "$service failed health check"
    return 1
}

# Backup function
backup_database() {
    if [ "$ENVIRONMENT" = "production" ]; then
        log "Creating database backup..."
        docker-compose exec -T mongodb mongodump --out /data/backup/$(date +%Y%m%d_%H%M%S)
        log "✅ Database backup created"
    fi
}

# Deploy function
deploy() {
    log "Starting deployment..."
    
    # Pull latest changes if in git repository
    if [ -d .git ]; then
        log "Pulling latest changes..."
        git pull origin main
    fi
    
    # Build and start services
    log "Building and starting services..."
    
    if [ "$ENVIRONMENT" = "production" ]; then
        docker-compose --profile production up -d --build
    else
        docker-compose up -d --build
    fi
    
    # Wait for services to be healthy
    log "Waiting for services to be ready..."
    
    if ! check_health mongodb; then
        error "MongoDB failed to start"
        exit 1
    fi
    
    if ! check_health redis; then
        error "Redis failed to start"
        exit 1
    fi
    
    if ! check_health app; then
        error "Application failed to start"
        exit 1
    fi
    
    log "✅ All services are healthy"
}

# SSL certificate setup
setup_ssl() {
    if [ "$ENVIRONMENT" = "production" ] && [ -n "$DOMAIN_NAME" ] && [ -n "$CERTBOT_EMAIL" ]; then
        log "Setting up SSL certificates..."
        docker-compose --profile production run --rm certbot
        log "✅ SSL certificates configured"
    fi
}

# Health check
health_check() {
    log "Performing health checks..."
    
    # Check application health
    if curl -f http://localhost:${PORT:-5000}/api/health > /dev/null 2>&1; then
        log "✅ Application health check passed"
    else
        error "Application health check failed"
        return 1
    fi
    
    # Check database connection
    if docker-compose exec -T mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
        log "✅ Database health check passed"
    else
        error "Database health check failed"
        return 1
    fi
    
    # Check Redis connection
    if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
        log "✅ Redis health check passed"
    else
        error "Redis health check failed"
        return 1
    fi
}

# Main deployment process
main() {
    log "Starting LearnBase Platform deployment..."
    
    # Backup database if production
    backup_database
    
    # Deploy services
    deploy
    
    # Setup SSL if production
    setup_ssl
    
    # Health checks
    health_check
    
    log "🎉 Deployment completed successfully!"
    
    # Display access information
    echo -e "${GREEN}"
    echo "📋 Access Information:"
    echo "   Frontend: http://localhost:${PORT:-5000}"
    echo "   Backend API: http://localhost:${PORT:-5000}/api"
    echo "   MongoDB: localhost:27017"
    echo "   Redis: localhost:6379"
    echo ""
    echo "📊 Monitoring:"
    echo "   Application Health: http://localhost:${PORT:-5000}/api/health"
    echo "   Docker Logs: docker-compose logs -f"
    echo ""
    echo "🔧 Management:"
    echo "   Stop: docker-compose down"
    echo "   Restart: docker-compose restart"
    echo "   Update: ./scripts/deploy.sh"
    echo -e "${NC}"
}

# Run main function
main "$@" 