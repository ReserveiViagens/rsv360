require('dotenv').config({ path: '.env.local' });

async function testarOAuth() {
  console.log("========================================");
  console.log("TESTE: OAUTH SOCIAL (Google/Facebook)");
  console.log("========================================");
  console.log("");

  // Verificar configuração Google
  const googleConfigurado = !!(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET
  );

  // Verificar configuração Facebook
  const facebookConfigurado = !!(
    process.env.FACEBOOK_APP_ID &&
    process.env.FACEBOOK_APP_SECRET
  );

  console.log("1. Verificando configuração Google OAuth...");
  if (googleConfigurado) {
    console.log("✅ Google OAuth configurado!");
    console.log(`   Client ID: ${process.env.GOOGLE_CLIENT_ID.substring(0, 20)}...`);
    console.log(`   Redirect URI: ${process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback'}`);
  } else {
    console.log("⚠️  Google OAuth não configurado");
    console.log("   Configure no .env.local:");
    console.log("     GOOGLE_CLIENT_ID=...");
    console.log("     GOOGLE_CLIENT_SECRET=...");
    console.log("     GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback");
  }
  console.log("");

  console.log("2. Verificando configuração Facebook OAuth...");
  if (facebookConfigurado) {
    console.log("✅ Facebook OAuth configurado!");
    console.log(`   App ID: ${process.env.FACEBOOK_APP_ID.substring(0, 20)}...`);
    console.log(`   Redirect URI: ${process.env.FACEBOOK_REDIRECT_URI || 'http://localhost:3000/api/auth/facebook/callback'}`);
  } else {
    console.log("⚠️  Facebook OAuth não configurado");
    console.log("   Configure no .env.local:");
    console.log("     FACEBOOK_APP_ID=...");
    console.log("     FACEBOOK_APP_SECRET=...");
    console.log("     FACEBOOK_REDIRECT_URI=http://localhost:3000/api/auth/facebook/callback");
  }
  console.log("");

  console.log("3. Testando URLs de autorização...");
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  if (googleConfigurado) {
    const googleAuthUrl = `${baseUrl}/api/auth/google`;
    console.log(`   Google: ${googleAuthUrl}`);
    console.log(`   ✅ Acesse esta URL para testar login com Google`);
  }

  if (facebookConfigurado) {
    const facebookAuthUrl = `${baseUrl}/api/auth/facebook`;
    console.log(`   Facebook: ${facebookAuthUrl}`);
    console.log(`   ✅ Acesse esta URL para testar login com Facebook`);
  }
  console.log("");

  console.log("4. Verificando campos OAuth no banco...");
  try {
    const { Pool } = require('pg');
    const pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'onboarding_rsv_db',
      user: process.env.DB_USER || 'onboarding_rsv',
      password: process.env.DB_PASSWORD || 'senha_segura_123',
    });

    const result = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'users'
      AND column_name IN ('oauth_provider', 'oauth_id', 'oauth_email')
    `);

    if (result.rows.length === 3) {
      console.log("✅ Campos OAuth encontrados no banco:");
      result.rows.forEach(row => {
        console.log(`   - ${row.column_name}`);
      });
    } else {
      console.log("⚠️  Campos OAuth não encontrados no banco");
      console.log("   Execute: node scripts/executar-oauth-fields.js");
    }

    await pool.end();
  } catch (error) {
    console.log("⚠️  Erro ao verificar banco:", error.message);
  }
  console.log("");

  console.log("========================================");
  console.log("TESTE DE OAUTH CONCLUÍDO");
  console.log("========================================");
  console.log("");
  console.log("📖 Para testar OAuth:");
  console.log("   1. Configure as credenciais no .env.local");
  console.log("   2. Acesse http://localhost:3000/login");
  console.log("   3. Clique em 'Entrar com Google' ou 'Entrar com Facebook'");
  console.log("   4. Complete o fluxo de autorização");
}

testarOAuth().catch(console.error);

