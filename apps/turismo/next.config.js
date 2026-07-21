/** @type {import('next').NextConfig} */
const { getNextSecurityHeaders } = require('../../packages/shared/security-headers.cjs');

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  typescript: { ignoreBuildErrors: true },
  experimental: {
    externalDir: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', pathname: '/**' },
      { protocol: 'https', hostname: 'reserveiviagens.com.br', pathname: '/**' },
      { protocol: 'https', hostname: 'www.reserveiviagens.com.br', pathname: '/**' },
      { protocol: 'https', hostname: 'via.placeholder.com', pathname: '/**' },
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
