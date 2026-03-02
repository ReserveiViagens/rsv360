/**
 * ✅ CHAT EM GRUPO AVANÇADO
 * Sistema completo com mensagens ricas, reações, menções, busca e muito mais
 */

import { queryDatabase } from './db';

export interface EnhancedGroupChatMessage {
  id: number;
  groupChatId: number;
  senderId?: number;
  senderEmail?: string;
  senderName?: string;
  message: string;
  messageType: 'text' | 'image' | 'file' | 'system' | 'location' | 'poll' | 'booking_link';
  attachments?: Array<{
    type: 'image' | 'file' | 'video' | 'audio';
    url: string;
    name?: string;
    size?: number;
  }>;
  replyToMessageId?: number;
  replyTo?: EnhancedGroupChatMessage;
  mentions?: Array<{
    userId?: number;
    email?: string;
    name?: string;
  }>;
  reactions?: Array<{
    emoji: string;
    users: Array<{ userId?: number; email?: string }>;
  }>;
  editedAt?: string;
  deletedAt?: string;
  pinned: boolean;
  createdAt: string;
  readBy?: Array<{
    userId?: number;
    email?: string;
    readAt: string;
  }>;
}

export interface GroupChatPoll {
  id: number;
  messageId: number;
  question: string;
  options: Array<{
    id: string;
    text: string;
    votes: number;
  }>;
  multipleChoice: boolean;
  expiresAt?: string;
  votes: Array<{
    userId?: number;
    email?: string;
    optionIds: string[];
  }>;
}

/**
 * Enviar mensagem avançada
 */
export async function sendEnhancedMessage(
  groupChatId: number,
  senderId: number | undefined,
  senderEmail: string | undefined,
  message: string,
  options: {
    messageType?: EnhancedGroupChatMessage['messageType'];
    attachments?: EnhancedGroupChatMessage['attachments'];
    replyToMessageId?: number;
    mentions?: Array<{ userId?: number; email?: string }>;
  } = {}
): Promise<EnhancedGroupChatMessage> {
  // Extrair menções da mensagem
  const mentionRegex = /@(\w+)/g;
  const mentions: Array<{ userId?: number; email?: string }> = [];
  
  if (options.mentions) {
    mentions.push(...options.mentions);
  } else {
    // Buscar menções por email ou nome
    const matches = message.match(mentionRegex);
    if (matches) {
      for (const match of matches) {
        const identifier = match.replace('@', '');
        const user = await queryDatabase(
          `SELECT id, email FROM users WHERE email = $1 OR name ILIKE $2 LIMIT 1`,
          [identifier, `%${identifier}%`]
        );
        if (user.length > 0) {
          mentions.push({ userId: user[0].id, email: user[0].email });
        }
      }
    }
  }

  // Criar mensagem
  const result = await queryDatabase(
    `INSERT INTO group_chat_messages (
      group_chat_id, sender_id, sender_email, message, message_type,
      attachments, reply_to_message_id, mentions
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *`,
    [
      groupChatId,
      senderId || null,
      senderEmail || null,
      message,
      options.messageType || 'text',
      options.attachments ? JSON.stringify(options.attachments) : null,
      options.replyToMessageId || null,
      mentions.length > 0 ? JSON.stringify(mentions) : null,
    ]
  );

  const messageData = result[0];

  // Notificar menções
  if (mentions.length > 0) {
    const { sendNotification } = await import('./enhanced-notification-service');
    for (const mention of mentions) {
      await sendNotification({
        userId: mention.userId,
        type: ['email', 'in_app', 'push'],
        templateId: 'group_chat_mention',
        variables: {
          groupChatId: groupChatId.toString(),
          senderName: messageData.sender_name || 'Alguém',
          message: message.substring(0, 100),
        },
      });
    }
  }

  // Atualizar last_message_at do grupo
  await queryDatabase(
    `UPDATE group_chats SET last_message_at = NOW() WHERE id = $1`,
    [groupChatId]
  );

  return formatMessage(messageData);
}

