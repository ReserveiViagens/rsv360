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

async function configurarIntegracao() {
  console.log('========================================');
  console.log('CONFIGURAÇÃO DE INTEGRAÇÕES');
  console.log('========================================');
  console.log('');
  console.log('Este script vai ajudar você a configurar:');
  console.log('  1. SMTP (Email)');
  console.log('  2. Mercado Pago');
  console.log('  3. OAuth (Google/Facebook)');
  console.log('  4. Google Maps');
  console.log('');

  const envPath = path.join(__dirname, '../.env.local');
  let envContent = '';

  // Ler .env.local se existir
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  } else {
    // Ler env.example como base
    const examplePath = path.join(__dirname, '../env.example');
    if (fs.existsSync(examplePath)) {
      envContent = fs.readFileSync(examplePath, 'utf8');
    }
  }

  console.log('📧 CONFIGURAÇÃO SMTP (Email)');
  console.log('----------------------------------------');
  const configurarSMTP = await question('Deseja configurar SMTP? (s/n): ');
  
  if (configurarSMTP.toLowerCase() === 's') {
    const smtpHost = await question('SMTP Host (ex: smtp.gmail.com): ') || 'smtp.gmail.com';
    const smtpPort = await question('SMTP Port (ex: 587): ') || '587';
    const smtpUser = await question('SMTP User (seu email): ');
    const smtpPass = await question('SMTP Password (senha de app): ');
    const emailFrom = await question('Email From (ex: noreply@rsv360.com): ') || 'noreply@rsv360.com';

    envContent = atualizarVariavel(envContent, 'SMTP_HOST', smtpHost);
    envContent = atualizarVariavel(envContent, 'SMTP_PORT', smtpPort);
    envContent = atualizarVariavel(envContent, 'SMTP_USER', smtpUser);
    envContent = atualizarVariavel(envContent, 'SMTP_PASS', smtpPass);
    envContent = atualizarVariavel(envContent, 'EMAIL_FROM', emailFrom);
    
    console.log('✅ SMTP configurado!');
  }
  console.log('');

  console.log('💳 CONFIGURAÇÃO MERCADO PAGO');
  console.log('----------------------------------------');
  const configurarMP = await question('Deseja configurar Mercado Pago? (s/n): ');
  
  if (configurarMP.toLowerCase() === 's') {
    console.log('');
    console.log('📖 Como obter as credenciais:');
    console.log('  1. Acesse: https://www.mercadopago.com.br/developers');
    console.log('  2. Crie uma aplicação');
    console.log('  3. Copie o Access Token e Public Key');
    console.log('');
    
    const mpToken = await question('Mercado Pago Access Token: ');
    const mpPublicKey = await question('Mercado Pago Public Key: ');
    const mpWebhookSecret = await question('Mercado Pago Webhook Secret (opcional): ') || '';

    envContent = atualizarVariavel(envContent, 'MERCADO_PAGO_ACCESS_TOKEN', mpToken);
    envContent = atualizarVariavel(envContent, 'MERCADO_PAGO_PUBLIC_KEY', mpPublicKey);
    if (mpWebhookSecret) {
      envContent = atualizarVariavel(envContent, 'MERCADO_PAGO_WEBHOOK_SECRET', mpWebhookSecret);
    }
    
    console.log('✅ Mercado Pago configurado!');
  }
  console.log('');

  console.log('🔐 CONFIGURAÇÃO OAUTH GOOGLE');
  console.log('----------------------------------------');
  const configurarGoogle = await question('Deseja configurar OAuth Google? (s/n): ');
  
  if (configurarGoogle.toLowerCase() === 's') {
    console.log('');
    console.log('📖 Como obter as credenciais:');
    console.log('  1. Acesse: https://console.cloud.google.com');
    console.log('  2. Crie um projeto');
    console.log('  3. Ative "Google+ API"');
    console.log('  4. Crie credenciais OAuth 2.0');
    console.log('  5. Adicione URI: http://localhost:3000/api/auth/google/callback');
    console.log('');
    
    const googleClientId = await question('Google Client ID: ');
    const googleClientSecret = await question('Google Client Secret: ');
    const googleRedirect = await question('Redirect URI (Enter para padrão): ') || 'http://localhost:3000/api/auth/google/callback';

    envContent = atualizarVariavel(envContent, 'GOOGLE_CLIENT_ID', googleClientId);
    envContent = atualizarVariavel(envContent, 'GOOGLE_CLIENT_SECRET', googleClientSecret);
    envContent = atualizarVariavel(envContent, 'GOOGLE_REDIRECT_URI', googleRedirect);
    
    console.log('✅ OAuth Google configurado!');
  }
  console.log('');

  console.log('📘 CONFIGURAÇÃO OAUTH FACEBOOK');
  console.log('----------------------------------------');
  const configurarFacebook = await question('Deseja configurar OAuth Facebook? (s/n): ');
  
  if (configurarFacebook.toLowerCase() === 's') {
    console.log('');
    console.log('📖 Como obter as credenciais:');
    console.log('  1. Acesse: https://developers.facebook.com');
    console.log('  2. Crie um app');
    console.log('  3. Adicione produto "Facebook Login"');
    console.log('  4. Configure URLs de redirecionamento');
    console.log('');
    
    const fbAppId = await question('Facebook App ID: ');
    const fbAppSecret = await question('Facebook App Secret: ');
    const fbRedirect = await question('Redirect URI (Enter para padrão): ') || 'http://localhost:3000/api/auth/facebook/callback';

    envContent = atualizarVariavel(envContent, 'FACEBOOK_APP_ID', fbAppId);
    envContent = atualizarVariavel(envContent, 'FACEBOOK_APP_SECRET', fbAppSecret);
    envContent = atualizarVariavel(envContent, 'FACEBOOK_REDIRECT_URI', fbRedirect);
    
    console.log('✅ OAuth Facebook configurado!');
  }
  console.log('');

  console.log('🗺️  CONFIGURAÇÃO GOOGLE MAPS');
  console.log('----------------------------------------');
  const configurarMaps = await question('Deseja configurar Google Maps? (s/n): ');
  
  if (configurarMaps.toLowerCase() === 's') {
    console.log('');
    console.log('📖 Como obter a chave:');
    console.log('  1. Acesse: https://console.cloud.google.com');
    console.log('  2. Ative "Maps JavaScript API"');
    console.log('  3. Crie uma chave de API');
    console.log('');
    
    const mapsKey = await question('Google Maps API Key: ');

    envContent = atualizarVariavel(envContent, 'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY', mapsKey);
    
    console.log('✅ Google Maps configurado!');
  }
  console.log('');

  // Salvar .env.local
  fs.writeFileSync(envPath, envContent, 'utf8');
  
  console.log('========================================');
  console.log('✅ CONFIGURAÇÃO CONCLUÍDA!');
  console.log('========================================');
  console.log('');
  console.log('📝 Arquivo .env.local atualizado!');
  console.log('');
  console.log('⚠️  IMPORTANTE:');
  console.log('   - Reinicie o servidor para aplicar as mudanças');
  console.log('   - npm run dev');
  console.log('');

  rl.close();
}

function atualizarVariavel(content, key, value) {
  const regex = new RegExp(`^${key}=.*$`, 'm');
  if (regex.test(content)) {
    return content.replace(regex, `${key}=${value}`);
  } else {
    return content + `\n${key}=${value}`;
  }
}

configurarIntegracao().catch(console.error);

