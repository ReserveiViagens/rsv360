/** @type {import('next').NextConfig} */
const { getNextSecurityHeaders } = require('../../packages/shared/security-headers.cjs');

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  serverExternalPackages: ['@tanstack/react-query', '@tanstack/query-core'],
  experimental: {
    externalDir: true,
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