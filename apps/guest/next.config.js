/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    externalDir: true,
  },
  turbopack: {
    resolveAlias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.reserveiviagens.com.br',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
