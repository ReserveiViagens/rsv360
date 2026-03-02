/**
 * ✅ SCRIPT DE SETUP AUTOMÁTICO - PRÓXIMOS PASSOS
 * 
 * Este script automatiza a configuração dos próximos passos opcionais
 * 
 * Uso: node scripts/setup-next-steps.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Configurando Próximos Passos Opcionais...\n');

// 1. Verificar e instalar dependências
console.log('📦 1. Verificando dependências...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const dependencies = Object.keys(packageJson.dependencies || {});
const devDependencies = Object.keys(packageJson.devDependencies || {});

const requiredDeps = ['socket.io', '@aws-sdk/client-s3'];
const missingDeps = requiredDeps.filter(dep => 
  !dependencies.includes(dep) && !devDependencies.includes(dep)
);

if (missingDeps.length > 0) {
  console.log(`   ⚠️  Dependências faltando: ${missingDeps.join(', ')}`);
  console.log('   📥 Instalando dependências...');
  try {
    execSync(`npm install ${missingDeps.join(' ')}`, { stdio: 'inherit' });
    console.log('   ✅ Dependências instaladas com sucesso!\n');
  } catch (error) {
    console.error('   ❌ Erro ao instalar dependências:', error.message);
    console.log('   💡 Execute manualmente: npm install socket.io @aws-sdk/client-s3\n');
  }
} else {
  console.log('   ✅ Todas as dependências já estão instaladas!\n');
}

// 2. Verificar .env.local
console.log('⚙️  2. Verificando arquivo .env.local...');
const envLocalPath = path.join(process.cwd(), '.env.local');
const envExamplePath = path.join(process.cwd(), '.env.example');

if (!fs.existsSync(envLocalPath)) {
  if (fs.existsSync(envExamplePath)) {
    console.log('   📋 Criando .env.local a partir do .env.example...');
    fs.copyFileSync(envExamplePath, envLocalPath);
    console.log('   ✅ .env.local criado!');
    console.log('   ⚠️  IMPORTANTE: Edite o .env.local com suas credenciais!\n');
  } else {
    console.log('   ⚠️  .env.example não encontrado. Criando .env.local básico...');
    const basicEnv = `# Configurações Básicas
NODE_ENV=development
PORT=3000
NEXT_PUBLIC_API_URL=http://localhost:3000

# WebSocket
NEXT_PUBLIC_WS_URL=ws://localhost:3001
WS_PORT=3001

# Storage
STORAGE_TYPE=local
STORAGE_LOCAL_PATH=./storage

# JWT
JWT_SECRET=your-secret-key-change-in-production-min-32-chars

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/rsv360
`;
    fs.writeFileSync(envLocalPath, basicEnv);
    console.log('   ✅ .env.local criado com configurações básicas!');
    console.log('   ⚠️  IMPORTANTE: Configure todas as variáveis necessárias!\n');
  }
} else {
  console.log('   ✅ .env.local já existe!\n');
}

// 3. Verificar variáveis essenciais
console.log('🔍 3. Verificando variáveis essenciais no .env.local...');
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  const requiredVars = [
    'JWT_SECRET',
    'NEXT_PUBLIC_WS_URL',
    'STORAGE_TYPE',
  ];
  
  const missingVars = requiredVars.filter(varName => {
    const regex = new RegExp(`^${varName}=`, 'm');
    return !regex.test(envContent);
  });
  
  if (missingVars.length > 0) {
    console.log(`   ⚠️  Variáveis faltando: ${missingVars.join(', ')}`);
    console.log('   💡 Adicione essas variáveis ao .env.local\n');
  } else {
    console.log('   ✅ Todas as variáveis essenciais estão configuradas!\n');
  }
}

// 4. Criar diretório de storage se não existir
console.log('📁 4. Verificando diretório de storage...');
const storagePath = path.join(process.cwd(), 'storage');
if (!fs.existsSync(storagePath)) {
  fs.mkdirSync(storagePath, { recursive: true });
  console.log('   ✅ Diretório storage/ criado!\n');
} else {
  console.log('   ✅ Diretório storage/ já existe!\n');
}

// 5. Verificar se o servidor WebSocket pode ser iniciado
console.log('🔌 5. Verificando servidor WebSocket...');
const wsScriptPath = path.join(process.cwd(), 'scripts', 'setup-websocket-server.js');
if (fs.existsSync(wsScriptPath)) {
  console.log('   ✅ Script do servidor WebSocket encontrado!');
  console.log('   💡 Para iniciar: npm run ws:server\n');
} else {
  console.log('   ⚠️  Script do servidor WebSocket não encontrado!\n');
}

// Resumo
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✅ SETUP CONCLUÍDO!\n');
console.log('📝 PRÓXIMOS PASSOS:\n');
console.log('1. Edite o arquivo .env.local com suas credenciais');
console.log('2. Configure as variáveis necessárias (JWT_SECRET, DATABASE_URL, etc.)');
console.log('3. Para usar S3 (opcional):');
console.log('   - Configure S3_BUCKET, S3_REGION, S3_ACCESS_KEY, S3_SECRET_KEY');
console.log('   - Defina STORAGE_TYPE=s3');
console.log('4. Para iniciar o servidor WebSocket:');
console.log('   npm run ws:server');
console.log('5. Para desenvolvimento com auto-reload:');
console.log('   npm run ws:dev (requer nodemon: npm install -D nodemon)');
console.log('\n📚 Documentação completa: GUIA_CONFIGURACAO_PROXIMOS_PASSOS.md');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

