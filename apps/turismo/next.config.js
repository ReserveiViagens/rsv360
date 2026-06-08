/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
};

module.exports = nextConfig;
