#!/bin/bash

# DigitalOcean App Platform Deployment Script
# This script builds and deploys the Koa.js Electricity Bill API

set -e

echo "🚀 Starting deployment process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="koa-electricity-bill-api"
DOCKER_IMAGE="koaelectricitybillapi"
REGISTRY="registry.digitalocean.com"

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_requirements() {
    print_status "Checking requirements..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v doctl &> /dev/null; then
        print_warning "DigitalOcean CLI (doctl) is not installed. You may need to deploy manually."
    fi
    
    print_status "Requirements check completed."
}

# Build Docker image
build_image() {
    print_status "Building Docker image..."
    
    # Build the production image
    docker build --target production -t $DOCKER_IMAGE:latest .
    
    if [ $? -eq 0 ]; then
        print_status "Docker image built successfully!"
    else
        print_error "Failed to build Docker image."
        exit 1
    fi
}

# Test the Docker image locally
test_image() {
    print_status "Testing Docker image locally..."
    
    # Run the container in background
    CONTAINER_ID=$(docker run -d -p 3000:3000 $DOCKER_IMAGE:latest)
    
    # Wait for the application to start
    sleep 10
    
    # Test health endpoint
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        print_status "Local test passed! Health endpoint is responding."
    else
        print_error "Local test failed! Health endpoint is not responding."
        docker stop $CONTAINER_ID
        docker rm $CONTAINER_ID
        exit 1
    fi
    
    # Stop and remove the test container
    docker stop $CONTAINER_ID
    docker rm $CONTAINER_ID
    
    print_status "Local testing completed successfully."
}

# Deploy to DigitalOcean App Platform
deploy_to_do() {
    print_status "Deploying to DigitalOcean App Platform..."
    
    if command -v doctl &> /dev/null; then
        # Check if app exists by exact name match and get app ID
        APP_ID=$(doctl apps list --format ID,Spec.Name --no-header | awk -v app_name="$APP_NAME" '$2 == app_name {print $1}')
        
        if [ -n "$APP_ID" ]; then
            print_status "Updating existing app (ID: $APP_ID)..."
            doctl apps update $APP_ID --spec .do/app.yaml
        else
            print_status "Creating new app..."
            doctl apps create --spec .do/app.yaml
        fi
        
        print_status "Deployment initiated! Check the DigitalOcean console for status."
    else
        print_warning "doctl not found. Please deploy manually using the DigitalOcean console:"
        echo "1. Go to https://cloud.digitalocean.com/apps"
        echo "2. Click 'Create App'"
        echo "3. Connect your GitHub repository"
        echo "4. Use the configuration from .do/app.yaml"
    fi
}

# Main deployment process
main() {
    print_status "Starting deployment for $APP_NAME"
    
    check_requirements
    build_image
    test_image
    deploy_to_do
    
    print_status "Deployment process completed!"
    print_status "Your API should be available at: https://your-app-name.ondigitalocean.app"
}

# Run main function
main "$@"
