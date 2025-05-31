#!/bin/bash
set -e

echo "Starting WebCrafterPros build process..."

# Install dependencies
npm ci

# Build the application  
npm run build

echo "Build complete. Starting server..."

# Start the application
npm start