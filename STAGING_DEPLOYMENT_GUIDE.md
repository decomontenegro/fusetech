# FUSEtech Staging Environment Guide

## Overview

This guide documents the staging environment setup and deployment process for FUSEtech. The staging environment mirrors production configuration to ensure reliable testing before production releases.

## Architecture

```
Production: main branch → fusetech.app
Staging: staging branch → staging.fusetech.app
Development: feature branches → preview deployments
```

## Initial Setup

### 1. Create Staging Branch

```bash
npm run staging:setup
```

This script will:
- Create a staging branch from main
- Push it to remote repository
- Set up git hooks for staging
- Create local environment files

### 2. Configure Vercel Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your FUSEtech project
3. Go to Settings → Git
4. Add staging branch to deployment configuration
5. Set production branch as "main"

### 3. Set Up Environment Variables

#### Local Setup
```bash
npm run staging:env
```

Then edit `.env.staging.local` with your staging credentials:

```env
# Update these values
DATABASE_URL=postgresql://user:pass@host/fusetech_staging
NEXT_PUBLIC_FIREBASE_API_KEY=your_staging_firebase_key
STRAVA_CLIENT_ID=your_staging_strava_id
# ... etc
```

#### Vercel Dashboard Setup

1. Go to Project Settings → Environment Variables
2. Add variables for "Preview" environment
3. Select "staging" branch specifically
4. Add all variables from `.env.staging`

### 4. Configure Domain

1. Go to Project Settings → Domains
2. Add `staging.fusetech.app`
3. Assign to staging branch deployments

## Deployment Process

### Automated Deployment (Recommended)

Push to staging branch triggers automatic deployment:

```bash
git checkout staging
git merge feature/your-feature
git push origin staging
```

### Manual Deployment

```bash
npm run deploy:staging
```

This script will:
1. Check you're on staging branch
2. Run tests and type checks
3. Build the application
4. Deploy to Vercel
5. Show deployment URL

### Vercel CLI Deployment

```bash
npm run vercel:staging
```

## Environment Variables

### Staging-Specific Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `NEXT_PUBLIC_ENVIRONMENT` | Environment identifier | `staging` |
| `NEXT_PUBLIC_APP_URL` | Application URL | `https://staging.fusetech.app` |
| `DATABASE_URL` | Staging database | `postgresql://...fusetech_staging` |
| `NEXT_PUBLIC_ENABLE_DEBUG_MODE` | Debug features | `true` |

### Service Configuration

#### Firebase (Staging Project)
- Create separate Firebase project: `fusetech-staging`
- Use staging credentials in environment
- Enable same services as production

#### Strava OAuth
- Register staging app with Strava
- Use staging redirect URL: `https://staging.fusetech.app/api/auth/strava/callback`
- Update webhook URL for staging

#### Database
- Use separate database: `fusetech_staging`
- Run migrations: `npx prisma migrate deploy`
- Seed with test data if needed

## Testing on Staging

### Pre-Deployment Checklist

- [ ] All tests pass locally
- [ ] Type checking passes
- [ ] No console errors
- [ ] Environment variables configured
- [ ] Database migrations applied

### Post-Deployment Testing

1. **Authentication Flow**
   - Social login (Google, Apple)
   - Strava connection
   - Logout/Login cycle

2. **Core Features**
   - Activity import from Strava
   - Token rewards calculation
   - Marketplace functionality
   - Team creation/joining

3. **Mobile Testing**
   - PWA installation
   - Push notifications
   - Offline functionality
   - Responsive design

### Monitoring

- Check Vercel Functions logs
- Monitor Sentry for errors
- Review Analytics data
- Test API endpoints

## Workflow

### Feature Development

```bash
# 1. Create feature branch from main
git checkout main
git pull origin main
git checkout -b feature/new-feature

# 2. Develop and test locally
npm run dev

# 3. Push feature branch
git push origin feature/new-feature

# 4. Create PR to staging
# Review and merge PR

# 5. Test on staging
# https://staging.fusetech.app

# 6. If approved, create PR from staging to main
```

### Hotfix Process

```bash
# 1. Create hotfix from main
git checkout main
git checkout -b hotfix/critical-fix

# 2. Fix and test
# ...

# 3. Deploy to staging first
git checkout staging
git merge hotfix/critical-fix
git push origin staging

# 4. Test on staging

# 5. If verified, merge to main
git checkout main
git merge hotfix/critical-fix
git push origin main
```

## Rollback Process

### Staging Rollback

```bash
# View recent deployments
vercel ls --scope fusetech

# Rollback to previous deployment
vercel rollback <deployment-url> --scope fusetech
```

### Emergency Production Rollback

```bash
# If staging issue found after production deploy
vercel rollback <production-deployment-url> --scope fusetech
```

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check environment variables
   - Verify dependencies installed
   - Review build logs in Vercel

2. **Environment Variable Issues**
   - Ensure all required vars set in Vercel
   - Check variable names match exactly
   - Verify staging-specific values

3. **Domain Issues**
   - Check DNS propagation
   - Verify domain configuration in Vercel
   - Check SSL certificate status

### Debug Mode

Staging has debug mode enabled by default:

```typescript
// Access debug info
if (process.env.NEXT_PUBLIC_ENABLE_DEBUG_MODE === 'true') {
  console.log('Debug info:', data);
}
```

## Security Considerations

1. **Separate Credentials**
   - Never use production credentials in staging
   - Use test payment methods
   - Separate OAuth apps

2. **Data Protection**
   - Don't copy production user data
   - Use synthetic test data
   - Clear staging data regularly

3. **Access Control**
   - Limit staging access to team members
   - Use Basic Auth if needed
   - Monitor access logs

## Maintenance

### Weekly Tasks
- Clear old staging deployments
- Update staging from main
- Review and clean test data

### Monthly Tasks
- Audit environment variables
- Update dependencies
- Review security settings
- Test disaster recovery

## Commands Reference

```bash
# Setup
npm run staging:setup     # Initial staging branch setup
npm run staging:env       # Create local env file

# Deployment
npm run deploy:staging    # Full deployment process
npm run vercel:staging    # Direct Vercel CLI deployment

# Management
git checkout staging      # Switch to staging branch
git merge main           # Update staging from main
vercel ls               # List deployments
vercel logs             # View function logs

# Testing
npm run test            # Run test suite
npm run type-check      # TypeScript checking
```

## Contact

For issues or questions about staging deployment:
- Technical Lead: andre@fusetech.app
- DevOps: devops@fusetech.app
- Slack: #fusetech-staging