/**
 * ✅ ITEM 18: SERVIÇO DE CHAT EM GRUPO
 * Backend completo para chat em grupo
 */

import { queryDatabase } from './db';

export interface GroupChat {
  id: number;
  name: string;
  description?: string;
  booking_id?: number;
  chat_type: 'booking' | 'wishlist' | 'trip' | 'custom';
  is_private: boolean;
  created_by?: number;
  created_at: string;
  updated_at: string;
  last_message_at?: string;
  member_count?: number;
  unread_count?: number;
}

export interface GroupChatMember {
  id: number;
  group_chat_id: number;
  user_id?: number;
  email?: string;
  name?: string;
  role: 'admin' | 'member';
  joined_at: string;
  last_read_at?: string;
  is_muted: boolean;
  user_name?: string;
  user_email?: string;
}

export interface GroupChatMessage {
  id: number;
  group_chat_id: number;
  sender_id?: number;
  sender_email?: string;
  sender_name?: string;
  message: string;
  message_type: 'text' | 'image' | 'file' | 'system';
  attachments?: any;
  reply_to_message_id?: number;
  edited_at?: string;
  deleted_at?: string;
  created_at: string;
  read_by?: Array<{
    user_id?: number;
    email?: string;
    read_at: string;
  }>;
  reply_to?: GroupChatMessage;
}

/**
 * Criar grupo de chat
 */
