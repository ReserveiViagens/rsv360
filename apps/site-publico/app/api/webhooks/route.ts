/**
 * ✅ API ROUTE: Webhooks Management
 * Gerenciar subscriptions de webhooks
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { z } from 'zod';
import {
  createWebhookSubscription,
  listWebhookSubscriptions,
  updateWebhookSubscription,
  deleteWebhookSubscription,
  WEBHOOK_EVENTS
} from '@/lib/webhook-service';

const createWebhookSchema = z.object({
  url: z.string().url().min(10).max(500),
  events: z.array(z.string()).min(1),
  secret: z.string().optional()
});

const updateWebhookSchema = z.object({
  url: z.string().url().min(10).max(500).optional(),
  events: z.array(z.string()).min(1).optional(),
  is_active: z.boolean().optional()
});

/**
 * GET /api/webhooks
 * Listar webhooks do usuário
 */
export const GET = withAuth(
  async (request: NextRequest, user) => {
    try {
      const subscriptions = await listWebhookSubscriptions(user.id);
      
      return NextResponse.json({
        success: true,
        data: subscriptions
      });
    } catch (error: any) {
      console.error('Erro ao listar webhooks:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Erro ao listar webhooks',
          details: error.message
        },
        { status: 500 }
      );
    }
  },
  { required: true }
);

/**
 * POST /api/webhooks
 * Criar nova subscription de webhook
 */
export const POST = withAuth(
  async (request: NextRequest, user) => {
    try {
      const body = await request.json();
      const validated = createWebhookSchema.parse(body);
      
      // Validar eventos
      const validEvents = Object.values(WEBHOOK_EVENTS);
      const invalidEvents = validated.events.filter(e => !validEvents.includes(e as any));
      if (invalidEvents.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error: 'Eventos inválidos',
            details: `Eventos inválidos: ${invalidEvents.join(', ')}`
          },
          { status: 400 }
        );
      }
      
      const subscription = await createWebhookSubscription(
        user.id,
        validated.url,
        validated.events,
        validated.secret
      );
      
      return NextResponse.json({
        success: true,
        data: subscription,
        message: 'Webhook criado com sucesso'
      }, { status: 201 });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: 'Dados inválidos',
            details: error.errors
          },
          { status: 400 }
        );
      }
      
      console.error('Erro ao criar webhook:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Erro ao criar webhook',
          details: error.message
        },
        { status: 500 }
      );
    }
  },
  { required: true }
);

