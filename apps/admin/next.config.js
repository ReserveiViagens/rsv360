/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['@tanstack/react-query', '@tanstack/query-core'],
  experimental: {
    externalDir: true,
  },
};

module.exports = nextConfig;