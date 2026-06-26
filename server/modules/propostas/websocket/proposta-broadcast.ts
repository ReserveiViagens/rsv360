import type { Server } from 'socket.io';

let ioRef: Server | null = null;

export function setPropostaIo(io: Server): void {
  ioRef = io;
}

export function parceiroRoomName(parceiroId: string): string {
  return `parceiro:${parceiroId}`;
}

export function propostaRoomName(propostaId: number | string): string {
  return `proposta:${propostaId}`;
}

/** Broadcast no namespace /propostas, sala proposta:<id>. */
export function propostaRoomBroadcast(
  propostaId: number | string,
  event: string,
  payload: Record<string, unknown>,
): void {
  if (!ioRef) return;
  ioRef.of('/propostas').to(propostaRoomName(propostaId)).emit(event, payload);
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

module.exports = {
  setPropostaIo,
  propostaBroadcast,
  propostaRoomBroadcast,
  parceiroRoomName,
  propostaRoomName,
};
