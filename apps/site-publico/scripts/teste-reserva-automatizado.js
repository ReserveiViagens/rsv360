/**
 * Script de Teste Automatizado - Página de Reserva
 * 
 * Este script verifica:
 * 1. Se todos os imports estão corretos
 * 2. Se as funções necessárias existem
 * 3. Se o servidor está rodando
 * 4. Se não há erros de sintaxe
 */

const fs = require('fs');
const path = require('path');

console.log('========================================');
console.log('TESTE AUTOMATIZADO - PÁGINA DE RESERVA');
console.log('========================================\n');

const errors = [];
const warnings = [];
const success = [];

// 1. Verificar arquivo da página de reserva
const reservarPagePath = path.join(__dirname, '../app/reservar/[id]/page.tsx');
if (fs.existsSync(reservarPagePath)) {
  success.push('✓ Arquivo app/reservar/[id]/page.tsx existe');
  
  const content = fs.readFileSync(reservarPagePath, 'utf-8');
  
  // Verificar imports
  if (content.includes('useToast') && content.includes('@/components/providers/toast-wrapper')) {
    success.push('✓ Import useToast correto');
  } else {
    errors.push('✗ Import useToast incorreto ou ausente');
  }
  
  if (content.includes('formatCPFCNPJ') && content.includes('@/lib/validations')) {
    success.push('✓ Import formatCPFCNPJ correto');
  } else {
    errors.push('✗ Import formatCPFCNPJ incorreto ou ausente');
  }
  
  if (content.includes('LoadingSpinner') && content.includes('@/components/ui/loading-spinner')) {
    success.push('✓ Import LoadingSpinner correto');
  } else {
    warnings.push('⚠ Import LoadingSpinner pode estar incorreto');
  }
  
  if (content.includes('FadeIn') && content.includes('@/components/ui/fade-in')) {
    success.push('✓ Import FadeIn correto');
  } else {
    warnings.push('⚠ Import FadeIn pode estar incorreto');
  }
  
  // Verificar uso de useToast
  if (content.includes('const toast = useToast()')) {
    success.push('✓ useToast está sendo usado corretamente');
  } else {
    errors.push('✗ useToast não está sendo usado');
  }
  
  // Verificar uso de formatCPFCNPJ
  if (content.includes('formatCPFCNPJ(value)')) {
    success.push('✓ formatCPFCNPJ está sendo usado');
  } else {
    errors.push('✗ formatCPFCNPJ não está sendo usado');
  }
  
} else {
  errors.push('✗ Arquivo app/reservar/[id]/page.tsx não encontrado');
}

// 2. Verificar toast-wrapper
const toastWrapperPath = path.join(__dirname, '../components/providers/toast-wrapper.tsx');
if (fs.existsSync(toastWrapperPath)) {
  success.push('✓ Arquivo components/providers/toast-wrapper.tsx existe');
  
  const content = fs.readFileSync(toastWrapperPath, 'utf-8');
  
  // Verificar se não usa dynamic import
  if (!content.includes('dynamic(') || !content.includes('import(')) {
    success.push('✓ ToastWrapper não usa dynamic import (correto)');
  } else {
    warnings.push('⚠ ToastWrapper pode estar usando dynamic import desnecessariamente');
  }
  
  // Verificar export de useToast
  if (content.includes('export function useToast()')) {
    success.push('✓ useToast está exportado corretamente');
  } else {
    errors.push('✗ useToast não está exportado');
  }
} else {
  errors.push('✗ Arquivo components/providers/toast-wrapper.tsx não encontrado');
}

// 3. Verificar validations.ts
const validationsPath = path.join(__dirname, '../lib/validations.ts');
if (fs.existsSync(validationsPath)) {
  success.push('✓ Arquivo lib/validations.ts existe');
  
  const content = fs.readFileSync(validationsPath, 'utf-8');
  
  // Verificar função formatCPFCNPJ
  if (content.includes('export function formatCPFCNPJ')) {
    success.push('✓ Função formatCPFCNPJ existe e está exportada');
  } else {
    errors.push('✗ Função formatCPFCNPJ não encontrada');
  }
  
  // Verificar se usa formatCPF e formatCNPJ
  if (content.includes('formatCPF') && content.includes('formatCNPJ')) {
    success.push('✓ formatCPFCNPJ usa formatCPF e formatCNPJ');
  } else {
    warnings.push('⚠ formatCPFCNPJ pode não estar usando formatCPF/formatCNPJ');
  }
} else {
  errors.push('✗ Arquivo lib/validations.ts não encontrado');
}

// 4. Verificar layout.tsx
const layoutPath = path.join(__dirname, '../app/layout.tsx');
if (fs.existsSync(layoutPath)) {
  success.push('✓ Arquivo app/layout.tsx existe');
  
  const content = fs.readFileSync(layoutPath, 'utf-8');
  
  // Verificar se ToastWrapper está sendo usado
  if (content.includes('ToastWrapper') && content.includes('@/components/providers/toast-wrapper')) {
    success.push('✓ ToastWrapper está no layout.tsx');
  } else {
    errors.push('✗ ToastWrapper não está no layout.tsx');
  }
} else {
  errors.push('✗ Arquivo app/layout.tsx não encontrado');
}

// 5. Verificar se servidor está rodando (tentativa de conexão)
const http = require('http');
const testServer = () => {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:3000', { timeout: 2000 }, (res) => {
      resolve(true);
    });
    
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
  });
};

// Resultados
console.log('\n📊 RESULTADOS:\n');

if (success.length > 0) {
  console.log('✅ SUCESSOS:');
  success.forEach(msg => console.log(`  ${msg}`));
  console.log('');
}

if (warnings.length > 0) {
  console.log('⚠️  AVISOS:');
  warnings.forEach(msg => console.log(`  ${msg}`));
  console.log('');
}

if (errors.length > 0) {
  console.log('❌ ERROS:');
  errors.forEach(msg => console.log(`  ${msg}`));
  console.log('');
}

// Testar servidor
console.log('🔍 Verificando servidor...');
testServer().then(isRunning => {
  if (isRunning) {
    console.log('✅ Servidor está rodando em http://localhost:3000\n');
  } else {
    console.log('⚠️  Servidor não está respondendo em http://localhost:3000');
    console.log('   Execute: npm run dev\n');
  }
  
  // Resumo final
  console.log('========================================');
  console.log('RESUMO FINAL');
  console.log('========================================\n');
  console.log(`✅ Sucessos: ${success.length}`);
  console.log(`⚠️  Avisos: ${warnings.length}`);
  console.log(`❌ Erros: ${errors.length}\n`);
  
  if (errors.length === 0) {
    console.log('🎉 TUDO PRONTO PARA TESTE MANUAL!');
    console.log('\n📋 PRÓXIMOS PASSOS:');
    console.log('1. Acesse: http://localhost:3000/hoteis');
    console.log('2. Clique em um hotel');
    console.log('3. Selecione datas e hóspedes');
    console.log('4. Clique em "Reservar"');
    console.log('5. Digite CPF no formulário');
    console.log('6. Avance no formulário');
    console.log('7. Abra DevTools (F12) e verifique console');
    console.log('8. Teste os toasts\n');
  } else {
    console.log('❌ CORRIJA OS ERROS ANTES DE TESTAR!\n');
    process.exit(1);
  }
});