/**
 * Adicionar reação a mensagem
 */
export async function addMessageReaction(
  messageId: number,
  userId: number | undefined,
  email: string | undefined,
  emoji: string
): Promise<boolean> {
  // Buscar reações existentes
  const message = await queryDatabase(
    `SELECT reactions FROM group_chat_messages WHERE id = $1`,
    [messageId]
  );

  if (message.length === 0) {
    return false;
  }

  const reactions = message[0].reactions || [];
  const reactionIndex = reactions.findIndex((r: any) => r.emoji === emoji);

  if (reactionIndex >= 0) {
    // Adicionar usuário à reação existente
    const reaction = reactions[reactionIndex];
    const userExists = reaction.users.some(
      (u: any) => (u.userId && u.userId === userId) || (u.email && u.email === email)
    );

    if (!userExists) {
      reaction.users.push({ userId, email });
    }
  } else {
    // Criar nova reação
    reactions.push({
      emoji,
      users: [{ userId, email }],
    });
  }

  await queryDatabase(
    `UPDATE group_chat_messages SET reactions = $1 WHERE id = $2`,
    [JSON.stringify(reactions), messageId]
  );

  return true;
}

/**
 * Remover reação
 */
export async function removeMessageReaction(
  messageId: number,
  userId: number | undefined,
  email: string | undefined,
  emoji: string
): Promise<boolean> {
  const message = await queryDatabase(
    `SELECT reactions FROM group_chat_messages WHERE id = $1`,
    [messageId]
  );

  if (message.length === 0) {
    return false;
  }

  const reactions = message[0].reactions || [];
  const reactionIndex = reactions.findIndex((r: any) => r.emoji === emoji);

  if (reactionIndex >= 0) {
    const reaction = reactions[reactionIndex];
    reaction.users = reaction.users.filter(
      (u: any) => !((u.userId && u.userId === userId) || (u.email && u.email === email))
    );

    if (reaction.users.length === 0) {
      reactions.splice(reactionIndex, 1);
    }

    await queryDatabase(
      `UPDATE group_chat_messages SET reactions = $1 WHERE id = $2`,
      [JSON.stringify(reactions), messageId]
    );
  }

  return true;
}

/**
 * Buscar mensagens com filtros avançados
 */
export async function searchGroupChatMessages(
  groupChatId: number,
  searchQuery: string,
  filters?: {
    senderId?: number;
    messageType?: string;
    dateFrom?: Date;
    dateTo?: Date;
    hasAttachments?: boolean;
    hasMentions?: boolean;
  }
): Promise<EnhancedGroupChatMessage[]> {
  let query = `
    SELECT * FROM group_chat_messages
    WHERE group_chat_id = $1
      AND deleted_at IS NULL
      AND message ILIKE $2
  `;
  const params: any[] = [groupChatId, `%${searchQuery}%`];

  if (filters?.senderId) {
    query += ` AND sender_id = $${params.length + 1}`;
    params.push(filters.senderId);
  }

  if (filters?.messageType) {
    query += ` AND message_type = $${params.length + 1}`;
    params.push(filters.messageType);
  }

  if (filters?.dateFrom) {
    query += ` AND created_at >= $${params.length + 1}`;
    params.push(filters.dateFrom.toISOString());
  }

  if (filters?.dateTo) {
    query += ` AND created_at <= $${params.length + 1}`;
    params.push(filters.dateTo.toISOString());
  }

  if (filters?.hasAttachments) {
    query += ` AND attachments IS NOT NULL`;
  }

  if (filters?.hasMentions) {
    query += ` AND mentions IS NOT NULL`;
  }

  query += ` ORDER BY created_at DESC LIMIT 50`;

  const messages = await queryDatabase(query, params);
  return messages.map(formatMessage);
}

/**
 * Fixar mensagem
 */
