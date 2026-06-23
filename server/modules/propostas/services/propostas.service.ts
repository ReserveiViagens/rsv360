import { and, desc, eq } from 'drizzle-orm';
import { db } from '../../../lib/db';
import {
  pacotesTemplate,
  propostaChat,
  propostaEventos,
  propostas,
} from '../../../../backend/src/db/schema/propostas';
import { orcamentos, orcamentoItens } from '../../../../backend/src/db/schema/orcamentos';

type HitlMode = 'ai' | 'waiting' | 'human';

function parseMetadata(raw: unknown): Record<string, unknown> {
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    return raw as Record<string, unknown>;
  }
  return {};
}

export class PropostasService {
  async list(filters: { status?: string; enterpriseId?: number } = {}) {
    const conditions = [];
    if (filters.status) conditions.push(eq(propostas.status, filters.status));
    if (filters.enterpriseId) conditions.push(eq(propostas.enterpriseId, filters.enterpriseId));

    const query = db.select().from(propostas).orderBy(desc(propostas.createdAt));
    if (conditions.length) return query.where(and(...conditions));
    return query;
  }

  async getById(id: number) {
    const [row] = await db.select().from(propostas).where(eq(propostas.id, id));
    if (!row) return null;

    const eventos = await db
      .select()
      .from(propostaEventos)
      .where(eq(propostaEventos.propostaId, id))
      .orderBy(desc(propostaEventos.createdAt));

    const chat = await db
      .select()
      .from(propostaChat)
      .where(eq(propostaChat.propostaId, id))
      .orderBy(propostaChat.createdAt);

    return { ...row, eventos, chat };
  }

  async create(data: Record<string, unknown>, actorId?: number) {
    const [created] = await db
      .insert(propostas)
      .values(data as typeof propostas.$inferInsert)
      .returning();

    await this.logEvent(created.id, 'created', 'Proposta criada', { actorId }, actorId);
    return created;
  }

  async update(id: number, data: Record<string, unknown>, actorId?: number) {
    const [updated] = await db
      .update(propostas)
      .set({ ...data, updatedAt: new Date() } as Partial<typeof propostas.$inferInsert>)
      .where(eq(propostas.id, id))
      .returning();

    if (updated) {
      await this.logEvent(id, 'updated', 'Proposta atualizada', { fields: Object.keys(data) }, actorId);
    }
    return updated ?? null;
  }

  async changeStatus(id: number, status: string, actorId?: number) {
    return this.update(id, { status }, actorId);
  }

  async remove(id: number) {
    const [deleted] = await db.delete(propostas).where(eq(propostas.id, id)).returning();
    return deleted ?? null;
  }

  async createFromOrcamento(orcamentoId: number, actorId?: number) {
    const orc = await db.select().from(orcamentos).where(eq(orcamentos.id, orcamentoId));
    const [budget] = orc;
    if (!budget) throw new Error('Orçamento não encontrado');

    const itens = await db
      .select()
      .from(orcamentoItens)
      .where(eq(orcamentoItens.orcamentoId, orcamentoId));

    const [created] = await db
      .insert(propostas)
      .values({
        orcamentoId,
        titulo: budget.titulo,
        clienteNome: budget.clienteNome,
        clienteEmail: budget.clienteEmail,
        clienteTelefone: budget.clienteTelefone,
        valorTotal: budget.total,
        moeda: budget.moeda,
        status: 'draft',
        conteudo: { itens, origem: 'orcamento', orcamentoId },
        metadata: { hitlMode: 'ai' satisfies HitlMode },
      })
      .returning();

    await this.logEvent(created.id, 'from_orcamento', `Gerada a partir do orçamento #${orcamentoId}`, { orcamentoId }, actorId);
    return created;
  }

  async logEvent(
    propostaId: number,
    tipo: string,
    descricao?: string,
    payload?: Record<string, unknown>,
    actorId?: number,
  ) {
    const [evento] = await db
      .insert(propostaEventos)
      .values({
        propostaId,
        tipo,
        descricao,
        payload,
        actorId: actorId ?? null,
      })
      .returning();
    return evento;
  }

  async listChat(propostaId: number) {
    return db
      .select()
      .from(propostaChat)
      .where(eq(propostaChat.propostaId, propostaId))
      .orderBy(propostaChat.createdAt);
  }

  async addChatMessage(
    propostaId: number,
    input: { senderType: string; senderName?: string; message: string },
  ) {
    const [msg] = await db
      .insert(propostaChat)
      .values({
        propostaId,
        senderType: input.senderType,
        senderName: input.senderName ?? null,
        message: input.message,
      })
      .returning();

    await this.logEvent(propostaId, 'chat_message', 'Nova mensagem no chat', {
      senderType: input.senderType,
      messageId: msg.id,
    });

    return msg;
  }

