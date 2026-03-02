/**
 * ✅ ITENS 79-81: SERVIÇO DE MENSAGENS MELHORADO
 * Tempo Real, Histórico, Templates
 */

import { queryDatabase } from './db';

export interface MessageTemplate {
  id?: number;
  name: string;
  description?: string;
  category?: 'greeting' | 'booking_confirmation' | 'check_in' | 'check_out' | 'cancellation' | 'support' | 'promotion' | 'custom';
  subject?: string;
  content: string;
  available_variables?: string[];
  applicable_to?: 'all' | 'properties' | 'bookings';
  applicable_properties?: number[];
  is_active?: boolean;
  is_public?: boolean;
  created_by?: number;
}

export interface QuickReply {
  id?: number;
  user_id: number;
  label: string;
  message: string;
  category?: string;
  display_order?: number;
  is_active?: boolean;
}

export interface MessageSearchFilters {
  chat_id?: number;
  search_text?: string;
  sender_ids?: number[];
  message_types?: string[];
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
}

export interface MessageExport {
  chat_id: number;
  export_type: 'pdf' | 'csv' | 'json' | 'txt';
  date_from?: string;
  date_to?: string;
  sender_ids?: number[];
  message_types?: string[];
}

/**
 * ✅ ITEM 79: MENSAGENS MELHORADO - TEMPO REAL
 * 
 * Nota: WebSocket será implementado no frontend.
 * Backend fornece APIs para status de leitura e notificações.
 */

/**
 * Atualizar status de leitura (já existe em group-chat-service, mas melhorado)
 */
export async function markMessagesAsRead(
  chatId: number,
  userId: number,
  messageIds?: number[]
): Promise<void> {
  if (messageIds && messageIds.length > 0) {
    // Marcar mensagens específicas como lidas
    await queryDatabase(
      `INSERT INTO group_chat_message_reads (message_id, user_id, read_at)
       SELECT id, $1, CURRENT_TIMESTAMP
       FROM group_chat_messages
       WHERE chat_id = $2 AND id = ANY($3::INTEGER[])
       ON CONFLICT (message_id, user_id) DO UPDATE SET read_at = CURRENT_TIMESTAMP`,
      [userId, chatId, messageIds]
    );
  } else {
    // Marcar todas as mensagens do chat como lidas
    await queryDatabase(
      `INSERT INTO group_chat_message_reads (message_id, user_id, read_at)
       SELECT id, $1, CURRENT_TIMESTAMP
       FROM group_chat_messages
       WHERE chat_id = $2
       ON CONFLICT (message_id, user_id) DO UPDATE SET read_at = CURRENT_TIMESTAMP`,
      [userId, chatId]
    );
  }
}

/**
 * Obter contagem de mensagens não lidas
 */
export async function getUnreadMessageCount(
  userId: number,
  chatId?: number
): Promise<number> {
  let query = `
    SELECT COUNT(*) as count
    FROM group_chat_messages gcm
    WHERE gcm.sender_id != $1
      AND NOT EXISTS (
        SELECT 1 FROM group_chat_message_reads gcmr
        WHERE gcmr.message_id = gcm.id AND gcmr.user_id = $1
      )
  `;
  const params: any[] = [userId];

  if (chatId) {
    query += ` AND gcm.chat_id = $2`;
    params.push(chatId);
  } else {
    // Verificar apenas chats onde o usuário é membro
    query += ` AND EXISTS (
      SELECT 1 FROM group_chat_members gcm2
      WHERE gcm2.chat_id = gcm.chat_id AND gcm2.user_id = $1
    )`;
  }

  const result = await queryDatabase(query, params);
  return parseInt(result[0]?.count || '0');
}

/**
 * Obter status de leitura de mensagens
 */
