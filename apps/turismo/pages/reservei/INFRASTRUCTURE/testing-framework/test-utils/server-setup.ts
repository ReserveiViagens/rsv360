import { spawn, ChildProcess } from 'child_process';
import axios from 'axios';

let testServer: ChildProcess | null = null;
const SERVER_PORT = process.env.TEST_SERVER_PORT || '3001';
const SERVER_URL = `http://localhost:${SERVER_PORT}`;

export async function setupTestServer() {
  console.log('🚀 Configurando servidor de teste...');
  
  try {
    // Iniciar servidor de teste
    await startTestServer();
    
    // Aguardar servidor estar pronto
    await waitForServerReady();
    
    console.log('✅ Servidor de teste configurado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao configurar servidor de teste:', error);
    throw error;
  }
}

export async function cleanupTestServer() {
  console.log('🧹 Parando servidor de teste...');
  
  try {
    if (testServer) {
      testServer.kill('SIGTERM');
      testServer = null;
      console.log('✅ Servidor de teste parado');
    }
  } catch (error) {
    console.error('❌ Erro ao parar servidor de teste:', error);
    throw error;
  }
}

async function startTestServer() {
  return new Promise<void>((resolve, reject) => {
    console.log(`🚀 Iniciando servidor de teste na porta ${SERVER_PORT}...`);
    
    // Configurar variáveis de ambiente para o servidor de teste
    const env = {
      ...process.env,
      NODE_ENV: 'test',
      PORT: SERVER_PORT,
      DB_NAME: 'rsv_ecosystem_test'
    };
    
    // Iniciar servidor usando o script de teste
    testServer = spawn('node', ['../start-ecosystem.js'], {
      env,
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: process.cwd()
    });
    
    let serverReady = false;
    
    testServer.stdout?.on('data', (data) => {
      const output = data.toString();
      console.log(`[TEST SERVER] ${output}`);
      
      if (output.includes('Server running on port') || output.includes('Ecosystem started')) {
        if (!serverReady) {
          serverReady = true;
          resolve();
        }
      }
    });
    
    testServer.stderr?.on('data', (data) => {
      const error = data.toString();
      console.error(`[TEST SERVER ERROR] ${error}`);
    });
    
    testServer.on('error', (error) => {
      console.error('❌ Erro ao iniciar servidor de teste:', error);
      reject(error);
    });
    
    testServer.on('exit', (code) => {
      if (code !== 0 && !serverReady) {
        reject(new Error(`Servidor de teste saiu com código ${code}`));
      }
    });
    
    // Timeout para evitar espera infinita
    setTimeout(() => {
      if (!serverReady) {
        reject(new Error('Timeout ao iniciar servidor de teste'));
      }
    }, 30000);
  });
}

async function waitForServerReady(maxAttempts = 30, delay = 1000) {
  console.log('⏳ Aguardando servidor de teste estar pronto...');
  
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await axios.get(`${SERVER_URL}/health`, {
        timeout: 2000
      });
      
      if (response.status === 200) {
        console.log('✅ Servidor de teste está pronto');
        return;
      }
    } catch (error) {
      if (i === maxAttempts - 1) {
        throw new Error('Servidor de teste não respondeu após todas as tentativas');
      }
      
      console.log(`⏳ Tentativa ${i + 1}/${maxAttempts} - Aguardando servidor...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

export { SERVER_URL, SERVER_PORT };
