const fs = require('fs');
const path = require('path');

// Mapeamento de correções
const corrections = {
  '@/components/ui/Switch': '@/components/ui/switch',
  '@/components/ui/Separator': '@/components/ui/separator',
  '@/components/ui/Tabs': '@/components/ui/Tabs', // Manter maiúsculo
  '@/components/ui/Textarea': '@/components/ui/Textarea' // Manter maiúsculo
};

// Função para processar arquivo
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Aplicar correções
    for (const [oldImport, newImport] of Object.entries(corrections)) {
      if (content.includes(oldImport)) {
        content = content.replace(new RegExp(oldImport, 'g'), newImport);
        modified = true;
      }
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Corrigido: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Erro ao processar ${filePath}:`, error.message);
  }
}

// Função para percorrer diretórios recursivamente
function walkDir(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      walkDir(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      processFile(filePath);
    }
  });
}

// Executar correções
console.log('🔧 Iniciando correção de imports...');
walkDir('./src');
console.log('✅ Correção concluída!');
