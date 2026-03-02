#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Cores para output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    log(`🚀 Executando: ${command} ${args.join(' ')}`, 'cyan');
    
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(new Error(`Comando falhou com código ${code}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

async function checkPrerequisites() {
  log('🔍 Verificando pré-requisitos...', 'yellow');
  
  // Verificar se Node.js está instalado
  try {
    await runCommand('node', ['--version']);
    log('✅ Node.js encontrado', 'green');
  } catch (error) {
    log('❌ Node.js não encontrado. Instale Node.js 18+ para continuar.', 'red');
    process.exit(1);
  }

  // Verificar se npm está instalado
  try {
    await runCommand('npm', ['--version']);
    log('✅ npm encontrado', 'green');
  } catch (error) {
    log('❌ npm não encontrado. Instale npm para continuar.', 'red');
    process.exit(1);
  }

  // Verificar se as dependências estão instaladas
  if (!fs.existsSync('node_modules')) {
    log('📦 Instalando dependências...', 'yellow');
    try {
      await runCommand('npm', ['install']);
      log('✅ Dependências instaladas', 'green');
    } catch (error) {
      log('❌ Erro ao instalar dependências:', 'red');
      console.error(error);
      process.exit(1);
    }
  } else {
    log('✅ Dependências já instaladas', 'green');
  }
}

async function setupTestEnvironment() {
  log('🔧 Configurando ambiente de teste...', 'yellow');
  
  // Copiar arquivo de ambiente de exemplo se não existir
  if (!fs.existsSync('.env.test')) {
    if (fs.existsSync('env.test.example')) {
      fs.copyFileSync('env.test.example', '.env.test');
      log('✅ Arquivo .env.test criado', 'green');
    }
  }

  // Verificar se o banco de dados está rodando
  try {
    await runCommand('pg_isready', ['-h', 'localhost', '-p', '5432']);
    log('✅ Banco de dados PostgreSQL está rodando', 'green');
  } catch (error) {
    log('⚠️ Banco de dados PostgreSQL não está rodando. Iniciando com Docker...', 'yellow');
    try {
      await runCommand('docker-compose', ['-f', '../database-cluster/docker-compose.databases.yml', 'up', '-d']);
      log('✅ Banco de dados iniciado com Docker', 'green');
    } catch (dockerError) {
      log('❌ Erro ao iniciar banco de dados:', 'red');
      console.error(dockerError);
      process.exit(1);
    }
  }
}

async function runUnitTests() {
  log('🧪 Executando testes unitários...', 'blue');
  try {
    await runCommand('npm', ['run', 'test:unit']);
    log('✅ Testes unitários concluídos com sucesso', 'green');
    return true;
  } catch (error) {
    log('❌ Testes unitários falharam', 'red');
    return false;
  }
}

async function runIntegrationTests() {
  log('🔗 Executando testes de integração...', 'blue');
  try {
    await runCommand('npm', ['run', 'test:integration']);
    log('✅ Testes de integração concluídos com sucesso', 'green');
    return true;
  } catch (error) {
    log('❌ Testes de integração falharam', 'red');
    return false;
  }
}

async function runE2ETests() {
  log('🎭 Executando testes end-to-end...', 'blue');
  try {
    // Instalar dependências do Playwright se necessário
    try {
      await runCommand('npx', ['playwright', 'install', '--with-deps']);
    } catch (error) {
      log('⚠️ Erro ao instalar Playwright, continuando...', 'yellow');
    }

    await runCommand('npm', ['run', 'test:e2e']);
    log('✅ Testes end-to-end concluídos com sucesso', 'green');
    return true;
  } catch (error) {
    log('❌ Testes end-to-end falharam', 'red');
    return false;
  }
}

async function generateCoverageReport() {
  log('📊 Gerando relatório de cobertura...', 'blue');
  try {
    await runCommand('npm', ['run', 'test:coverage']);
    log('✅ Relatório de cobertura gerado', 'green');
    return true;
  } catch (error) {
    log('❌ Erro ao gerar relatório de cobertura', 'red');
    return false;
  }
}

async function cleanup() {
  log('🧹 Limpando ambiente de teste...', 'yellow');
  
  // Parar containers Docker se estiverem rodando
  try {
    await runCommand('docker-compose', ['-f', '../database-cluster/docker-compose.databases.yml', 'down']);
    log('✅ Containers Docker parados', 'green');
  } catch (error) {
    // Ignorar erros de limpeza
  }
}

async function main() {
  const args = process.argv.slice(2);
  const testType = args[0] || 'all';
  
  log('🎯 RSV 360° Ecosystem - Framework de Testes', 'bright');
  log('==========================================', 'bright');
  
  try {
    // Verificar pré-requisitos
    await checkPrerequisites();
    
    // Configurar ambiente
    await setupTestEnvironment();
    
    let allTestsPassed = true;
    
    // Executar testes baseado no tipo especificado
    switch (testType) {
      case 'unit':
        allTestsPassed = await runUnitTests();
        break;
        
      case 'integration':
        allTestsPassed = await runIntegrationTests();
        break;
        
      case 'e2e':
        allTestsPassed = await runE2ETests();
        break;
        
      case 'coverage':
        allTestsPassed = await generateCoverageReport();
        break;
        
      case 'all':
      default:
        log('🚀 Executando todos os testes...', 'magenta');
        
        const unitPassed = await runUnitTests();
        const integrationPassed = await runIntegrationTests();
        const e2ePassed = await runE2ETests();
        const coveragePassed = await generateCoverageReport();
        
        allTestsPassed = unitPassed && integrationPassed && e2ePassed && coveragePassed;
        break;
    }
    
    // Resultado final
    if (allTestsPassed) {
      log('🎉 Todos os testes passaram com sucesso!', 'green');
      log('✅ RSV 360° Ecosystem está funcionando corretamente', 'green');
    } else {
      log('❌ Alguns testes falharam. Verifique os logs acima.', 'red');
      process.exit(1);
    }
    
  } catch (error) {
    log('💥 Erro durante a execução dos testes:', 'red');
    console.error(error);
    process.exit(1);
  } finally {
    // Limpeza final
    if (args.includes('--cleanup') || testType === 'all') {
      await cleanup();
    }
  }
}

// Tratamento de sinais para limpeza adequada
process.on('SIGINT', async () => {
  log('\n🛑 Interrompendo testes...', 'yellow');
  await cleanup();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  log('\n🛑 Terminando testes...', 'yellow');
  await cleanup();
  process.exit(0);
});

// Executar script principal
if (require.main === module) {
  main().catch((error) => {
    log('💥 Erro fatal:', 'red');
    console.error(error);
    process.exit(1);
  });
}

module.exports = {
  runUnitTests,
  runIntegrationTests,
  runE2ETests,
  generateCoverageReport,
  setupTestEnvironment,
  cleanup
};
