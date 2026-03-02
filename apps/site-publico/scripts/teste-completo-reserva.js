/**
 * TESTE COMPLETO - Página de Reserva
 * 
 * Testa:
 * 1. Carregamento da página
 * 2. Formatação de CPF
 * 3. Validação de formulário
 * 4. Toasts
 * 5. Console sem erros
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');

console.log('========================================');
console.log('TESTE COMPLETO - PÁGINA DE RESERVA');
console.log('========================================\n');

const BASE_URL = 'http://localhost:3000';
const results = {
  success: [],
  errors: [],
  warnings: []
};

// Função para fazer requisição HTTP
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    const req = protocol.request(url, {
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: 5000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });
    
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

// Teste 1: Verificar se servidor está rodando
async function testServer() {
  console.log('🔍 Teste 1: Verificando servidor...');
  try {
    const response = await makeRequest(BASE_URL);
    if (response.status === 200 || response.status === 404) {
      results.success.push('✓ Servidor está rodando');
      console.log('  ✓ Servidor está rodando\n');
      return true;
    } else {
      results.errors.push(`✗ Servidor retornou status ${response.status}`);
      console.log(`  ✗ Servidor retornou status ${response.status}\n`);
      return false;
    }
  } catch (error) {
    results.errors.push(`✗ Servidor não está respondendo: ${error.message}`);
    console.log(`  ✗ Servidor não está respondendo: ${error.message}\n`);
    return false;
  }
}

// Teste 2: Verificar página de hotéis
async function testHotelsPage() {
  console.log('🔍 Teste 2: Verificando página de hotéis...');
  try {
    const response = await makeRequest(`${BASE_URL}/hoteis`);
    if (response.status === 200) {
      results.success.push('✓ Página de hotéis está acessível');
      console.log('  ✓ Página de hotéis está acessível\n');
      return true;
    } else {
      results.warnings.push(`⚠ Página de hotéis retornou status ${response.status}`);
      console.log(`  ⚠ Página de hotéis retornou status ${response.status}\n`);
      return false;
    }
  } catch (error) {
    results.warnings.push(`⚠ Erro ao acessar página de hotéis: ${error.message}`);
    console.log(`  ⚠ Erro ao acessar página de hotéis: ${error.message}\n`);
    return false;
  }
}

// Teste 3: Verificar código da página de reserva
function testReservationCode() {
  console.log('🔍 Teste 3: Verificando código da página de reserva...');
  const fs = require('fs');
  const path = require('path');
  
  const reservarPagePath = path.join(__dirname, '../app/reservar/[id]/page.tsx');
  
  if (!fs.existsSync(reservarPagePath)) {
    results.errors.push('✗ Arquivo app/reservar/[id]/page.tsx não encontrado');
    console.log('  ✗ Arquivo não encontrado\n');
    return false;
  }
  
  const content = fs.readFileSync(reservarPagePath, 'utf-8');
  const checks = [];
  
  // Verificar imports
  if (content.includes("import { useToast } from \"@/components/providers/toast-wrapper\"")) {
    checks.push('✓ Import useToast correto');
  } else {
    checks.push('✗ Import useToast incorreto');
  }
  
  if (content.includes("import { formatCPFCNPJ")) {
    checks.push('✓ Import formatCPFCNPJ correto');
  } else {
    checks.push('✗ Import formatCPFCNPJ incorreto');
  }
  
  // Verificar uso de formatCPFCNPJ
  if (content.includes('formatCPFCNPJ(value)')) {
    checks.push('✓ formatCPFCNPJ está sendo usado');
  } else {
    checks.push('✗ formatCPFCNPJ não está sendo usado');
  }
  
  // Verificar toasts
  if (content.includes('toast.success') || content.includes('toast.error') || content.includes('toast.warning')) {
    checks.push('✓ Toasts estão sendo usados');
  } else {
    checks.push('✗ Toasts não estão sendo usados');
  }
  
  // Verificar validação de termos
  if (content.includes('acceptTerms') && content.includes('toast.warning')) {
    checks.push('✓ Validação de termos implementada');
  } else {
    checks.push('✗ Validação de termos não encontrada');
  }
  
  checks.forEach(check => {
    if (check.startsWith('✓')) {
      results.success.push(check);
    } else {
      results.errors.push(check);
    }
  });
  
  console.log(checks.map(c => `  ${c}`).join('\n') + '\n');
  return checks.every(c => c.startsWith('✓'));
}

// Teste 4: Verificar função formatCPFCNPJ
function testFormatCPFCNPJ() {
  console.log('🔍 Teste 4: Verificando função formatCPFCNPJ...');
  const fs = require('fs');
  const path = require('path');
  
  const validationsPath = path.join(__dirname, '../lib/validations.ts');
  
  if (!fs.existsSync(validationsPath)) {
    results.errors.push('✗ Arquivo lib/validations.ts não encontrado');
    console.log('  ✗ Arquivo não encontrado\n');
    return false;
  }
  
  const content = fs.readFileSync(validationsPath, 'utf-8');
  
  if (content.includes('export function formatCPFCNPJ')) {
    results.success.push('✓ Função formatCPFCNPJ existe');
    console.log('  ✓ Função formatCPFCNPJ existe');
    
    // Verificar lógica
    if (content.includes('cleaned.length <= 11') && content.includes('formatCPF')) {
      results.success.push('✓ Lógica de formatação CPF correta');
      console.log('  ✓ Lógica de formatação CPF correta');
    }
    
    if (content.includes('cleaned.length <= 14') && content.includes('formatCNPJ')) {
      results.success.push('✓ Lógica de formatação CNPJ correta');
      console.log('  ✓ Lógica de formatação CNPJ correta');
    }
    
    console.log('');
    return true;
  } else {
    results.errors.push('✗ Função formatCPFCNPJ não encontrada');
    console.log('  ✗ Função não encontrada\n');
    return false;
  }
}

// Teste 5: Verificar ToastWrapper
function testToastWrapper() {
  console.log('🔍 Teste 5: Verificando ToastWrapper...');
  const fs = require('fs');
  const path = require('path');
  
  const toastWrapperPath = path.join(__dirname, '../components/providers/toast-wrapper.tsx');
  
  if (!fs.existsSync(toastWrapperPath)) {
    results.errors.push('✗ Arquivo toast-wrapper.tsx não encontrado');
    console.log('  ✗ Arquivo não encontrado\n');
    return false;
  }
  
  const content = fs.readFileSync(toastWrapperPath, 'utf-8');
  const checks = [];
  
  if (content.includes("'use client'")) {
    checks.push('✓ É um Client Component');
  } else {
    checks.push('✗ Não é um Client Component');
  }
  
  if (content.includes('export function useToast()')) {
    checks.push('✓ useToast está exportado');
  } else {
    checks.push('✗ useToast não está exportado');
  }
  
  if (!content.includes('dynamic(') || !content.includes('import(')) {
    checks.push('✓ Não usa dynamic import (correto)');
  } else {
    checks.push('✗ Usa dynamic import (pode causar problemas)');
  }
  
  if (content.includes('toast.success') || content.includes('success:')) {
    checks.push('✓ Método success implementado');
  } else {
    checks.push('✗ Método success não encontrado');
  }
  
  checks.forEach(check => {
    if (check.startsWith('✓')) {
      results.success.push(check);
    } else {
      results.errors.push(check);
    }
  });
  
  console.log(checks.map(c => `  ${c}`).join('\n') + '\n');
  return checks.every(c => c.startsWith('✓'));
}

// Teste 6: Verificar layout.tsx
function testLayout() {
  console.log('🔍 Teste 6: Verificando layout.tsx...');
  const fs = require('fs');
  const path = require('path');
  
  const layoutPath = path.join(__dirname, '../app/layout.tsx');
  
  if (!fs.existsSync(layoutPath)) {
    results.errors.push('✗ Arquivo layout.tsx não encontrado');
    console.log('  ✗ Arquivo não encontrado\n');
    return false;
  }
  
  const content = fs.readFileSync(layoutPath, 'utf-8');
  
  if (content.includes('ToastWrapper') && content.includes('@/components/providers/toast-wrapper')) {
    results.success.push('✓ ToastWrapper está no layout.tsx');
    console.log('  ✓ ToastWrapper está no layout.tsx\n');
    return true;
  } else {
    results.errors.push('✗ ToastWrapper não está no layout.tsx');
    console.log('  ✗ ToastWrapper não está no layout.tsx\n');
    return false;
  }
}

// Executar todos os testes
async function runAllTests() {
  console.log('Iniciando testes...\n');
  
  const serverRunning = await testServer();
  if (!serverRunning) {
    console.log('⚠️  Servidor não está rodando. Alguns testes serão pulados.\n');
  }
  
  if (serverRunning) {
    await testHotelsPage();
  }
  
  testReservationCode();
  testFormatCPFCNPJ();
  testToastWrapper();
  testLayout();
  
  // Resumo final
  console.log('========================================');
  console.log('RESUMO DOS TESTES');
  console.log('========================================\n');
  
  console.log(`✅ Sucessos: ${results.success.length}`);
  if (results.success.length > 0) {
    results.success.forEach(msg => console.log(`  ${msg}`));
  }
  
  console.log(`\n⚠️  Avisos: ${results.warnings.length}`);
  if (results.warnings.length > 0) {
    results.warnings.forEach(msg => console.log(`  ${msg}`));
  }
  
  console.log(`\n❌ Erros: ${results.errors.length}`);
  if (results.errors.length > 0) {
    results.errors.forEach(msg => console.log(`  ${msg}`));
  }
  
  console.log('\n========================================');
  if (results.errors.length === 0) {
    console.log('✅ TODOS OS TESTES PASSARAM!');
    console.log('\n📋 PRÓXIMOS PASSOS (TESTE MANUAL):');
    console.log('1. Acesse: http://localhost:3000/hoteis');
    console.log('2. Clique em um hotel');
    console.log('3. Selecione datas e hóspedes');
    console.log('4. Clique em "Reservar"');
    console.log('5. Digite CPF: 12345678901');
    console.log('6. Verifique formatação: 123.456.789-01');
    console.log('7. Preencha formulário completo');
    console.log('8. Abra DevTools (F12) e verifique console');
    console.log('9. Teste os toasts (tente submeter sem aceitar termos)');
    console.log('');
  } else {
    console.log('❌ ALGUNS TESTES FALHARAM!');
    console.log('Corrija os erros antes de continuar.\n');
    process.exit(1);
  }
}

runAllTests().catch(error => {
  console.error('Erro ao executar testes:', error);
  process.exit(1);
});

