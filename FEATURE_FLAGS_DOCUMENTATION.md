# Feature Flag System Documentation

## Overview

The FUSEtech app now includes a comprehensive feature flag system that allows controlled rollout of features across different phases (Phase 1, Phase 2, and Beta). This system enables:

- Gradual feature rollouts
- A/B testing capabilities
- Phase-based feature management
- User-specific feature targeting
- Both client-side and server-side feature evaluation

## Key Components

### 1. Feature Flag Service (`/src/lib/feature-flags/feature-flag-service.ts`)

The core service that manages feature flags:
- Stores and manages feature flag states
- Handles local overrides via localStorage
- Supports rollout percentages
- User group targeting
- Real-time flag change notifications

### 2. Feature Flag Provider (`/src/lib/feature-flags/feature-flag-provider.tsx`)

React context provider that makes feature flags available throughout the app:
- Provides hooks for accessing feature flags
- Handles server-side flag hydration
- Manages user context for flag evaluation

### 3. Feature Flag Types (`/src/lib/feature-flags/types.ts`)

Defines all available feature flags organized by phase:

**Phase 1 Features (Core - Enabled by default):**
- `BASIC_ACTIVITY_TRACKING` - Core activity tracking
- `USER_PROFILE` - User profile functionality
- `SOCIAL_FEED` - Activity feed and social features
- `BASIC_GAMIFICATION` - Points and achievements
- `DEVICE_INTEGRATION` - Fitness device connections

**Phase 2 Features (Advanced - Disabled by default):**
- `AI_INSIGHTS` - AI-powered activity insights
- `ADVANCED_ANALYTICS` - Detailed performance analytics
- `MARKETPLACE` - Digital goods marketplace
- `TOKEN_REWARDS` - FUSE token rewards system
- `TEAM_COMPETITIONS` - Team-based challenges
- `PREMIUM_FEATURES` - Premium subscription features
- `BEHAVIORAL_PSYCHOLOGY` - Psychology-based motivation

**Beta Features (Experimental):**
- `VOICE_COMMANDS` - Voice control
- `AR_ROUTES` - Augmented reality routes
- `SOCIAL_CHALLENGES` - Social challenge creation
- `NFT_ACHIEVEMENTS` - NFT-based achievements

## Usage

### Client-Side Usage

#### 1. Using the `useFeatureFlag` Hook

```typescript
import { useFeatureFlag, FEATURE_FLAGS } from '@/lib/feature-flags';

function MyComponent() {
  const showMarketplace = useFeatureFlag(FEATURE_FLAGS.MARKETPLACE);
  
  if (!showMarketplace) return null;
  
  return <MarketplaceComponent />;
}
```

#### 2. Using the `withFeatureFlag` HOC

```typescript
import { withFeatureFlag, FEATURE_FLAGS } from '@/lib/feature-flags';

const MarketplaceCard = () => <div>Marketplace Content</div>;

export const FeatureFlaggedMarketplace = withFeatureFlag(
  MarketplaceCard,
  FEATURE_FLAGS.MARKETPLACE
);
```

#### 3. Using Multiple Feature Flags

```typescript
import { useMultipleFeatureFlags, FEATURE_FLAGS } from '@/lib/feature-flags';

function Dashboard() {
  const features = useMultipleFeatureFlags([
    FEATURE_FLAGS.AI_INSIGHTS,
    FEATURE_FLAGS.MARKETPLACE,
    FEATURE_FLAGS.TOKEN_REWARDS
  ]);
  
  return (
    <div>
      {features[FEATURE_FLAGS.AI_INSIGHTS] && <AIInsights />}
      {features[FEATURE_FLAGS.MARKETPLACE] && <Marketplace />}
      {features[FEATURE_FLAGS.TOKEN_REWARDS] && <TokenRewards />}
    </div>
  );
}
```

### Server-Side Usage

#### 1. Evaluating Flags in Server Components

```typescript
import { evaluateFeatureFlags } from '@/lib/feature-flags/server-utils';

export default async function Page() {
  const flags = await evaluateFeatureFlags();
  
  return (
    <div>
      {flags.marketplace && <MarketplaceSection />}
    </div>
  );
}
```

#### 2. Checking Specific Features

```typescript
import { isFeatureEnabled, FEATURE_FLAGS } from '@/lib/feature-flags/server-utils';

export default async function MarketplacePage() {
  const enabled = await isFeatureEnabled(FEATURE_FLAGS.MARKETPLACE);
  
  if (!enabled) {
    redirect('/feature-unavailable');
  }
  
  return <Marketplace />;
}
```

## Dev Tools

### Feature Flag Toggle UI

The system includes a developer-friendly UI for managing feature flags:

1. **In-Dashboard Toggle**: Click the "Features" button in the dashboard to see a quick toggle panel
2. **Dev Tools Panel**: Press `Ctrl+Shift+F` anywhere in the app to open the full feature flag dev tools
3. **Settings Page**: Navigate to `/settings/feature-flags` for a comprehensive feature management interface

### Features of the Dev Tools:

- Search and filter flags by name or description
- Filter by phase (Phase 1, Phase 2, Beta)
- See rollout percentages and user group restrictions
- Toggle features on/off with instant updates
- Changes persist locally via localStorage

## Middleware Integration

The feature flag system integrates with Next.js middleware to:

1. **Route Protection**: Automatically redirect users to a "feature unavailable" page when accessing disabled features
2. **Server-Side Evaluation**: Evaluate flags on the server before rendering pages
3. **Header Injection**: Pass feature flags via headers for client-side hydration

Protected routes are automatically handled:
- `/marketplace` → Requires `MARKETPLACE` flag
- `/ai-insights` → Requires `AI_INSIGHTS` flag
- `/teams` → Requires `TEAM_COMPETITIONS` flag
- etc.

## Best Practices

1. **Always use typed flag constants** from `FEATURE_FLAGS` instead of strings
2. **Handle loading states** when checking features client-side
3. **Provide fallback UI** for disabled features when appropriate
4. **Test with different flag combinations** using the dev tools
5. **Use server-side evaluation** for SEO-critical content
6. **Document feature dependencies** in your components

## Testing Features

To test different phases:

1. Open the dev tools with `Ctrl+Shift+F`
2. Toggle phase-specific features on/off
3. Test user flows with different combinations
4. Use the phase filter buttons to quickly enable/disable entire phases

## Future Enhancements

The feature flag system is designed to support:

- Remote flag configuration via API
- Analytics integration for feature usage tracking
- Automated rollout strategies
- Feature flag scheduling
- More sophisticated targeting rules
- Integration with CI/CD pipelines

## Troubleshooting

**Features not updating?**
- Check if you have local overrides in localStorage
- Ensure the FeatureFlagProvider is properly wrapped around your app
- Verify the feature flag key matches exactly

**Middleware redirects not working?**
- Check that the route is listed in the middleware's protected routes
- Ensure the feature flag service is properly initialized
- Verify cookies are being set correctly for user context