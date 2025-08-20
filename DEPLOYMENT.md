# Deployment Guide - DigitalOcean App Platform

This guide provides step-by-step instructions for deploying the Koa.js Electricity Bill API to DigitalOcean App Platform.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Deployment](#quick-deployment)
3. [Manual Deployment](#manual-deployment)
4. [Docker Deployment](#docker-deployment)
5. [Environment Configuration](#environment-configuration)
6. [Monitoring & Health Checks](#monitoring--health-checks)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, ensure you have:

- **DigitalOcean Account**: Sign up at [digitalocean.com](https://digitalocean.com)
- **GitHub Repository**: Your code should be in a GitHub repository
- **Docker** (optional): For local testing
- **DigitalOcean CLI** (optional): For automated deployment

## Quick Deployment

### Option 1: Automated Deployment Script

```bash
# Make script executable (if not already)
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

### Option 2: Manual Deployment via DigitalOcean Console

1. **Login to DigitalOcean Console**
   - Go to [cloud.digitalocean.com](https://cloud.digitalocean.com)
   - Navigate to "Apps" section

2. **Create New App**
   - Click "Create App"
   - Choose "GitHub" as source
   - Select your repository: `bgrimm-energy-platform-tariff-calculation`
   - Select branch: `main`

3. **Configure App Settings**
   - **Environment**: Node.js
   - **Build Command**: `npm install`
   - **Run Command**: `npm start`
   - **HTTP Port**: `3000`

4. **Environment Variables**
   ```
   NODE_ENV=production
   PORT=3000
   ```

5. **Health Check**
   - **HTTP Path**: `/health`
   - **Initial Delay**: `10s`
   - **Interval**: `30s`
   - **Timeout**: `5s`
   - **Retries**: `3`

6. **Deploy**
   - Click "Create Resources"
   - Wait for deployment to complete

## Manual Deployment

### Step 1: Prepare Your Repository

Ensure your repository contains:
- `package.json` with correct scripts
- `src/app.js` as the main entry point
- `.do/app.yaml` for DigitalOcean configuration
- `Dockerfile` for containerization

### Step 2: Configure DigitalOcean App Platform

Use the provided `.do/app.yaml` configuration:

```yaml
name: koa-electricity-bill-api
services:
  - name: api
    source_dir: /
    github:
      repo: your-username/bgrimm-energy-platform-tariff-calculation
      branch: main
    run_command: npm start
    environment_slug: node-js
    instance_count: 1
    instance_size_slug: basic-xxs
    http_port: 3000
    routes:
      - path: /
    health_check:
      http_path: /health
    envs:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: "3000"
```

### Step 3: Deploy via CLI (Optional)

If you have `doctl` installed:

```bash
# Authenticate with DigitalOcean
doctl auth init

# Create the app
doctl apps create --spec .do/app.yaml

# Update existing app
doctl apps update your-app-id --spec .do/app.yaml
```

## Docker Deployment

### Local Docker Testing

```bash
# Build the Docker image
docker build --target production -t koa-electricity-api .

# Run locally for testing
docker run -p 3000:3000 koa-electricity-api

# Test the API
curl http://localhost:3000/health
```

### Docker Image Features

- **Multi-stage build** for optimized production images
- **Non-root user** for security
- **Health checks** for monitoring
- **Alpine Linux** for smaller image size
- **Production-only dependencies**

## Environment Configuration

### Required Environment Variables

```bash
NODE_ENV=production
PORT=3000
```

### Optional Environment Variables

```bash
# Logging
LOG_LEVEL=info

# CORS (if needed)
CORS_ORIGIN=https://your-frontend-domain.com

# Rate limiting
RATE_LIMIT_WINDOW=15m
RATE_LIMIT_MAX=100
```

### Setting Environment Variables

1. **Via DigitalOcean Console**:
   - Go to your app settings
   - Navigate to "Environment Variables"
   - Add each variable

2. **Via CLI**:
   ```bash
   doctl apps update your-app-id --env NODE_ENV=production --env PORT=3000
   ```

## Monitoring & Health Checks

### Health Check Endpoint

The API provides a health check endpoint at `/health`:

```bash
curl https://your-app.ondigitalocean.app/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2025-08-20T10:45:10.000Z"
}
```

### Monitoring Features

- **Automatic health checks** every 30 seconds
- **Deployment monitoring** via DigitalOcean console
- **Log aggregation** in DigitalOcean dashboard
- **Performance metrics** (CPU, Memory, Network)

### Logs

View application logs:

```bash
# Via CLI
doctl apps logs your-app-id

# Via Console
# Go to your app → Logs tab
```

## Troubleshooting

### Common Issues

#### 1. Build Failures

**Problem**: App fails to build
**Solution**:
- Check `package.json` has correct scripts
- Ensure all dependencies are in `dependencies` (not `devDependencies`)
- Verify Node.js version compatibility

#### 2. Health Check Failures

**Problem**: Health checks failing
**Solution**:
- Verify `/health` endpoint returns 200 status
- Check application starts within 30 seconds
- Review logs for startup errors

#### 3. Port Issues

**Problem**: App not accessible
**Solution**:
- Ensure `PORT` environment variable is set to `3000`
- Verify `http_port` in `.do/app.yaml` matches
- Check firewall settings

#### 4. Memory Issues

**Problem**: App crashes due to memory
**Solution**:
- Upgrade instance size to `basic-xs` or higher
- Optimize application memory usage
- Add memory monitoring

### Debug Commands

```bash
# Check app status
doctl apps list

# View app details
doctl apps get your-app-id

# View logs
doctl apps logs your-app-id

# SSH into container (if supported)
doctl apps ssh your-app-id
```

### Performance Optimization

1. **Instance Sizing**:
   - Start with `basic-xxs` for testing
   - Upgrade to `basic-xs` or `basic-s` for production

2. **Scaling**:
   - Increase `instance_count` for horizontal scaling
   - Use `basic-m` or larger for vertical scaling

3. **Caching**:
   - Implement Redis for session storage
   - Use CDN for static assets

## Security Considerations

### Best Practices

1. **Environment Variables**: Never commit secrets to Git
2. **Non-root User**: Docker runs as non-root user
3. **Health Checks**: Regular monitoring of application health
4. **HTTPS**: Automatic SSL certificates via DigitalOcean
5. **Rate Limiting**: Implement API rate limiting

### Security Headers

The application includes security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

## Cost Optimization

### DigitalOcean App Platform Pricing

- **basic-xxs**: $5/month (512MB RAM, 0.25 vCPU)
- **basic-xs**: $12/month (1GB RAM, 0.5 vCPU)
- **basic-s**: $24/month (2GB RAM, 1 vCPU)

### Cost-Saving Tips

1. **Start Small**: Use `basic-xxs` for development/testing
2. **Auto-scaling**: Configure based on traffic patterns
3. **Resource Monitoring**: Monitor usage and optimize
4. **Development Environment**: Use local Docker for development

## Support

### Resources

- [DigitalOcean App Platform Documentation](https://docs.digitalocean.com/products/app-platform/)
- [DigitalOcean CLI Documentation](https://docs.digitalocean.com/reference/doctl/)
- [Node.js Best Practices](https://nodejs.org/en/docs/guides/)

### Getting Help

1. **DigitalOcean Support**: Available in your account dashboard
2. **Community**: [DigitalOcean Community](https://www.digitalocean.com/community)
3. **Documentation**: Check this project's README.md and TESTING.md

---

**Deployment Status**: ✅ Ready for Production

Your API will be available at: `https://your-app-name.ondigitalocean.app`
