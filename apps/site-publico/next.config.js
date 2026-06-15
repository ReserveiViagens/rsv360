/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['pg', 'ioredis', 'sharp', 'nodemailer'],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hebbkx1anhila5yf.public.blob.vercel-storage.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'reserveiviagens.com.br',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Permissions-Policy',
            value: 'unload=*, geolocation=(), microphone=(), camera=()',
          },
        ],
      },
    ];
  },
  turbopack: {
    resolveAlias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  webpack(config) {
    const patchCssLoader = (rules) => {
      if (!rules) return;
      for (const rule of rules) {
        if (rule.oneOf) patchCssLoader(rule.oneOf);
        const uses = rule.use
          ? Array.isArray(rule.use)
            ? rule.use
            : [rule.use]
          : [];
        for (const use of uses) {
          if (
            use &&
            typeof use === 'object' &&
            use.loader &&
            String(use.loader).includes('css-loader') &&
            use.options
          ) {
            use.options.url = false;
          }
        }
      }
    };
    patchCssLoader(config.module.rules);
    return config;
  },
};

module.exports = nextConfig;
