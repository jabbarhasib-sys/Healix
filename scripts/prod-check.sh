#!/bin/bash
# Healix Production Health Check

echo "🔍 Checking Healix Service Status..."

# Check Docker containers
services=("healix_backend" "healix_frontend" "healix_postgres" "healix_redis" "healix_ollama")

for service in "${services[@]}"; do
    if [ "$(docker inspect -f '{{.State.Running}}' $service 2>/dev/null)" == "true" ]; then
        echo "✅ $service is running"
    else
        echo "❌ $service is NOT running"
    fi
done

echo "---"

# Check Backend Health API
echo "🧪 Testing Backend API..."
HEALTH=$(curl -s http://localhost:8000/health)
if [[ $HEALTH == *"status\":\"ok\""* ]]; then
    echo "✅ Backend API is healthy"
else
    echo "❌ Backend API health check failed"
fi

# Check Postgres connection
echo "🐘 Testing Database Connection..."
docker exec healix_postgres pg_isready -U healix -d healix_db > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Postgres is accepting connections"
else
    echo "❌ Postgres connection failed"
fi

echo "---"
echo "Done."
