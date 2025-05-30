/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['picsum.photos', 'via.placeholder.com', 'images.unsplash.com'],
  },
  eslint: {
    // Desativa a verificação de ESLint durante build para acelerar o desenvolvimento
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['@neondatabase/serverless']
  }
};

module.exports = nextConfig;