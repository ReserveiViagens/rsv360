import { NextRequest, NextResponse } from 'next/server';
import { queryDatabase } from '@/lib/db';
import { optionalAuth } from '@/lib/api-auth';
import {
  handleGetCheckins,
  handlePostCheckin,
} from '@/lib/checkin-get-handler';
import { checkinIpLimit, clientIpFromHeaders } from '@/lib/pr06b-route-limits';

function enforceCheckinIpLimit(req: NextRequest) {
  const ip = clientIpFromHeaders((n) => req.headers.get(n));
  if (!checkinIpLimit.allow(ip)) {
    return NextResponse.json(
      { success: false, error: 'Too many requests' },
      { status: 429 },
    );
  }
  return null;
}

export async function GET(req: NextRequest) {
  const limited = enforceCheckinIpLimit(req);
  if (limited) return limited;

  return handleGetCheckins(req, {
    queryDatabase: queryDatabase as never,
    getAuthUser: async (request) => {
      const u = await optionalAuth(request);
      if (!u) return null;
      return { id: u.id, email: u.email, role: u.role };
    },
  });
}

export async function POST(req: NextRequest) {
  const limited = enforceCheckinIpLimit(req);
  if (limited) return limited;

  return handlePostCheckin(req, {
    queryDatabase: queryDatabase as never,
    getAuthUser: async (request) => {
      const u = await optionalAuth(request);
      if (!u) return null;
      return { id: u.id, email: u.email, role: u.role };
    },
  });
}
