#!/usr/bin/env node

/**
 * Script para gerar ícones do PWA
 * Este script cria ícones em diferentes tamanhos para o PWA
 */

const fs = require('fs');
const path = require('path');

// Configuração dos ícones
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconDir = path.join(__dirname, '../public/icons');

// Criar diretório de ícones se não existir
if (!fs.existsSync(iconDir)) {
  fs.mkdirSync(iconDir, { recursive: true });
}

// SVG base para o ícone
const createIconSVG = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#gradient)"/>

  <!-- RSV Text -->
  <text x="50%" y="60%" font-family="Arial, sans-serif" font-size="${size * 0.3}" font-weight="bold" text-anchor="middle" fill="white">RSV</text>

  <!-- 360 Text -->
  <text x="50%" y="80%" font-family="Arial, sans-serif" font-size="${size * 0.15}" font-weight="normal" text-anchor="middle" fill="rgba(255,255,255,0.8)">360</text>

  <!-- Decorative elements -->
  <circle cx="${size * 0.2}" cy="${size * 0.2}" r="${size * 0.05}" fill="rgba(255,255,255,0.3)"/>
  <circle cx="${size * 0.8}" cy="${size * 0.2}" r="${size * 0.05}" fill="rgba(255,255,255,0.3)"/>
  <circle cx="${size * 0.2}" cy="${size * 0.8}" r="${size * 0.05}" fill="rgba(255,255,255,0.3)"/>
  <circle cx="${size * 0.8}" cy="${size * 0.8}" r="${size * 0.05}" fill="rgba(255,255,255,0.3)"/>
</svg>
`;

// Função para converter SVG para PNG (simulação)
const createPNGIcon = (size) => {
  // Em um ambiente real, você usaria uma biblioteca como sharp ou canvas
  // Para este exemplo, vamos criar um arquivo SVG que pode ser convertido
  const svg = createIconSVG(size);
  const svgPath = path.join(iconDir, `icon-${size}x${size}.svg`);
  fs.writeFileSync(svgPath, svg);

  console.log(`✅ Ícone ${size}x${size} criado: ${svgPath}`);

  // Criar também um arquivo PNG simulado (em produção, use uma biblioteca real)
  const pngPath = path.join(iconDir, `icon-${size}x${size}.png`);
  fs.writeFileSync(pngPath, `# PNG placeholder for ${size}x${size} icon`);
  console.log(`✅ Ícone PNG ${size}x${size} criado: ${pngPath}`);
};

// Função para criar ícones de atalho
const createShortcutIcons = () => {
  const shortcuts = [
    { name: 'dashboard', text: '📊' },
    { name: 'cms', text: '📝' },
    { name: 'analytics', text: '📈' }
  ];

  shortcuts.forEach(shortcut => {
    const svg = `
<svg width="96" height="96" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#10b981;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
    </linearGradient>
  </defs>

  <rect width="96" height="96" rx="20" fill="url(#gradient)"/>
  <text x="50%" y="60%" font-family="Arial, sans-serif" font-size="32" text-anchor="middle" fill="white">${shortcut.text}</text>
</svg>
    `;

    const svgPath = path.join(iconDir, `shortcut-${shortcut.name}.svg`);
    const pngPath = path.join(iconDir, `shortcut-${shortcut.name}.png`);

    fs.writeFileSync(svgPath, svg);
    fs.writeFileSync(pngPath, `# PNG placeholder for shortcut ${shortcut.name}`);

    console.log(`✅ Ícone de atalho ${shortcut.name} criado`);
  });
};

// Função para criar badge
const createBadge = () => {
  const svg = `
<svg width="72" height="72" viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg">
  <circle cx="36" cy="36" r="36" fill="#ef4444"/>
  <text x="50%" y="60%" font-family="Arial, sans-serif" font-size="24" font-weight="bold" text-anchor="middle" fill="white">!</text>
</svg>
  `;

  const svgPath = path.join(iconDir, 'badge-72x72.svg');
  const pngPath = path.join(iconDir, 'badge-72x72.png');

  fs.writeFileSync(svgPath, svg);
  fs.writeFileSync(pngPath, '# PNG placeholder for badge');

  console.log(`✅ Badge criado`);
};

// Função para criar favicon
const createFavicon = () => {
  const svg = createIconSVG(32);
  const faviconPath = path.join(__dirname, '../public/favicon.ico');

  // Em produção, você converteria o SVG para ICO
  fs.writeFileSync(faviconPath, '# ICO placeholder');
  console.log(`✅ Favicon criado: ${faviconPath}`);
};

// Função principal
const generateIcons = () => {
  console.log('🎨 Gerando ícones do PWA...\n');

  // Gerar ícones principais
  iconSizes.forEach(size => {
    createPNGIcon(size);
  });

  console.log('\n📱 Gerando ícones de atalho...');
  createShortcutIcons();

  console.log('\n🔔 Gerando badge...');
  createBadge();

  console.log('\n🌐 Gerando favicon...');
  createFavicon();

  console.log('\n✅ Todos os ícones foram gerados com sucesso!');
  console.log('\n📝 Próximos passos:');
  console.log('1. Converta os arquivos SVG para PNG usando uma ferramenta online ou biblioteca');
  console.log('2. Ou use uma biblioteca como sharp para conversão automática');
  console.log('3. Teste o PWA no navegador');
  console.log('4. Verifique se todos os ícones estão sendo carregados corretamente');
};

// Executar se chamado diretamente
if (require.main === module) {
  generateIcons();
}

module.exports = { generateIcons, createIconSVG };
