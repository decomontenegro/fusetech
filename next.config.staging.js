/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'picsum.photos',
      'via.placeholder.com',
      'images.unsplash.com',
      'staging-storage.fusetech.app',
      'firebasestorage.googleapis.com'
    ],
  },
  eslint: {
    // Warning only in staging
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Type checking enabled in staging
    ignoreBuildErrors: false,
  },
  experimental: {
    serverComponentsExternalPackages: ['@neondatabase/serverless']
  },
  // Staging-specific headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Environment',
            value: 'staging',
          },
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow', // Prevent staging from being indexed
          },
        ],
      },
    ];
  },
  // Environment-specific redirects
  async redirects() {
    return [
      {
        source: '/admin/:path*',
        destination: '/login?redirect=/admin/:path*',
        permanent: false,
        has: [
          {
            type: 'header',
            key: 'x-environment',
            value: 'staging',
          },
        ],
      },
    ];
  },
  // Staging webpack configuration
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Add staging-specific webpack plugins
    if (!dev && process.env.NEXT_PUBLIC_ENVIRONMENT === 'staging') {
      config.plugins.push(
        new webpack.DefinePlugin({
          'process.env.BUILD_ID': JSON.stringify(buildId),
          'process.env.BUILD_TIME': JSON.stringify(new Date().toISOString()),
        })
      );
    }
    
    // Source map configuration for better debugging in staging
    if (!dev && process.env.NEXT_PUBLIC_ENVIRONMENT === 'staging') {
      config.devtool = 'source-map';
    }
    
    return config;
  },
  // Performance monitoring
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000, // 1 hour
    pagesBufferLength: 5,
  },
  // Staging-specific compression
  compress: true,
  // Generate build ID based on git commit
  generateBuildId: async () => {
    // Use git commit hash for staging builds
    const { execSync } = require('child_process');
    const gitHash = execSync('git rev-parse HEAD').toString().trim();
    return `staging-${gitHash.substring(0, 7)}`;
  },
  // Output configuration
  output: 'standalone',
  // Staging-specific environment variables
  env: {
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
    NEXT_PUBLIC_BUILD_ENV: 'staging',
  },
  // Enable React strict mode in staging
  reactStrictMode: true,
  // SWC minification
  swcMinify: true,
  // Staging telemetry
  productionBrowserSourceMaps: true,
};

module.exports = nextConfig;