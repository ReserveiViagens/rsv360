import type { Server as HTTPServer } from 'http';

export interface SocketUser {
  userId: number;
  email: string;
  name: string;
  role: string;
  socketId: string;
}

let webSocketServer: HTTPServer | null = null;
const onlineUsers: SocketUser[] = [];

export function initializeWebSocket(server: HTTPServer): HTTPServer {
  webSocketServer = server;
  return server;
}

export const initializeWebSocketServer = initializeWebSocket;

export function getWebSocketServer(): HTTPServer | null {
  return webSocketServer;
}

export function getOnlineUsers(): SocketUser[] {
  return onlineUsers.slice();
}

export function setOnlineUsers(users: SocketUser[]) {
  onlineUsers.splice(0, onlineUsers.length, ...users);
}

export function sendNotificationToUser(_userId: number, _payload: unknown) {
  return false;
}

export function sendNotificationToRole(_role: string, _payload: unknown) {
  return false;
}

export function emitBookingUpdate(_bookingId: number, _payload: unknown) {
  return false;
}

export function sendChatMessage(_chatId: number, _payload: unknown) {
  return false;
}
