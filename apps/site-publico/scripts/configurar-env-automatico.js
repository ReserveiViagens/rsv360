require('dotenv').config({ path: '../.env.local' });
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function updateEnvVar(content, key, value) {
  if (!value) return content; // Não atualizar se valor vazio
  
  const regex = new RegExp(`^${key}=.*$`, 'm');
  if (regex.test(content)) {
    return content.replace(regex, `${key}=${value}`);
  } else {
    return content + `\n${key}=${value}`;
  }
}

async function main() {
  console.log('========================================');
  console.log('CONFIGURAÇÃO AUTOMÁTICA DO .env.local');
  console.log('========================================');
  console.log('');

  const envPath = path.join(__dirname, '../.env.local');
  const examplePath = path.join(__dirname, '../env.example');

  // Verificar se .env.local existe
  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
    console.log('✅ Arquivo .env.local encontrado');
  } else {
    console.log('⚠️  Arquivo .env.local não encontrado');
    if (fs.existsSync(examplePath)) {
      console.log('📋 Copiando env.example para .env.local...');
      envContent = fs.readFileSync(examplePath, 'utf8');
      fs.writeFileSync(envPath, envContent);
      console.log('✅ Arquivo .env.local criado');
    } else {
      console.log('❌ Arquivo env.example não encontrado');
      process.exit(1);
    }
  }

  console.log('');
  console.log('Configurando variáveis essenciais...');
  console.log('');

  // Gerar JWT_SECRET se não existir
  let jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret || jwtSecret.includes('seu_jwt_secret') || jwtSecret.includes('seu_jwt')) {
    jwtSecret = crypto.randomBytes(64).toString('hex');
    envContent = updateEnvVar(envContent, 'JWT_SECRET', jwtSecret);
    console.log('✅ JWT_SECRET gerado automaticamente');
  } else {
    console.log('✅ JWT_SECRET já configurado');
  }

  // Garantir valores padrão para banco de dados se não estiverem configurados
  const defaults = {
    'DB_HOST': process.env.DB_HOST || 'localhost',
    'DB_PORT': process.env.DB_PORT || '5432',
    'DB_NAME': process.env.DB_NAME || 'onboarding_rsv_db',
    'DB_USER': process.env.DB_USER || 'onboarding_rsv',
    'DB_PASSWORD': process.env.DB_PASSWORD || 'senha_segura_123',
    'NEXT_PUBLIC_SITE_URL': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    'EMAIL_FROM': process.env.EMAIL_FROM || 'noreply@rsv360.com',
  };

  Object.entries(defaults).forEach(([key, value]) => {
    if (!process.env[key] || process.env[key].includes('seu_') || process.env[key].includes('sua_')) {
      envContent = updateEnvVar(envContent, key, value);
      console.log(`✅ ${key} configurado com valor padrão`);
    }
  });

  // Salvar arquivo
  fs.writeFileSync(envPath, envContent);

  console.log('');
  console.log('========================================');
  console.log('CONFIGURAÇÃO CONCLUÍDA!');
  console.log('========================================');
  console.log('');
  console.log('📋 Variáveis configuradas:');
  console.log('   ✅ JWT_SECRET (gerado automaticamente)');
  console.log('   ✅ Valores padrão para banco de dados');
  console.log('   ✅ NEXT_PUBLIC_SITE_URL');
  console.log('   ✅ EMAIL_FROM');
  console.log('');
  console.log('⚠️  IMPORTANTE: Configure manualmente:');
  console.log('   - SMTP (para emails)');
  console.log('   - Mercado Pago (para pagamentos)');
  console.log('   - OAuth (Google/Facebook)');
  console.log('   - Google Maps API Key');
  console.log('');
  console.log('📖 Veja GUIA_CONFIGURACAO_ENV_COMPLETO.md para mais detalhes');
  console.log('');
}

main().catch(console.error);