export async function createGroupChat(
  name: string,
  description: string | undefined,
  chatType: 'booking' | 'wishlist' | 'trip' | 'custom' = 'custom',
  bookingId?: number,
  isPrivate: boolean = false,
  createdBy?: number
): Promise<GroupChat> {
  const result = await queryDatabase(
    `INSERT INTO group_chats (name, description, booking_id, chat_type, is_private, created_by)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [name, description || null, bookingId || null, chatType, isPrivate, createdBy || null]
  );

  const groupChat = result[0] as GroupChat;

  // Adicionar criador como admin
  if (createdBy) {
    await queryDatabase(
      `INSERT INTO group_chat_members (group_chat_id, user_id, role)
       VALUES ($1, $2, 'admin')`,
      [groupChat.id, createdBy]
    );
  }

  return groupChat;
}

/**
 * Buscar grupo de chat
 */
export async function getGroupChat(
  groupChatId: number,
  userId?: number,
  email?: string
): Promise<GroupChat | null> {
  const groups = await queryDatabase(
    `SELECT * FROM group_chats WHERE id = $1`,
    [groupChatId]
  );

  if (groups.length === 0) {
    return null;
  }

  const group = groups[0] as GroupChat;

  // Verificar se é membro (se for privado)
  if (group.is_private) {
    const members = await queryDatabase(
      `SELECT * FROM group_chat_members 
       WHERE group_chat_id = $1 AND (user_id = $2 OR email = $3)`,
      [groupChatId, userId || null, email || null]
    );

    if (members.length === 0) {
      return null; // Não tem permissão
    }
  }

  // Adicionar contadores
  const memberCount = await queryDatabase(
    `SELECT COUNT(*) as count FROM group_chat_members WHERE group_chat_id = $1`,
    [groupChatId]
  );
  group.member_count = parseInt(memberCount[0].count || '0');

  if (userId || email) {
    const unreadCount = await queryDatabase(
      `SELECT COUNT(*) as count
       FROM group_chat_messages m
       WHERE m.group_chat_id = $1
       AND m.created_at > COALESCE(
         (SELECT last_read_at FROM group_chat_members 
          WHERE group_chat_id = $1 AND (user_id = $2 OR email = $3) LIMIT 1),
         '1970-01-01'::timestamp
       )
       AND NOT EXISTS (
         SELECT 1 FROM group_chat_message_reads r
         WHERE r.message_id = m.id 
         AND (r.user_id = $2 OR r.email = $3)
       )`,
      [groupChatId, userId || null, email || null]
    );
    group.unread_count = parseInt(unreadCount[0].count || '0');
  }

  return group;
}

/**
 * Listar grupos de chat do usuário
 */
export async function listUserGroupChats(
  userId?: number,
  email?: string
): Promise<GroupChat[]> {
  let query = `
    SELECT DISTINCT gc.*
    FROM group_chats gc
    LEFT JOIN group_chat_members gcm ON gc.id = gcm.group_chat_id
    WHERE gc.is_private = false 
       OR gcm.user_id = $1 
       OR gcm.email = $2
    ORDER BY gc.last_message_at DESC NULLS LAST, gc.created_at DESC
  `;

  const groups = await queryDatabase(query, [userId || null, email || null]);

  // Adicionar contadores
  for (const group of groups) {
    const memberCount = await queryDatabase(
      `SELECT COUNT(*) as count FROM group_chat_members WHERE group_chat_id = $1`,
      [group.id]
    );
    group.member_count = parseInt(memberCount[0].count || '0');

    if (userId || email) {
      const unreadCount = await queryDatabase(
        `SELECT COUNT(*) as count
         FROM group_chat_messages m
         WHERE m.group_chat_id = $1
         AND m.created_at > COALESCE(
           (SELECT last_read_at FROM group_chat_members 
            WHERE group_chat_id = $1 AND (user_id = $2 OR email = $3) LIMIT 1),
           '1970-01-01'::timestamp
         )
         AND NOT EXISTS (
           SELECT 1 FROM group_chat_message_reads r
           WHERE r.message_id = m.id 
           AND (r.user_id = $2 OR r.email = $3)
         )`,
        [group.id, userId || null, email || null]
      );
      group.unread_count = parseInt(unreadCount[0].count || '0');
    }
  }

  return groups as GroupChat[];
}

/**
 * Adicionar membro ao grupo
 */
export async function addGroupChatMember(
  groupChatId: number,
  userId?: number,
  email?: string,
  name?: string,
  role: 'admin' | 'member' = 'member',
  addedByUserId?: number,
  addedByEmail?: string
): Promise<GroupChatMember | null> {
  // Verificar se quem está adicionando tem permissão (admin ou criador)
  const group = await getGroupChat(groupChatId, addedByUserId, addedByEmail);
  if (!group) {
    return null;
  }

  if (group.is_private) {
    const member = await queryDatabase(
      `SELECT role FROM group_chat_members 
       WHERE group_chat_id = $1 AND (user_id = $2 OR email = $3)`,
      [groupChatId, addedByUserId || null, addedByEmail || null]
    );

    if (member.length === 0 || (member[0].role !== 'admin' && group.created_by !== addedByUserId)) {
      return null; // Sem permissão
    }
  }

  const result = await queryDatabase(
    `INSERT INTO group_chat_members (group_chat_id, user_id, email, name, role)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (group_chat_id, COALESCE(user_id::text, email)) DO UPDATE
     SET role = EXCLUDED.role,
         name = COALESCE(EXCLUDED.name, group_chat_members.name)
     RETURNING *`,
    [groupChatId, userId || null, email || null, name || null, role]
  );

  return result[0] as GroupChatMember || null;
}

/**
 * Remover membro do grupo
 */
export async function removeGroupChatMember(
  groupChatId: number,
  memberId: number,
  userId?: number,
  email?: string
): Promise<boolean> {
  // Verificar permissão
  const group = await getGroupChat(groupChatId, userId, email);
  if (!group) {
    return false;
  }

  const member = await queryDatabase(
    `SELECT role FROM group_chat_members WHERE id = $1`,
    [memberId]
  );

  if (member.length === 0) {
    return false;
  }

  // Apenas admin ou criador pode remover
  const requester = await queryDatabase(
    `SELECT role FROM group_chat_members 
     WHERE group_chat_id = $1 AND (user_id = $2 OR email = $3)`,
    [groupChatId, userId || null, email || null]
  );

  if (requester.length === 0) {
    return false;
  }

  if (requester[0].role !== 'admin' && group.created_by !== userId) {
    return false;
  }

  await queryDatabase(
    `DELETE FROM group_chat_members WHERE id = $1`,
    [memberId]
  );

  return true;
}

/**
 * Listar membros do grupo
 */
export async function listGroupChatMembers(
  groupChatId: number,
  userId?: number,
  email?: string
): Promise<GroupChatMember[]> {
  // Verificar permissão
  const group = await getGroupChat(groupChatId, userId, email);
  if (!group) {
    return [];
  }

  const members = await queryDatabase(
    `SELECT m.*, u.name as user_name, u.email as user_email
     FROM group_chat_members m
     LEFT JOIN users u ON m.user_id = u.id
     WHERE m.group_chat_id = $1
     ORDER BY 
       CASE m.role 
         WHEN 'admin' THEN 1 
         ELSE 2 
       END,
       m.joined_at ASC`,
    [groupChatId]
  );

  return members as GroupChatMember[];
}

/**
 * Enviar mensagem no grupo
 */
export async function sendGroupMessage(
  groupChatId: number,
  message: string,
  senderId?: number,
  senderEmail?: string,
  senderName?: string,
  messageType: 'text' | 'image' | 'file' | 'system' = 'text',
  attachments?: any,
  replyToMessageId?: number
): Promise<GroupChatMessage | null> {
  // Verificar se é membro
  const group = await getGroupChat(groupChatId, senderId, senderEmail);
  if (!group) {
    return null;
  }

  const result = await queryDatabase(
    `INSERT INTO group_chat_messages 
     (group_chat_id, sender_id, sender_email, sender_name, message, message_type, attachments, reply_to_message_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      groupChatId,
      senderId || null,
      senderEmail || null,
      senderName || null,
      message,
      messageType,
      attachments ? JSON.stringify(attachments) : null,
      replyToMessageId || null,
    ]
  );

  return result[0] as GroupChatMessage || null;
}

/**
 * Listar mensagens do grupo
 */
