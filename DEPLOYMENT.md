# 🚀 FUSEtech Deployment Guide

This document provides comprehensive deployment instructions for the FUSEtech application.

## 📋 Overview

FUSEtech is a Next.js application with the following deployment options:
- **Docker**: Containerized deployment for any environment
- **Vercel**: Serverless deployment (recommended for quick setup)
- **Self-hosted**: Traditional server deployment

## 🔧 Prerequisites

### Required
- Node.js 18+ 
- npm or yarn
- Git

### For Docker Deployment
- Docker 20.10+
- Docker Compose (optional)

### For Database
- Neon Database account (recommended)
- PostgreSQL 14+ (alternative)

## 🗄️ Database Setup

### 1. Neon Database (Recommended)

1. **Create Neon Account**: Go to [neon.tech](https://neon.tech)
2. **Create Project**: Name it "FUSEtech"
3. **Get Connection String**: Copy from project dashboard
4. **Update Environment**: Add to `.env.local`

```bash
DATABASE_URL=postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### 2. Run Database Setup

```bash
# Automated setup
./database/setup.sh production

# Manual setup
psql $DATABASE_URL -f database/schema.sql
```

## 🔐 Environment Configuration

Create `.env.local` with the following variables:

```bash
# Database
DATABASE_URL=your_neon_database_url

# Authentication
NEXTAUTH_SECRET=your_nextauth_secret_key
NEXTAUTH_URL=https://your-domain.com

# OAuth Providers
STRAVA_CLIENT_ID=your_strava_client_id
STRAVA_CLIENT_SECRET=your_strava_client_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
APPLE_CLIENT_ID=your_apple_client_id
APPLE_CLIENT_SECRET=your_apple_client_secret

# Firebase (for notifications)
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_ADMIN_CLIENT_EMAIL=your_firebase_admin_email
FIREBASE_ADMIN_PRIVATE_KEY=your_firebase_admin_private_key

# Application
NODE_ENV=production
```

## 🐳 Docker Deployment

### 1. Build Docker Image

```bash
# Build the image
docker build -t fusetech:latest .

# Test the image
docker run -p 3000:3000 --env-file .env.local fusetech:latest
```

### 2. Docker Compose (Recommended)

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  fusetech:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Optional: Add nginx reverse proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - fusetech
    restart: unless-stopped
```

### 3. Deploy with Docker Compose

```bash
# Start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f fusetech

# Stop services
docker-compose down
```

## ☁️ Vercel Deployment

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Deploy to Vercel

```bash
# Login to Vercel
vercel login

# Deploy
vercel --prod

# Set environment variables
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
# ... add all other environment variables
```

### 3. Configure Vercel Project

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to Settings → Environment Variables
4. Add all required environment variables
5. Redeploy the project

## 🖥️ Self-Hosted Deployment

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install nginx (optional)
sudo apt install nginx
```

### 2. Deploy Application

```bash
# Clone repository
git clone https://github.com/decomontenegro/fusetech.git
cd fusetech

# Install dependencies
npm ci --only=production

# Build application
npm run build

# Start with PM2
pm2 start npm --name "fusetech" -- start
pm2 save
pm2 startup
```

### 3. Configure Nginx (Optional)

Create `/etc/nginx/sites-available/fusetech`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Health check endpoint
    location /api/health {
        proxy_pass http://localhost:3000/api/health;
        access_log off;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/fusetech /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔍 Health Checks and Monitoring

### Health Check Endpoint

The application provides a comprehensive health check at `/api/health`:

```bash
# Check application health
curl http://localhost:3000/api/health

# Expected response
{
  "status": "healthy",
  "timestamp": "2024-01-12T10:30:00.000Z",
  "uptime": 3600,
  "version": "1.0.0",
  "environment": "production",
  "services": {
    "database": "connected",
    "auth": "operational",
    "notifications": "operational"
  },
  "checks": {
    "memory": {
      "status": "ok",
      "usage": 45,
      "limit": 512
    },
    "disk": {
      "status": "ok",
      "usage": "N/A"
    }
  }
}
```

### Monitoring Setup

1. **Uptime Monitoring**: Use services like UptimeRobot or Pingdom
2. **Application Monitoring**: Consider Sentry for error tracking
3. **Performance Monitoring**: Use Vercel Analytics or Google Analytics
4. **Log Monitoring**: Implement structured logging with Winston

## 🔒 Security Considerations

### Production Security Checklist

- [ ] Use HTTPS in production
- [ ] Set secure environment variables
- [ ] Enable CORS properly
- [ ] Implement rate limiting
- [ ] Use secure session configuration
- [ ] Regular security updates
- [ ] Database connection encryption
- [ ] Proper error handling (no sensitive data in errors)

### SSL/TLS Setup

For self-hosted deployments, use Let's Encrypt:

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 Performance Optimization

### Production Optimizations

1. **Enable Gzip Compression**
2. **Use CDN for Static Assets**
3. **Implement Caching Strategy**
4. **Database Connection Pooling**
5. **Image Optimization**
6. **Bundle Analysis**

```bash
# Analyze bundle size
npm run build
npx @next/bundle-analyzer
```

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Errors**
   ```bash
   # Test database connection
   psql $DATABASE_URL -c "SELECT version();"
   ```

2. **Build Failures**
   ```bash
   # Clear cache and rebuild
   rm -rf .next node_modules
   npm install
   npm run build
   ```

3. **Memory Issues**
   ```bash
   # Increase Node.js memory limit
   NODE_OPTIONS="--max-old-space-size=4096" npm start
   ```

4. **Port Already in Use**
   ```bash
   # Find and kill process using port 3000
   lsof -ti:3000 | xargs kill -9
   ```

### Logs and Debugging

```bash
# Docker logs
docker logs fusetech-container

# PM2 logs
pm2 logs fusetech

# Application logs
tail -f logs/application.log
```

## 📞 Support

For deployment issues:

1. Check the [Integration Test Report](INTEGRATION_TEST_REPORT.md)
2. Review the [Database Documentation](database/README.md)
3. Run the integration tests: `node scripts/test-integration.js`
4. Check application health: `curl http://localhost:3000/api/health`

---

**Last Updated**: January 12, 2025  
**Version**: 1.0.0  
**Deployment Status**: ✅ Production Ready
