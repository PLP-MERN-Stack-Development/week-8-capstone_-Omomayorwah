# Multi-stage Dockerfile for LearnBase Platform

# Stage 1: Frontend Build
FROM node:18-alpine AS frontend-build

WORKDIR /app/frontend

# Copy package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY frontend/ .

# Build the React app
RUN npm run build

# Stage 2: Backend Build
FROM node:18-alpine AS backend-build

WORKDIR /app/backend

# Copy package files
COPY backend/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY backend/ .

# Stage 3: Production Runtime
FROM node:18-alpine AS production

# Install system dependencies
RUN apk add --no-cache dumb-init

# Create app directory
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy built frontend
COPY --from=frontend-build /app/frontend/build ./frontend/build

# Copy backend
COPY --from=backend-build /app/backend ./backend

# Copy package files
COPY --from=backend-build /app/backend/package*.json ./backend/

# Install only production dependencies
RUN cd backend && npm ci --only=production

# Copy environment configuration
COPY docker/entrypoint.sh /entrypoint.sh
COPY docker/wait-for-it.sh /wait-for-it.sh

# Set permissions
RUN chmod +x /entrypoint.sh /wait-for-it.sh && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Set entrypoint
ENTRYPOINT ["dumb-init", "--"]
CMD ["/entrypoint.sh"] 