  async getHitlState(propostaId: number) {
    const [row] = await db.select().from(propostas).where(eq(propostas.id, propostaId));
    if (!row) return null;
    const meta = parseMetadata(row.metadata);
    return {
      propostaId,
      hitlMode: (meta.hitlMode as HitlMode) ?? 'ai',
      assignedAgentId: meta.assignedAgentId ?? null,
      assignedAgentName: meta.assignedAgentName ?? null,
    };
  }

  async requestHitl(propostaId: number, clientName?: string) {
    const [row] = await db.select().from(propostas).where(eq(propostas.id, propostaId));
    if (!row) throw new Error('Proposta não encontrada');

    const meta = parseMetadata(row.metadata);
    const nextMeta = { ...meta, hitlMode: 'waiting' as HitlMode };

    await db
      .update(propostas)
      .set({ metadata: nextMeta, updatedAt: new Date() })
      .where(eq(propostas.id, propostaId));

    await this.addChatMessage(propostaId, {
      senderType: 'system',
      senderName: 'Sistema',
      message: `${clientName ?? 'Cliente'} solicitou atendimento humano.`,
    });

    await this.logEvent(propostaId, 'hitl_request', 'Cliente solicitou HITL');
    return this.getHitlState(propostaId);
  }

  async takeoverHitl(propostaId: number, agent: { id: number; name?: string }) {
    const [row] = await db.select().from(propostas).where(eq(propostas.id, propostaId));
    if (!row) throw new Error('Proposta não encontrada');

    const meta = parseMetadata(row.metadata);
    const nextMeta = {
      ...meta,
      hitlMode: 'human' as HitlMode,
      assignedAgentId: agent.id,
      assignedAgentName: agent.name ?? null,
    };

    await db
      .update(propostas)
      .set({ metadata: nextMeta, updatedAt: new Date() })
      .where(eq(propostas.id, propostaId));

    await this.addChatMessage(propostaId, {
      senderType: 'agent',
      senderName: agent.name ?? 'Consultor',
      message: 'Olá! Sou seu consultor e vou continuar este atendimento.',
    });

    await this.logEvent(propostaId, 'hitl_takeover', 'Agente assumiu o chat', { agentId: agent.id }, agent.id);
    return this.getHitlState(propostaId);
  }

  async releaseHitl(propostaId: number, actorId?: number) {
    const [row] = await db.select().from(propostas).where(eq(propostas.id, propostaId));
    if (!row) throw new Error('Proposta não encontrada');

    const meta = parseMetadata(row.metadata);
    const nextMeta = {
      ...meta,
      hitlMode: 'ai' as HitlMode,
      assignedAgentId: null,
      assignedAgentName: null,
    };

    await db
      .update(propostas)
      .set({ metadata: nextMeta, updatedAt: new Date() })
      .where(eq(propostas.id, propostaId));

    await this.addChatMessage(propostaId, {
      senderType: 'system',
      senderName: 'CaldasAI',
      message: 'Atendimento devolvido ao assistente virtual.',
    });

    await this.logEvent(propostaId, 'hitl_release', 'Chat devolvido à IA', {}, actorId);
    return this.getHitlState(propostaId);
  }

  async listTemplates(enterpriseId?: number) {
    if (enterpriseId) {
      return db.select().from(pacotesTemplate).where(eq(pacotesTemplate.enterpriseId, enterpriseId));
    }
    return db.select().from(pacotesTemplate).orderBy(desc(pacotesTemplate.createdAt));
  }

  async createTemplate(data: Record<string, unknown>) {
    const [created] = await db
      .insert(pacotesTemplate)
      .values(data as typeof pacotesTemplate.$inferInsert)
      .returning();
    return created;
  }

  async respondPublic(propostaId: number, action: 'accept' | 'reject', clientName?: string) {
    const [row] = await db.select().from(propostas).where(eq(propostas.id, propostaId));
    if (!row) throw new Error('Proposta não encontrada');
    if (!row.isPublica) throw new Error('Proposta não disponível publicamente');
    if (['accepted', 'rejected', 'cancelled'].includes(row.status)) {
      throw new Error('Proposta já foi respondida');
    }

    const status = action === 'accept' ? 'accepted' : 'rejected';
    const updated = await this.changeStatus(propostaId, status);
    await this.addChatMessage(propostaId, {
      senderType: 'system',
      senderName: 'Sistema',
      message: `${clientName ?? 'Cliente'} ${action === 'accept' ? 'aceitou' : 'recusou'} a proposta.`,
    });
    await this.logEvent(
      propostaId,
      `public_${action}`,
      action === 'accept' ? 'Proposta aceita pelo cliente' : 'Proposta recusada pelo cliente',
      { clientName },
    );
    return updated;
  }
}

export const propostasService = new PropostasService();

module.exports = { PropostasService, propostasService };
