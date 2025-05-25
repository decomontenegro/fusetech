# 🚀 FUSEtech Deployment Guide

## Overview

This guide covers the deployment process for FUSEtech across different environments, from local development to production.

## Prerequisites

### Required Software
- **Node.js**: Version 18 or higher
- **npm**: Version 9 or higher (comes with Node.js)
- **Git**: For version control
- **Vercel CLI**: For production deployments (optional)

### Required Accounts
- **GitHub**: For code repository
- **Vercel**: For hosting (recommended)
- **Supabase**: For backend services (future)

## Local Development

### Initial Setup

1. **Clone the repository**
```bash
git clone https://github.com/decomontenegro/fusetech.git
cd fusetech
```

2. **Navigate to web app**
```bash
cd apps/web
```

3. **Install dependencies**
```bash
npm install
```

4. **Start development server**
```bash
npm run dev
```

5. **Access the application**
```
http://localhost:3000
```

### Development Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server locally
npm start

# Run linting
npm run lint

# Run type checking
npm run type-check
```

### Environment Variables

Create a `.env.local` file in the `apps/web` directory:

```bash
# Development environment
NODE_ENV=development

# Future environment variables
# NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
# STRAVA_CLIENT_ID=your_strava_client_id
# STRAVA_CLIENT_SECRET=your_strava_client_secret
```

## Staging Deployment

### Vercel (Recommended)

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Deploy to staging**
```bash
vercel --prod=false
```

4. **Set environment variables**
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Manual Deployment

1. **Build the application**
```bash
npm run build
```

2. **Test the build locally**
```bash
npm start
```

3. **Deploy to your hosting provider**
   - Upload the `.next` folder
   - Upload `public` folder
   - Upload `package.json` and `package-lock.json`
   - Run `npm install --production`
   - Start with `npm start`

## Production Deployment

### Automated Deployment with Vercel

1. **Connect GitHub repository**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Configure build settings:
     - Framework Preset: Next.js
     - Root Directory: `apps/web`
     - Build Command: `npm run build`
     - Output Directory: `.next`

2. **Configure environment variables**
   - Add production environment variables in Vercel dashboard
   - Set up different values for staging and production

3. **Set up custom domain**
   - Add your custom domain in Vercel dashboard
   - Configure DNS settings with your domain provider

### Manual Production Deployment

1. **Prepare production build**
```bash
# Set production environment
export NODE_ENV=production

# Install dependencies
npm ci

# Build the application
npm run build
```

2. **Deploy to server**
```bash
# Copy files to server
scp -r .next package.json package-lock.json user@server:/path/to/app/

# SSH into server
ssh user@server

# Navigate to app directory
cd /path/to/app/

# Install production dependencies
npm ci --production

# Start the application
npm start
```

## Environment Configuration

### Development Environment
```bash
# .env.local
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Staging Environment
```bash
# Vercel environment variables
NODE_ENV=staging
NEXT_PUBLIC_APP_URL=https://fusetech-staging.vercel.app
```

### Production Environment
```bash
# Vercel environment variables
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://fusetech.com
```

## Performance Optimization

### Build Optimization

1. **Enable compression**
```javascript
// next.config.js
module.exports = {
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
}
```

2. **Optimize images**
```javascript
// next.config.js
module.exports = {
  images: {
    domains: ['example.com'],
    formats: ['image/webp', 'image/avif'],
  },
}
```

### Runtime Optimization

1. **Enable caching headers**
```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}
```

## Monitoring & Analytics

### Error Tracking

1. **Sentry Integration** (Future)
```bash
npm install @sentry/nextjs
```

2. **Vercel Analytics**
```bash
npm install @vercel/analytics
```

### Performance Monitoring

1. **Web Vitals**
```javascript
// pages/_app.js
export function reportWebVitals(metric) {
  console.log(metric)
}
```

2. **Lighthouse CI**
```bash
npm install -g @lhci/cli
```

## Security Considerations

### Headers Configuration

```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}
```

### Environment Security

1. **Never commit secrets**
   - Use `.env.local` for local secrets
   - Use platform environment variables for production
   - Add `.env*` to `.gitignore`

2. **Validate environment variables**
```javascript
// lib/env.js
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
]

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`)
  }
})
```

## Troubleshooting

### Common Issues

1. **Build failures**
```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules
rm -rf node_modules
npm install

# Check for TypeScript errors
npm run type-check
```

2. **Runtime errors**
```bash
# Check logs
vercel logs [deployment-url]

# Enable debug mode
DEBUG=* npm run dev
```

3. **Performance issues**
```bash
# Analyze bundle size
npm run build
npx @next/bundle-analyzer
```

## Rollback Strategy

### Vercel Rollback
1. Go to Vercel dashboard
2. Select your project
3. Go to "Deployments" tab
4. Click "Promote to Production" on a previous deployment

### Manual Rollback
1. Keep previous build artifacts
2. Switch symlinks to previous version
3. Restart the application
4. Verify functionality

---

This deployment guide will be updated as new deployment strategies and tools are adopted.
