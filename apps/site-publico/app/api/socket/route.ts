/**
 * ✅ API ROUTE: WebSocket Health Check
 * Endpoint para verificar status do WebSocket
 */

import { NextRequest, NextResponse } from 'next/server';
import { getWebSocketServer, getOnlineUsers } from '@/lib/websocket-server';

/**
 * GET /api/socket
 * Verificar status do servidor WebSocket
 */
export async function GET(request: NextRequest) {
  try {
    const server = getWebSocketServer();
    const onlineUsers = getOnlineUsers();

    return NextResponse.json({
      success: true,
      data: {
        connected: server !== null,
        online_users: onlineUsers.length,
        users: onlineUsers.map(u => ({
          userId: u.userId,
          email: u.email,
          name: u.name,
          role: u.role
        }))
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao verificar status do WebSocket',
        details: error.message
      },
      { status: 500 }
    );
  }
}

