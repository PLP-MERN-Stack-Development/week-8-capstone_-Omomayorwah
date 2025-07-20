#!/bin/sh

# Wait for database to be ready
echo "Waiting for MongoDB..."
/wait-for-it.sh mongodb:27017 -t 60

echo "Waiting for Redis..."
/wait-for-it.sh redis:6379 -t 60

# Create uploads directory if it doesn't exist
mkdir -p /app/uploads

# Set proper permissions
chown -R nodejs:nodejs /app/uploads

# Start the application
echo "Starting LearnBase application..."
cd /app/backend
exec node server.js 