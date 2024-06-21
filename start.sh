!/bin/bash

# Start the database and Redis services
docker-compose -f docker-compose.db.yml up -d

# Wait for the database and Redis to be up and running
echo "Waiting for database and Redis to start..."
while ! docker exec $(docker ps -q -f name=ps-postgres) pg_isready -U postgres > /dev/null 2> /dev/null; do
  echo "Waiting for PostgreSQL to be ready..."
  sleep 2
done

while ! docker exec $(docker ps -q -f name=redis) redis-cli ping | grep -q "PONG"; do
  echo "Waiting for Redis to be ready..."
  sleep 2
done

echo "Database and Redis are up and running."

# Build and start the application
docker-compose -f docker-compose.app.yml up --build
