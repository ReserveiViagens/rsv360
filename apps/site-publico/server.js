/**
 * ✅ SERVER CUSTOMIZADO PARA NEXT.JS COM WEBSOCKET
 * Servidor HTTP customizado que integra Next.js com Socket.io
 */

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Inicializar WebSocket (apenas em produção ou quando necessário)
  // Em desenvolvimento, Next.js pode não suportar WebSocket diretamente
  // Considere usar um servidor separado para WebSocket em produção
  if (process.env.ENABLE_WEBSOCKET === 'true') {
    try {
      // Importar dinamicamente para evitar erros se não compilado
      const wsModule = require('./lib/websocket-server');
      if (wsModule && wsModule.initializeWebSocket) {
        wsModule.initializeWebSocket(server);
        console.log('> ✅ WebSocket inicializado');
      }
    } catch (error) {
      console.warn('> ⚠️ WebSocket não disponível (pode precisar de build TypeScript):', error.message);
      console.warn('> 💡 Para habilitar WebSocket, configure ENABLE_WEBSOCKET=true e compile TypeScript');
    }
  }

  server
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> ✅ Servidor rodando em http://${hostname}:${port}`);
      console.log(`> ✅ WebSocket disponível em ws://${hostname}:${port}`);
    });
});

