#!/bin/bash

# Render Deployment Script for CFCU Backend

echo "🚀 Starting CFCU Backend Deployment..."

# Build the application
echo "📦 Building application..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed!"
    exit 1
fi

echo "🎉 Deployment ready!"
echo ""
echo "📋 Next steps:"
echo "1. Go to https://render.com"
echo "2. Create new Web Service"
echo "3. Connect your GitHub repository"
echo "4. Set Root Directory to: server"
echo "5. Set Build Command to: npm install && npm run build"
echo "6. Set Start Command to: npm start"
echo "7. Add environment variables in Render dashboard"
echo ""
echo "🔧 Required Environment Variables:"
echo "- MONGODB_URI"
echo "- JWT_SECRET"
echo "- SENDGRID_API_KEY"
echo "- SENDGRID_FROM_EMAIL"
echo "- NODE_ENV=production"
echo "- PORT=10000"
echo "- CORS_ORIGIN=https://cornerstonefcu.web.app"
