#!/bin/bash

# Custom build script for Vercel deployment
# This script handles the React version conflict with react-quill

echo "🚀 Starting custom build process..."

# Install dependencies with legacy peer deps
echo "📦 Installing dependencies with --legacy-peer-deps..."
npm install --legacy-peer-deps

# Check if installation was successful
if [ $? -ne 0 ]; then
    echo "❌ Dependencies installation failed"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Run the build
echo "🔨 Building the application..."
npm run build

# Check if build was successful
if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build completed successfully"
echo "🎉 Deployment ready!"
