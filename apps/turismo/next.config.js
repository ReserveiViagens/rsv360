const path = require('path')
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: {
    domains: ['localhost', 'reserveiviagens.com.br', 'via.placeholder.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  outputFileTracingRoot: path.join(__dirname, './'),
  webpack: (config, { isServer, webpack }) => {
    const fs = require('fs')
    
    // SEMPRE usar React local do app (não do root)
    // Isso evita conflitos de versão entre root (18.3.1) e app (19.2.3)
    const localReactPath = path.resolve(__dirname, './node_modules/react')
    const localReactDomPath = path.resolve(__dirname, './node_modules/react-dom')
    
    // Verificar se existe localmente ou no root
    const rootPath = path.resolve(__dirname, '../../')
    const rootReactPath = path.resolve(rootPath, './node_modules/react')
    const rootReactDomPath = path.resolve(rootPath, './node_modules/react-dom')
    
    // Usar React local se existir, senão usar do root
    const reactPath = fs.existsSync(localReactPath) ? localReactPath : rootReactPath
    const reactDomPath = fs.existsSync(localReactDomPath) ? localReactDomPath : rootReactDomPath
    
    // Verificar se existe em algum lugar
    if (!fs.existsSync(reactPath)) {
      console.error('❌ ERRO: React não encontrado localmente nem no root!')
      console.error('   Execute: npm install react react-dom')
      throw new Error('React não encontrado. Execute: npm install react react-dom')
    }
    
    // Configurar aliases para FORÇAR uso do React (local ou root)
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, '.'),
      'react': reactPath,
      'react-dom': reactDomPath,
    }
    
    // Resolver jsx-runtime explicitamente - CRÍTICO
    const jsxDevRuntime = path.join(reactPath, 'jsx-dev-runtime.js')
    const jsxRuntime = path.join(reactPath, 'jsx-runtime.js')
    
    // Sempre definir os aliases, mesmo que os arquivos existam
    config.resolve.alias['react/jsx-dev-runtime'] = jsxDevRuntime
    config.resolve.alias['react/jsx-runtime'] = jsxRuntime
    
    // Priorizar node_modules local - CRÍTICO
    // NÃO incluir root node_modules para evitar conflitos
    config.resolve.modules = [
      path.resolve(__dirname, './node_modules'),
      'node_modules',
    ]
    
    // Garantir que apenas uma instância do React seja usada
    config.resolve.symlinks = false
    
    // SEMPRE usar NormalModuleReplacementPlugin para forçar React (local ou root)
    // Isso substitui TODAS as referências, incluindo do Next.js interno
    config.plugins = config.plugins || []
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /^react$/,
        reactPath
      ),
      new webpack.NormalModuleReplacementPlugin(
        /^react-dom$/,
        reactDomPath
      )
    )
    
    return config
  }
}

module.exports = nextConfig