export async function listGroupMessages(
  groupChatId: number,
  limit: number = 50,
  beforeMessageId?: number,
  userId?: number,
  email?: string
): Promise<GroupChatMessage[]> {
  // Verificar permissão
  const group = await getGroupChat(groupChatId, userId, email);
  if (!group) {
    return [];
  }

  let query = `
    SELECT m.*
    FROM group_chat_messages m
    WHERE m.group_chat_id = $1 AND m.deleted_at IS NULL
  `;

  const params: any[] = [groupChatId];

  if (beforeMessageId) {
    query += ` AND m.id < $${params.length + 1}`;
    params.push(beforeMessageId);
  }

  query += ` ORDER BY m.created_at DESC LIMIT $${params.length + 1}`;
  params.push(limit);

  const messages = await queryDatabase(query, params);

  // Buscar informações de leitura e replies
  for (const message of messages) {
    const reads = await queryDatabase(
      `SELECT * FROM group_chat_message_reads WHERE message_id = $1`,
      [message.id]
    );
    message.read_by = reads as any;

    if (message.reply_to_message_id) {
      const replyTo = await queryDatabase(
        `SELECT * FROM group_chat_messages WHERE id = $1`,
        [message.reply_to_message_id]
      );
      if (replyTo.length > 0) {
        message.reply_to = replyTo[0] as GroupChatMessage;
      }
    }
  }

  // Reverter ordem (mais antigas primeiro)
  return messages.reverse() as GroupChatMessage[];
}

/**
 * Marcar mensagens como lidas
 */
export async function markMessagesAsRead(
  groupChatId: number,
  messageIds: number[],
  userId?: number,
  email?: string
): Promise<boolean> {
  if (messageIds.length === 0) {
    return true;
  }

  // Verificar se é membro
  const group = await getGroupChat(groupChatId, userId, email);
  if (!group) {
    return false;
  }

  // Inserir leituras
  for (const messageId of messageIds) {
    await queryDatabase(
      `INSERT INTO group_chat_message_reads (message_id, user_id, email)
       VALUES ($1, $2, $3)
       ON CONFLICT (message_id, COALESCE(user_id::text, email)) DO NOTHING`,
      [messageId, userId || null, email || null]
    );
  }

  // Atualizar last_read_at do membro
  await queryDatabase(
    `UPDATE group_chat_members 
     SET last_read_at = CURRENT_TIMESTAMP
     WHERE group_chat_id = $1 AND (user_id = $2 OR email = $3)`,
    [groupChatId, userId || null, email || null]
  );

  return true;
}

/**
 * Editar mensagem
 */
export async function editGroupMessage(
  messageId: number,
  newMessage: string,
  userId?: number,
  email?: string
): Promise<GroupChatMessage | null> {
  // Verificar se é o autor
  const messages = await queryDatabase(
    `SELECT * FROM group_chat_messages WHERE id = $1`,
    [messageId]
  );

  if (messages.length === 0) {
    return null;
  }

  const message = messages[0] as GroupChatMessage;

  if (message.sender_id !== userId && message.sender_email !== email) {
    return null; // Não é o autor
  }

  const result = await queryDatabase(
    `UPDATE group_chat_messages 
     SET message = $1, edited_at = CURRENT_TIMESTAMP
     WHERE id = $2
     RETURNING *`,
    [newMessage, messageId]
  );

  return result[0] as GroupChatMessage || null;
}

/**
 * Deletar mensagem
 */
export async function deleteGroupMessage(
  messageId: number,
  userId?: number,
  email?: string
): Promise<boolean> {
  // Verificar se é o autor ou admin
  const messages = await queryDatabase(
    `SELECT m.*, gc.id as group_id
     FROM group_chat_messages m
     JOIN group_chats gc ON m.group_chat_id = gc.id
     WHERE m.id = $1`,
    [messageId]
  );

  if (messages.length === 0) {
    return false;
  }

  const message = messages[0] as any;
  const isAuthor = message.sender_id === userId || message.sender_email === email;

  if (!isAuthor) {
    // Verificar se é admin
    const member = await queryDatabase(
      `SELECT role FROM group_chat_members 
       WHERE group_chat_id = $1 AND (user_id = $2 OR email = $3)`,
      [message.group_id, userId || null, email || null]
    );

    if (member.length === 0 || member[0].role !== 'admin') {
      return false;
    }
  }

  await queryDatabase(
    `UPDATE group_chat_messages 
     SET deleted_at = CURRENT_TIMESTAMP
     WHERE id = $1`,
    [messageId]
  );

  return true;
}

/**
 * Buscar grupo de chat por booking
 */
export async function getGroupChatByBooking(
  bookingId: number
): Promise<GroupChat | null> {
  const groups = await queryDatabase(
    `SELECT * FROM group_chats WHERE booking_id = $1 ORDER BY created_at DESC LIMIT 1`,
    [bookingId]
  );

  if (groups.length === 0) {
    return null;
  }

  return groups[0] as GroupChat;
}

