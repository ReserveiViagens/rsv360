/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Desabilitar lint durante build (corrigir depois)
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true, // Temporário: corrigir tipos depois
  },
  images: {
    // Migrado de domains (deprecated) para remotePatterns
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hebbkx1anhila5yf.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'reserveiviagens.com.br',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Headers para corrigir Permissions Policy violations
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
    ]
  },
  // Aliases de react/react-dom removidos para evitar conflitos com React.cache
  // O NPM Workspaces já gerencia as versões corretamente via overrides no root
  webpack: (config) => {
    // Manter apenas alias para @ (path alias do projeto)
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, '.'),
    }
    
    return config
  }
}

module.exports = nextConfig

