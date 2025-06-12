/** @type {import('next').NextConfig} */
const nextConfig = {
  // Docker and deployment configuration
  output: 'standalone',

  // Image optimization
  images: {
    domains: ['picsum.photos', 'via.placeholder.com', 'images.unsplash.com'],
    unoptimized: process.env.NODE_ENV === 'production', // Disable optimization in production for Docker
  },

  // Build optimization
  eslint: {
    // Disable ESLint during builds for faster development
    ignoreDuringBuilds: true,
  },

  // TypeScript configuration
  typescript: {
    // Disable type checking during builds (handled by CI)
    ignoreBuildErrors: process.env.NODE_ENV === 'production',
  },

  // Experimental features
  experimental: {
    serverComponentsExternalPackages: ['@neondatabase/serverless'],
  },

  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
      {
        source: '/api/health',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
        ],
      },
    ];
  },

  // Redirects for better UX
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;