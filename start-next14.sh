#!/bin/bash

echo "🔍 Starting Next.js 14 Debug Session"
echo "====================================="

# Clean up any existing processes
echo "🧹 Cleaning up existing processes..."
lsof -ti :3000 | xargs kill -9 2>/dev/null || true

# Clean build artifacts
echo "🧹 Cleaning build artifacts..."
rm -rf .next .swc node_modules/.cache

# Check Next.js version
echo "📦 Checking Next.js version..."
if [ -f "node_modules/next/package.json" ]; then
    VERSION=$(cat node_modules/next/package.json | grep '"version"' | cut -d'"' -f4)
    echo "📦 Found Next.js version: $VERSION"
else
    echo "❌ Next.js not found in node_modules"
    exit 1
fi

# Set environment variables for debugging
export NODE_ENV=development
export NEXT_DEBUG=1
export DEBUG=next:*
export FORCE_COLOR=1

echo "🚀 Starting Next.js development server..."
echo "📍 Server will be available at: http://localhost:3000"
echo "🛑 Press Ctrl+C to stop the server"
echo ""

# Start Next.js
node_modules/.bin/next dev --port 3000 