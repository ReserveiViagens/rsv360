import http from 'node:http';
import { io as ioClient, type Socket as ClientSocket } from 'socket.io-client';
import { Server } from 'socket.io';
import request from 'supertest';
const { createApp } = require('../../../app');
const { registerPropostaChatSocket } = require('../../../../server/modules/propostas/websocket/proposta-chat.socket');
import { applyTestMigrations, hasDatabase } from '../../test/fase1-db-setup';
import { authHeader, signStaffToken } from '../../test/fase1-test-helpers';

const describeDb = hasDatabase() ? describe : describe.skip;

function waitForEvent<T>(socket: ClientSocket, event: string, timeoutMs = 8000): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`timeout waiting for ${event}`)), timeoutMs);
    socket.once(event, (payload: T) => {
      clearTimeout(timer);
      resolve(payload);
    });
    socket.once('error', (err: { message?: string }) => {
      clearTimeout(timer);
      reject(new Error(err?.message ?? 'socket error'));
    });
  });
}

describeDb('Propostas — WebSocket Chat HITL', () => {
  let app: any;
  let server: http.Server | undefined;
  let baseUrl: string;
  let propostaId: number;

  beforeAll(async () => {
    applyTestMigrations();
    app = await createApp();

    const created = await request(app)
      .post('/api/v1/propostas')
      .set(authHeader())
      .send({
        titulo: 'WS Test Proposta',
        clienteNome: 'Cliente WS',
        valorTotal: '900.00',
        status: 'sent',
        isPublica: true,
      });
    expect(created.status).toBe(201);
    propostaId = created.body.data.id;

    server = http.createServer(app);
    const io = new Server(server, { cors: { origin: '*' }, path: '/socket.io' });
    registerPropostaChatSocket(io);

    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', () => resolve());
    });
    const addr = server.address();
    const port = typeof addr === 'object' && addr ? addr.port : 0;
    baseUrl = `http://127.0.0.1:${port}`;
  });

  afterAll(async () => {
    if (server) {
      await new Promise<void>((resolve) => server!.close(() => resolve()));
    }
  });

  it('cliente entra na sala, envia mensagem e recebe histórico', async () => {
    const client = ioClient(`${baseUrl}/propostas`, {
      path: '/socket.io',
      transports: ['websocket'],
    });

    await new Promise<void>((resolve, reject) => {
      client.on('connect', () => resolve());
      client.on('connect_error', reject);
    });

    client.emit('join', { propostaId, guestName: 'Visitante Jest' });
    const joined = await waitForEvent<{ history?: unknown[] }>(client, 'joined');
    expect(joined.history).toBeDefined();

    client.emit('chat:message', {
      propostaId,
      message: 'Olá, tenho uma dúvida',
      senderType: 'client',
      senderName: 'Visitante Jest',
    });
    await waitForEvent<{ messageId?: number }>(client, 'chat:ack');
    client.disconnect();
  });

  it('agente faz takeover HITL via WebSocket', async () => {
    const agent = ioClient(`${baseUrl}/propostas`, {
      path: '/socket.io',
      transports: ['websocket'],
    });

    await new Promise<void>((resolve, reject) => {
      agent.on('connect', () => resolve());
      agent.on('connect_error', reject);
    });

    agent.emit('join', { propostaId, token: signStaffToken({ role: 'admin', name: 'Agente Jest' }) });
    await waitForEvent(agent, 'joined');

    agent.emit('hitl:takeover', { propostaId, token: signStaffToken({ role: 'admin', name: 'Agente Jest' }) });
    await waitForEvent(agent, 'hitl:state');
    agent.disconnect();
  });
});