export async function getMessageReadStatus(
  messageId: number
): Promise<{ user_id: number; read_at: string }[]> {
  return await queryDatabase(
    `SELECT user_id, read_at
     FROM group_chat_message_reads
     WHERE message_id = $1
     ORDER BY read_at DESC`,
    [messageId]
  );
}

/**
 * ✅ ITEM 80: MENSAGENS MELHORADO - HISTÓRICO
 */

/**
 * Buscar mensagens com filtros
 */
export async function searchMessages(filters: MessageSearchFilters): Promise<any[]> {
  let query = `
    SELECT 
      gcm.*,
      u.name as sender_name,
      u.email as sender_email,
      gcmr.read_at
    FROM group_chat_messages gcm
    JOIN users u ON gcm.sender_id = u.id
    LEFT JOIN group_chat_message_reads gcmr ON gcmr.message_id = gcm.id
    WHERE 1=1
  `;
  const params: any[] = [];
  let paramIndex = 1;

  if (filters.chat_id) {
    query += ` AND gcm.chat_id = $${paramIndex}`;
    params.push(filters.chat_id);
    paramIndex++;
  }

  if (filters.search_text) {
    query += ` AND EXISTS (
      SELECT 1 FROM message_search_index msi
      WHERE msi.message_id = gcm.id
        AND msi.search_vector @@ plainto_tsquery('portuguese', $${paramIndex})
    )`;
    params.push(filters.search_text);
    paramIndex++;
  }

  if (filters.sender_ids && filters.sender_ids.length > 0) {
    query += ` AND gcm.sender_id = ANY($${paramIndex}::INTEGER[])`;
    params.push(filters.sender_ids);
    paramIndex++;
  }

  if (filters.message_types && filters.message_types.length > 0) {
    query += ` AND gcm.message_type = ANY($${paramIndex}::VARCHAR[])`;
    params.push(filters.message_types);
    paramIndex++;
  }

  if (filters.date_from) {
    query += ` AND gcm.created_at >= $${paramIndex}::TIMESTAMP`;
    params.push(filters.date_from);
    paramIndex++;
  }

  if (filters.date_to) {
    query += ` AND gcm.created_at <= $${paramIndex}::TIMESTAMP`;
    params.push(filters.date_to);
    paramIndex++;
  }

  query += ` ORDER BY gcm.created_at DESC`;

  if (filters.limit) {
    query += ` LIMIT $${paramIndex}`;
    params.push(filters.limit);
    paramIndex++;
  }

  if (filters.offset) {
    query += ` OFFSET $${paramIndex}`;
    params.push(filters.offset);
    paramIndex++;
  }

  return await queryDatabase(query, params);
}

/**
 * Exportar conversa
 */
