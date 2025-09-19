#!/bin/bash

echo "🚀 Starting La Machine Dashboard..."

# Start the test API server
echo "📡 Starting API server on port 3000..."
tsx src/web/test-server.ts &
API_PID=$!

# Wait for API to be ready
sleep 2

# Start Vite dev server
echo "🎨 Starting frontend on port 3001..."
npm run dev:web

# Cleanup on exit
trap "kill $API_PID" EXIT