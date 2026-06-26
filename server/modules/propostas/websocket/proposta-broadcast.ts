import type { Server } from 'socket.io';

let ioRef: Server | null = null;

export function setPropostaIo(io: Server): void {
  ioRef = io;
}

export function parceiroRoomName(parceiroId: string): string {
  return `parceiro:${parceiroId}`;
}

/** Broadcast no namespace /propostas, canal parceiro:<id> (Socket.IO). */
export function propostaBroadcast(
  parceiroId: string,
  event: string,
  payload: Record<string, unknown>,
): void {
  if (!ioRef) return;
  ioRef.of('/propostas').to(parceiroRoomName(parceiroId)).emit(event, payload);
}

module.exports = { setPropostaIo, propostaBroadcast, parceiroRoomName };