export async function exportConversation(
  exportData: MessageExport,
  createdBy: number
): Promise<number> {
  // Criar registro de exportação
  const result = await queryDatabase(
    `INSERT INTO message_exports 
     (chat_id, export_type, date_from, date_to, sender_ids, message_types, status, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, 'processing', $7)
     RETURNING id`,
    [
      exportData.chat_id,
      exportData.export_type,
      exportData.date_from || null,
      exportData.date_to || null,
      exportData.sender_ids ? JSON.stringify(exportData.sender_ids) : null,
      exportData.message_types ? JSON.stringify(exportData.message_types) : null,
      createdBy,
    ]
  );

  const exportId = result[0].id;

  // Buscar mensagens para exportação
  const messages = await searchMessages({
    chat_id: exportData.chat_id,
    date_from: exportData.date_from,
    date_to: exportData.date_to,
    sender_ids: exportData.sender_ids,
    message_types: exportData.message_types,
  });

  // Gerar arquivo baseado no tipo
  let fileUrl = '';
  let fileSize = 0;

  try {
    if (exportData.export_type === 'json') {
      const jsonContent = JSON.stringify(messages, null, 2);
      fileSize = Buffer.byteLength(jsonContent, 'utf8');
      // Salvar arquivo em storage
      const { saveFile } = await import('./storage-service');
      const saved = await saveFile(jsonContent, `messages-${exportId}.json`, 'exports');
      fileUrl = saved.fileUrl;
      fileSize = saved.fileSize;
    } else if (exportData.export_type === 'csv') {
      if (messages.length > 0) {
        const headers = ['ID', 'Data', 'Remetente', 'Tipo', 'Mensagem'];
        const rows = messages.map((msg: any) => [
          msg.id,
          new Date(msg.created_at).toLocaleString('pt-BR'),
          msg.sender_name || msg.sender_email || 'Sistema',
          msg.message_type,
          msg.content || msg.message || '',
        ]);
        const csvContent = [
          headers.join(','),
          ...rows.map((row: any[]) => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
        ].join('\n');
        const { saveFile } = await import('./storage-service');
        const saved = await saveFile(csvContent, `messages-${exportId}.csv`, 'exports');
        fileUrl = saved.fileUrl;
        fileSize = saved.fileSize;
      }
    } else if (exportData.export_type === 'txt') {
      const txtContent = messages.map((msg: any) => {
        const date = new Date(msg.created_at).toLocaleString('pt-BR');
        const sender = msg.sender_name || msg.sender_email || 'Sistema';
        return `[${date}] ${sender} (${msg.message_type}): ${msg.content || msg.message || ''}`;
      }).join('\n\n');
      const { saveFile } = await import('./storage-service');
      const saved = await saveFile(txtContent, `messages-${exportId}.txt`, 'exports');
      fileUrl = saved.fileUrl;
      fileSize = saved.fileSize;
    } else if (exportData.export_type === 'pdf') {
      // Para PDF, usar biblioteca jsPDF (já instalada)
      // Por enquanto, gerar HTML que pode ser convertido
      const htmlContent = `
        <html>
          <head><title>Exportação de Conversa</title></head>
          <body>
            <h1>Conversa Exportada</h1>
            <p>Exportado em: ${new Date().toLocaleString('pt-BR')}</p>
            <table border="1" style="width:100%; border-collapse:collapse;">
              <tr>
                <th>Data</th>
                <th>Remetente</th>
                <th>Tipo</th>
                <th>Mensagem</th>
              </tr>
              ${messages.map((msg: any) => `
                <tr>
                  <td>${new Date(msg.created_at).toLocaleString('pt-BR')}</td>
                  <td>${msg.sender_name || msg.sender_email || 'Sistema'}</td>
                  <td>${msg.message_type}</td>
                  <td>${(msg.content || msg.message || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>
                </tr>
              `).join('')}
            </table>
          </body>
        </html>
      `;
      const { saveFile } = await import('./storage-service');
      const saved = await saveFile(htmlContent, `messages-${exportId}.html`, 'exports');
      fileUrl = saved.fileUrl;
      fileSize = saved.fileSize;
    }

    // Atualizar registro de exportação
    await queryDatabase(
      `UPDATE message_exports 
       SET status = 'completed', 
           completed_at = CURRENT_TIMESTAMP,
           file_url = $1,
           file_size = $2
       WHERE id = $3`,
      [fileUrl, fileSize, exportId]
    );
  } catch (error: any) {
    console.error('Erro ao gerar arquivo de exportação:', error);
    await queryDatabase(
      `UPDATE message_exports 
       SET status = 'failed', 
           error_message = $1
       WHERE id = $2`,
      [error.message, exportId]
    );
    throw error;
  }

  return exportId;
}

/**
 * Obter histórico de exportações
 */
export async function getExportHistory(
  userId: number,
  chatId?: number
): Promise<any[]> {
  let query = `
    SELECT * FROM message_exports
    WHERE created_by = $1
  `;
  const params: any[] = [userId];

  if (chatId) {
    query += ` AND chat_id = $2`;
    params.push(chatId);
  }

  query += ` ORDER BY created_at DESC`;

  return await queryDatabase(query, params);
}

/**
 * ✅ ITEM 81: MENSAGENS MELHORADO - TEMPLATES
 */

/**
 * Criar template de mensagem
 */
export async function createMessageTemplate(
  template: MessageTemplate,
  createdBy: number
): Promise<MessageTemplate> {
  const result = await queryDatabase(
    `INSERT INTO message_templates 
     (name, description, category, subject, content, available_variables,
      applicable_to, applicable_properties, is_active, is_public, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING *`,
    [
      template.name,
      template.description || null,
      template.category || null,
      template.subject || null,
      template.content,
      template.available_variables ? JSON.stringify(template.available_variables) : null,
      template.applicable_to || 'all',
      template.applicable_properties ? JSON.stringify(template.applicable_properties) : null,
      template.is_active !== false,
      template.is_public || false,
      createdBy,
    ]
  );

  return result[0];
}

/**
 * Listar templates disponíveis
 */
export async function listMessageTemplates(filters: {
  category?: string;
  is_public?: boolean;
  user_id?: number;
  applicable_to?: string;
} = {}): Promise<MessageTemplate[]> {
  let query = `SELECT * FROM message_templates WHERE is_active = true`;
  const params: any[] = [];
  let paramIndex = 1;

  if (filters.category) {
    query += ` AND category = $${paramIndex}`;
    params.push(filters.category);
    paramIndex++;
  }

  if (filters.is_public !== undefined) {
    if (filters.is_public) {
      query += ` AND (is_public = true OR created_by = $${paramIndex})`;
      params.push(filters.user_id);
      paramIndex++;
    } else if (filters.user_id) {
      query += ` AND created_by = $${paramIndex}`;
      params.push(filters.user_id);
      paramIndex++;
    }
  }

  if (filters.applicable_to) {
    query += ` AND (applicable_to = 'all' OR applicable_to = $${paramIndex})`;
    params.push(filters.applicable_to);
    paramIndex++;
  }

  query += ` ORDER BY usage_count DESC, name ASC`;

  return await queryDatabase(query, params);
}

/**
 * Aplicar template (substituir variáveis)
 */
export function applyTemplate(
  template: MessageTemplate,
  variables: Record<string, string>
): { subject?: string; content: string } {
  let subject = template.subject || '';
  let content = template.content;

  // Substituir variáveis no subject
  Object.keys(variables).forEach((key) => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    subject = subject.replace(regex, variables[key]);
  });

  // Substituir variáveis no content
  Object.keys(variables).forEach((key) => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    content = content.replace(regex, variables[key]);
  });

  return { subject: subject || undefined, content };
}

/**
 * Criar resposta rápida
 */
export async function createQuickReply(reply: QuickReply): Promise<QuickReply> {
  const result = await queryDatabase(
    `INSERT INTO quick_replies 
     (user_id, label, message, category, display_order, is_active)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      reply.user_id,
      reply.label,
      reply.message,
      reply.category || null,
      reply.display_order || 0,
      reply.is_active !== false,
    ]
  );

  return result[0];
}

/**
 * Listar respostas rápidas do usuário
 */
export async function listQuickReplies(
  userId: number,
  category?: string
): Promise<QuickReply[]> {
  let query = `SELECT * FROM quick_replies WHERE user_id = $1 AND is_active = true`;
  const params: any[] = [userId];
  let paramIndex = 2;

  if (category) {
    query += ` AND category = $${paramIndex}`;
    params.push(category);
    paramIndex++;
  }

  query += ` ORDER BY display_order ASC, usage_count DESC, label ASC`;

  return await queryDatabase(query, params);
}

/**
 * Incrementar uso de resposta rápida
 */
export async function incrementQuickReplyUsage(replyId: number): Promise<void> {
  await queryDatabase(
    `UPDATE quick_replies 
     SET usage_count = usage_count + 1
     WHERE id = $1`,
    [replyId]
  );
}

