/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@fuseapp/ui',
    '@fuseapp/utils',
    '@fuseapp/types',
    '@fuseapp/api',
    '@fuseapp/auth'
  ],
  images: {
    domains: ['picsum.photos', 'via.placeholder.com', 'images.unsplash.com'],
  },
  eslint: {
    // Desativa a verificação de ESLint durante build para acelerar o desenvolvimento
    ignoreDuringBuilds: true,
  }
};

module.exports = nextConfig; 