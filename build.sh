#!/bin/bash
set -e

echo "Building KulturaMind Frontend..."
cd frontend
npm install --legacy-peer-deps
npm run build
echo "Build complete!"

