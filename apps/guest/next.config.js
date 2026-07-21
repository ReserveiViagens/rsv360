/** @type {import('next').NextConfig} */
const path = require('path');
const { getNextSecurityHeaders } = require('../../packages/shared/security-headers.cjs');

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  serverExternalPackages: ['@tanstack/react-query', '@tanstack/query-core'],
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
  async headers() {
    return [
      {
        source: '/:path*',
        headers: getNextSecurityHeaders(),
      },
    ];
  },
};

module.exports = nextConfig;