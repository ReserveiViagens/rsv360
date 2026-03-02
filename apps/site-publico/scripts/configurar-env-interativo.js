require('dotenv').config({ path: '../.env.local' });
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function main() {
  console.log('========================================');
  console.log('CONFIGURAÇÃO INTERATIVA DO .env.local');
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
  console.log('Vamos configurar as variáveis essenciais:');
  console.log('');

  // Banco de Dados
  console.log('📊 CONFIGURAÇÃO DO BANCO DE DADOS');
  console.log('----------------------------------------');
  const dbHost = await question(`DB_HOST [${process.env.DB_HOST || 'localhost'}]: `) || process.env.DB_HOST || 'localhost';
  const dbPort = await question(`DB_PORT [${process.env.DB_PORT || '5432'}]: `) || process.env.DB_PORT || '5432';
  const dbName = await question(`DB_NAME [${process.env.DB_NAME || 'onboarding_rsv_db'}]: `) || process.env.DB_NAME || 'onboarding_rsv_db';
  const dbUser = await question(`DB_USER [${process.env.DB_USER || 'onboarding_rsv'}]: `) || process.env.DB_USER || 'onboarding_rsv';
  const dbPassword = await question(`DB_PASSWORD [${process.env.DB_PASSWORD ? '***' : ''}]: `) || process.env.DB_PASSWORD || 'senha_segura_123';
  console.log('');

  // JWT
  console.log('🔑 CONFIGURAÇÃO JWT');
  console.log('----------------------------------------');
  let jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    const crypto = require('crypto');
    jwtSecret = crypto.randomBytes(64).toString('hex');
    console.log('✅ JWT_SECRET gerado automaticamente');
  } else {
    const keepJWT = await question(`Manter JWT_SECRET existente? (s/n) [s]: `) || 's';
    if (keepJWT.toLowerCase() !== 's') {
      const crypto = require('crypto');
      jwtSecret = crypto.randomBytes(64).toString('hex');
      console.log('✅ Novo JWT_SECRET gerado');
    }
  }
  console.log('');

  // SMTP
  console.log('📧 CONFIGURAÇÃO SMTP (Email)');
  console.log('----------------------------------------');
  console.log('Pressione Enter para pular (configurar depois)');
  const smtpHost = await question(`SMTP_HOST [${process.env.SMTP_HOST || 'smtp.gmail.com'}]: `) || process.env.SMTP_HOST || '';
  const smtpPort = await question(`SMTP_PORT [${process.env.SMTP_PORT || '587'}]: `) || process.env.SMTP_PORT || '587';
  const smtpUser = await question(`SMTP_USER [${process.env.SMTP_USER || ''}]: `) || process.env.SMTP_USER || '';
  const smtpPass = await question(`SMTP_PASS [${process.env.SMTP_PASS ? '***' : ''}]: `) || process.env.SMTP_PASS || '';
  const emailFrom = await question(`EMAIL_FROM [${process.env.EMAIL_FROM || 'noreply@rsv360.com'}]: `) || process.env.EMAIL_FROM || 'noreply@rsv360.com';
  console.log('');

  // Mercado Pago
  console.log('💳 CONFIGURAÇÃO MERCADO PAGO');
  console.log('----------------------------------------');
  console.log('Pressione Enter para pular (configurar depois)');
  const mpToken = await question(`MERCADO_PAGO_ACCESS_TOKEN [${process.env.MERCADO_PAGO_ACCESS_TOKEN ? '***' : ''}]: `) || process.env.MERCADO_PAGO_ACCESS_TOKEN || '';
  const mpPublicKey = await question(`MERCADO_PAGO_PUBLIC_KEY [${process.env.MERCADO_PAGO_PUBLIC_KEY ? '***' : ''}]: `) || process.env.MERCADO_PAGO_PUBLIC_KEY || '';
  const mpWebhook = await question(`MERCADO_PAGO_WEBHOOK_SECRET [${process.env.MERCADO_PAGO_WEBHOOK_SECRET ? '***' : ''}]: `) || process.env.MERCADO_PAGO_WEBHOOK_SECRET || '';
  console.log('');

  // Atualizar arquivo
  console.log('💾 Atualizando .env.local...');

  // Função para atualizar ou adicionar variável
  function updateEnvVar(content, key, value) {
    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (regex.test(content)) {
      return content.replace(regex, `${key}=${value}`);
    } else {
      return content + `\n${key}=${value}`;
    }
  }

  // Atualizar variáveis
  envContent = updateEnvVar(envContent, 'DB_HOST', dbHost);
  envContent = updateEnvVar(envContent, 'DB_PORT', dbPort);
  envContent = updateEnvVar(envContent, 'DB_NAME', dbName);
  envContent = updateEnvVar(envContent, 'DB_USER', dbUser);
  envContent = updateEnvVar(envContent, 'DB_PASSWORD', dbPassword);
  envContent = updateEnvVar(envContent, 'JWT_SECRET', jwtSecret);

  if (smtpHost) envContent = updateEnvVar(envContent, 'SMTP_HOST', smtpHost);
  if (smtpPort) envContent = updateEnvVar(envContent, 'SMTP_PORT', smtpPort);
  if (smtpUser) envContent = updateEnvVar(envContent, 'SMTP_USER', smtpUser);
  if (smtpPass) envContent = updateEnvVar(envContent, 'SMTP_PASS', smtpPass);
  if (emailFrom) envContent = updateEnvVar(envContent, 'EMAIL_FROM', emailFrom);

  if (mpToken) envContent = updateEnvVar(envContent, 'MERCADO_PAGO_ACCESS_TOKEN', mpToken);
  if (mpPublicKey) envContent = updateEnvVar(envContent, 'MERCADO_PAGO_PUBLIC_KEY', mpPublicKey);
  if (mpWebhook) envContent = updateEnvVar(envContent, 'MERCADO_PAGO_WEBHOOK_SECRET', mpWebhook);

  fs.writeFileSync(envPath, envContent);

  console.log('✅ Arquivo .env.local atualizado!');
  console.log('');
  console.log('========================================');
  console.log('CONFIGURAÇÃO CONCLUÍDA!');
  console.log('========================================');
  console.log('');
  console.log('📋 Próximos passos:');
  console.log('   1. Configure OAuth e outras integrações manualmente');
  console.log('   2. Veja GUIA_CONFIGURACAO_ENV_COMPLETO.md para mais detalhes');
  console.log('   3. Reinicie o servidor: npm run dev');
  console.log('');

  rl.close();
}

main().catch(console.error);

