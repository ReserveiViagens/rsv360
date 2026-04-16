/**
 * RSV360 PMS/CRM — Reservei Viagens
 * Copyright (c) 2024-2026 Reservei Viagens LTDA. Todos os direitos reservados.
 * Desenvolvido por Douglas P. Figueiredo <douglas@reserveiviagens.com.br>
 * @author Douglas P. Figueiredo
 * @license UNLICENSED
 */
import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import type { ParsedUrlQuery } from 'querystring';
import type { GuestProfile, GuestReservation, PortalBookingStatus, PortalFeedback, PortalRequest } from '@/types/auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

export type PortalBootstrap = {
  booking: GuestReservation | null;
  guest: GuestProfile | null;
  requests: PortalRequest[];
  feedback: PortalFeedback[] | null;
  checkinStatus: PortalBookingStatus | null;
};

function extractToken(context: GetServerSidePropsContext<ParsedUrlQuery>) {
  return context.req.cookies.rsv360_guest_portal_token || context.query.token || null;
}

async function fetchJson<T>(path: string, token: string, allow404 = false): Promise<T | null> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer portal_${token}`,
      'X-Portal-Token': token,
    },
  });

  if (!response.ok) {
    if (allow404 && response.status === 404) {
      return null;
    }

    throw new Error(`HTTP ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function loadPortalBootstrap(token: string): Promise<PortalBootstrap> {
  const [booking, requests, feedback, checkinStatus] = await Promise.all([
    fetchJson<{ booking: GuestReservation; guest: GuestProfile }>('/api/portal/booking', token),
    fetchJson<PortalRequest[]>('/api/portal/requests', token, true),
    fetchJson<PortalFeedback[]>('/api/portal/feedback', token, true),
    fetchJson<PortalBookingStatus>('/api/portal/checkin/status', token, true),
  ]);

  return {
    booking: booking?.booking || null,
    guest: booking?.guest || null,
    requests: requests || [],
    feedback: feedback || null,
    checkinStatus: checkinStatus || null,
  };
}

export async function requirePortalToken(
  context: GetServerSidePropsContext<ParsedUrlQuery>,
): Promise<GetServerSidePropsResult<Record<string, never>> | string> {
  const token = extractToken(context);
  if (!token || typeof token !== 'string') {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  return token;
}
