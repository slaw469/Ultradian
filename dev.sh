#!/bin/bash

# Function to kill processes on a port
kill_port() {
    local port=$1
    local pid=$(lsof -ti :$port)
    if [ ! -z "$pid" ]; then
        echo "Killing process on port $port (PID: $pid)"
        kill -9 $pid 2>/dev/null || true
    fi
}

# Kill any processes on commonly used Next.js ports
for port in {3000..3010}; do
    kill_port $port
done

# Clean development artifacts
echo "Cleaning development artifacts..."
rm -rf .next

# Check for and install missing dependencies
echo "Checking dependencies..."
npm install superjson
npm install --save-dev mini-css-extract-plugin

# Start Next.js development server
echo "Starting development server..."
PORT=3000 npm run next-dev 