export async function pinMessage(messageId: number, groupChatId: number): Promise<boolean> {
  // Desfixar outras mensagens
  await queryDatabase(
    `UPDATE group_chat_messages SET pinned = false WHERE group_chat_id = $1`,
    [groupChatId]
  );

  // Fixar esta mensagem
  await queryDatabase(
    `UPDATE group_chat_messages SET pinned = true WHERE id = $1`,
    [messageId]
  );

  return true;
}

/**
 * Criar poll no chat
 */
export async function createGroupChatPoll(
  groupChatId: number,
  senderId: number | undefined,
  senderEmail: string | undefined,
  question: string,
  options: string[],
  multipleChoice: boolean = false,
  expiresAt?: Date
): Promise<GroupChatPoll> {
  const pollOptions = options.map((text, index) => ({
    id: `option_${index}`,
    text,
    votes: 0,
  }));

  const message = await sendEnhancedMessage(
    groupChatId,
    senderId,
    senderEmail,
    question,
    {
      messageType: 'poll',
      attachments: [{
        type: 'file',
        url: JSON.stringify({
          question,
          options: pollOptions,
          multipleChoice,
          expiresAt: expiresAt?.toISOString(),
        }),
      }],
    }
  );

  const poll: GroupChatPoll = {
    id: message.id,
    messageId: message.id,
    question,
    options: pollOptions,
    multipleChoice,
    expiresAt: expiresAt?.toISOString(),
    votes: [],
  };

  // Salvar poll no banco (criar tabela se necessário)
  await queryDatabase(
    `INSERT INTO group_chat_polls (message_id, question, options, multiple_choice, expires_at)
     VALUES ($1, $2, $3, $4, $5)`,
    [
      message.id,
      question,
      JSON.stringify(pollOptions),
      multipleChoice,
      expiresAt?.toISOString() || null,
    ]
  );

  return poll;
}

/**
 * Votar em poll
 */
export async function voteOnPoll(
  pollId: number,
  userId: number | undefined,
  email: string | undefined,
  optionIds: string[]
): Promise<boolean> {
  const poll = await queryDatabase(
    `SELECT * FROM group_chat_polls WHERE id = $1`,
    [pollId]
  );

  if (poll.length === 0) {
    return false;
  }

  const pollData = JSON.parse(poll[0].options);
  const votes = JSON.parse(poll[0].votes || '[]');

  // Verificar se já votou
  const existingVote = votes.findIndex(
    (v: any) => (v.userId && v.userId === userId) || (v.email && v.email === email)
  );

  if (existingVote >= 0 && !poll[0].multiple_choice) {
    return false; // Já votou e não é múltipla escolha
  }

  // Adicionar voto
  if (existingVote >= 0) {
    votes[existingVote].optionIds = optionIds;
  } else {
    votes.push({ userId, email, optionIds });
  }

  // Atualizar contadores
  optionIds.forEach((optionId) => {
    const option = pollData.find((o: any) => o.id === optionId);
    if (option) {
      option.votes++;
    }
  });

  await queryDatabase(
    `UPDATE group_chat_polls SET options = $1, votes = $2 WHERE id = $3`,
    [JSON.stringify(pollData), JSON.stringify(votes), pollId]
  );

  return true;
}

/**
 * Formatar mensagem
 */
function formatMessage(messageData: any): EnhancedGroupChatMessage {
  return {
    id: messageData.id,
    groupChatId: messageData.group_chat_id,
    senderId: messageData.sender_id,
    senderEmail: messageData.sender_email,
    senderName: messageData.sender_name,
    message: messageData.message,
    messageType: messageData.message_type,
    attachments: messageData.attachments ? JSON.parse(messageData.attachments) : undefined,
    replyToMessageId: messageData.reply_to_message_id,
    mentions: messageData.mentions ? JSON.parse(messageData.mentions) : undefined,
    reactions: messageData.reactions ? JSON.parse(messageData.reactions) : undefined,
    editedAt: messageData.edited_at,
    deletedAt: messageData.deleted_at,
    pinned: messageData.pinned || false,
    createdAt: messageData.created_at,
  };
}

