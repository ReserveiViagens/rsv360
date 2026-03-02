require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');

async function testarServiceWorker() {
  console.log("========================================");
  console.log("TESTE: SERVICE WORKER (PWA)");
  console.log("========================================");
  console.log("");

  console.log("1. Verificando arquivo Service Worker...");
  const swPath = path.join(__dirname, '..', 'public', 'sw.js');
  if (fs.existsSync(swPath)) {
    console.log("✅ Service Worker encontrado: public/sw.js");
    const swContent = fs.readFileSync(swPath, 'utf-8');
    console.log(`   Tamanho: ${swContent.length} caracteres`);
    console.log(`   Versão do cache: ${swContent.match(/CACHE_VERSION\s*=\s*['"]([^'"]+)['"]/)?.[1] || 'N/A'}`);
  } else {
    console.log("❌ Service Worker não encontrado!");
  }
  console.log("");

  console.log("2. Verificando manifest.json...");
  const manifestPath = path.join(__dirname, '..', 'public', 'manifest.json');
  if (fs.existsSync(manifestPath)) {
    console.log("✅ Manifest encontrado: public/manifest.json");
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    console.log(`   Nome: ${manifest.name || 'N/A'}`);
    console.log(`   Short Name: ${manifest.short_name || 'N/A'}`);
    console.log(`   Start URL: ${manifest.start_url || 'N/A'}`);
  } else {
    console.log("❌ Manifest não encontrado!");
  }
  console.log("");

  console.log("3. Verificando componente PwaRegister...");
  const pwaRegisterPath = path.join(__dirname, '..', 'components', 'pwa-register.tsx');
  if (fs.existsSync(pwaRegisterPath)) {
    console.log("✅ Componente PwaRegister encontrado");
  } else {
    console.log("❌ Componente PwaRegister não encontrado!");
  }
  console.log("");

  console.log("4. Verificando integração no layout...");
  const layoutPath = path.join(__dirname, '..', 'app', 'layout.tsx');
  if (fs.existsSync(layoutPath)) {
    const layoutContent = fs.readFileSync(layoutPath, 'utf-8');
    if (layoutContent.includes('PwaRegister')) {
      console.log("✅ PwaRegister integrado no layout.tsx");
    } else {
      console.log("⚠️  PwaRegister não encontrado no layout.tsx");
    }
  }
  console.log("");

  console.log("========================================");
  console.log("TESTE DE SERVICE WORKER CONCLUÍDO");
  console.log("========================================");
  console.log("");
  console.log("📖 Para testar o Service Worker:");
  console.log("   1. Inicie o servidor: npm run dev");
  console.log("   2. Acesse http://localhost:3000");
  console.log("   3. Abra DevTools > Application > Service Workers");
  console.log("   4. Verifique se o Service Worker está registrado");
  console.log("   5. Teste modo offline (Network > Offline)");
  console.log("   6. Verifique se aparece notificação de atualização");
  console.log("");
  console.log("📱 Para instalar como PWA:");
  console.log("   - Chrome/Edge: Menu > Instalar app");
  console.log("   - Mobile: Adicionar à tela inicial");
}

testarServiceWorker().catch(console.error);

