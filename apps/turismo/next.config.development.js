/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Configuração de headers para desenvolvimento
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' 'unsafe-dynamic'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' http://localhost:* https://localhost:* ws://localhost:* wss://localhost:*",
              "frame-src 'self'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'self'",
              "worker-src 'self' blob:",
              "child-src 'self' blob:"
            ].join('; ')
          }
        ]
      }
    ]
  },

  // Configuração de webpack para desenvolvimento
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Permitir eval em desenvolvimento para hot reload
      config.devtool = 'eval-source-map'
      
      // Configurações adicionais para desenvolvimento
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false
      }
    }
    
    return config
  },

  // Configuração de experimental features
  experimental: {
    esmExternals: 'loose',
    forceSwcTransforms: true
  },

  // Configuração de rewrites para API
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/api/:path*',
      },
    ];
  }
}

module.exports = nextConfig 