/**
 * ✅ ITEM 12: SERVIÇO DE WISHLISTS COMPARTILHADAS
 * Backend completo para gerenciamento de wishlists
 */

import { queryDatabase } from './db';
import crypto from 'crypto';
import { cacheWishlist, invalidateWishlistCache, cacheGetOrSet } from './cache-integration';
import { redisCache } from './redis-cache';

export interface Wishlist {
  id: number;
  name: string;
  description?: string;
  creator_id?: number;
  is_public: boolean;
  share_token: string;
  created_at: string;
  updated_at: string;
  member_count?: number;
  item_count?: number;
}

export interface WishlistMember {
  id: number;
  wishlist_id: number;
  user_id?: number;
  email?: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  can_add: boolean;
  can_vote: boolean;
  can_invite: boolean;
  joined_at: string;
  user_name?: string;
  user_email?: string;
}

export interface WishlistItem {
  id: number;
  wishlist_id: number;
  item_id: number;
  item_type: string;
  added_by?: number;
  notes?: string;
  check_in?: string;
  check_out?: string;
  guests: number;
  estimated_price?: number;
  votes_up: number;
  votes_down: number;
  votes_maybe: number;
  added_at: string;
  item_title?: string;
  item_image?: string;
  item_url?: string;
}

export interface WishlistVote {
  id: number;
  item_id: number;
  user_id?: number;
  email?: string;
  vote: 'up' | 'down' | 'maybe';
  comment?: string;
  voted_at: string;
}

/**
 * Gerar token único para compartilhamento
 */
function generateShareToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Verificar permissões do usuário na wishlist
 */
export async function checkWishlistPermission(
  wishlistId: number,
  userId?: number,
  email?: string,
  requiredPermission?: 'read' | 'add' | 'vote' | 'invite' | 'admin'
): Promise<{ allowed: boolean; role?: string; member?: WishlistMember }> {
  try {
    // Buscar wishlist
    const wishlists = await queryDatabase(
      `SELECT * FROM shared_wishlists WHERE id = $1`,
      [wishlistId]
    );

    if (wishlists.length === 0) {
      return { allowed: false };
    }

    const wishlist = wishlists[0];

    // Se é pública e só precisa ler, permitir
    if (wishlist.is_public && requiredPermission === 'read') {
      return { allowed: true };
    }

    // Buscar membro
    let memberQuery = `
      SELECT * FROM wishlist_members 
      WHERE wishlist_id = $1
    `;
    const params: any[] = [wishlistId];

    if (userId) {
      memberQuery += ` AND user_id = $2`;
      params.push(userId);
    } else if (email) {
      memberQuery += ` AND email = $2`;
      params.push(email);
    } else {
      return { allowed: false };
    }

    const members = await queryDatabase(memberQuery, params);

    if (members.length === 0) {
      return { allowed: false };
    }

    const member = members[0] as WishlistMember;

    // Verificar permissão específica
    if (requiredPermission) {
      switch (requiredPermission) {
        case 'read':
          return { allowed: true, role: member.role, member };
        case 'add':
          return { allowed: member.can_add, role: member.role, member };
        case 'vote':
          return { allowed: member.can_vote, role: member.role, member };
        case 'invite':
          return { allowed: member.can_invite || member.role === 'owner' || member.role === 'admin', role: member.role, member };
        case 'admin':
          return { allowed: member.role === 'owner' || member.role === 'admin', role: member.role, member };
      }
    }

    return { allowed: true, role: member.role, member };
  } catch (error) {
    console.error('Erro ao verificar permissão:', error);
    return { allowed: false };
  }
}

/**
 * Criar wishlist
 */
export async function createWishlist(
  name: string,
  description: string | undefined,
  creatorId: number | undefined,
  isPublic: boolean = false
): Promise<Wishlist> {
  const shareToken = generateShareToken();

  const result = await queryDatabase(
    `INSERT INTO shared_wishlists (name, description, creator_id, is_public, share_token)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [name, description || null, creatorId || null, isPublic, shareToken]
  );

  const wishlist = result[0] as Wishlist;

  // Adicionar criador como owner
  if (creatorId) {
    await queryDatabase(
      `INSERT INTO wishlist_members (wishlist_id, user_id, role, can_add, can_vote, can_invite)
       VALUES ($1, $2, 'owner', true, true, true)`,
      [wishlist.id, creatorId]
    );
  }

  return wishlist;
}

/**
 * Buscar wishlist por ID ou token
 */
export async function getWishlist(
  idOrToken: number | string,
  userId?: number,
  email?: string
): Promise<Wishlist | null> {
  // Se for token, não usar cache (tokens são únicos e podem mudar)
  if (typeof idOrToken === 'string') {
    return getWishlistByToken(idOrToken, userId, email);
  }

  // Usar cache para busca por ID
  return cacheWishlist(idOrToken, async () => {
    return getWishlistById(idOrToken, userId, email);
  });
}

async function getWishlistByToken(
  token: string,
  userId?: number,
  email?: string
): Promise<Wishlist | null> {
  const wishlists = await queryDatabase(
    `SELECT * FROM shared_wishlists WHERE share_token = $1`,
    [token]
  );

  if (wishlists.length === 0) {
    return null;
  }

  const wishlist = wishlists[0] as Wishlist;

  // Verificar permissão se não for pública
  if (!wishlist.is_public) {
    const permission = await checkWishlistPermission(wishlist.id, userId, email, 'read');
    if (!permission.allowed) {
      return null;
    }
  }

  return enrichWishlist(wishlist);
}

async function getWishlistById(
  id: number,
  userId?: number,
  email?: string
): Promise<Wishlist | null> {
  const wishlists = await queryDatabase(
    `SELECT * FROM shared_wishlists WHERE id = $1`,
    [id]
  );

  if (wishlists.length === 0) {
    return null;
  }

  const wishlist = wishlists[0] as Wishlist;

  // Verificar permissão se não for pública
  if (!wishlist.is_public) {
    const permission = await checkWishlistPermission(wishlist.id, userId, email, 'read');
    if (!permission.allowed) {
      return null;
    }
  }

  return enrichWishlist(wishlist);
}

async function enrichWishlist(wishlist: Wishlist): Promise<Wishlist> {
  // Adicionar contadores
  const memberCount = await queryDatabase(
    `SELECT COUNT(*) as count FROM wishlist_members WHERE wishlist_id = $1`,
    [wishlist.id]
  );
  const itemCount = await queryDatabase(
    `SELECT COUNT(*) as count FROM wishlist_items WHERE wishlist_id = $1`,
    [wishlist.id]
  );

  wishlist.member_count = parseInt(memberCount[0].count || '0');
  wishlist.item_count = parseInt(itemCount[0].count || '0');

  return wishlist;
}

/**
 * Listar wishlists do usuário
 */
export async function listUserWishlists(
  userId?: number,
  email?: string
): Promise<Wishlist[]> {
  const cacheKey = `rsv:wishlist:user:${userId || email || 'all'}`;
  
  return cacheGetOrSet(cacheKey, async () => {
    let query = `
      SELECT DISTINCT w.*
      FROM shared_wishlists w
      LEFT JOIN wishlist_members m ON w.id = m.wishlist_id
      WHERE w.is_public = true OR m.user_id = $1 OR m.email = $2
      ORDER BY w.updated_at DESC
    `;

    const wishlists = await queryDatabase(query, [userId || null, email || null]);

    // Adicionar contadores
    for (const wishlist of wishlists) {
      const memberCount = await queryDatabase(
        `SELECT COUNT(*) as count FROM wishlist_members WHERE wishlist_id = $1`,
        [wishlist.id]
      );
      const itemCount = await queryDatabase(
        `SELECT COUNT(*) as count FROM wishlist_items WHERE wishlist_id = $1`,
        [wishlist.id]
      );

      wishlist.member_count = parseInt(memberCount[0].count || '0');
      wishlist.item_count = parseInt(itemCount[0].count || '0');
    }

    return wishlists as Wishlist[];
  }, 1800); // Cache por 30 minutos
}

/**
 * Atualizar wishlist
 */
export async function updateWishlist(
  wishlistId: number,
  updates: Partial<Pick<Wishlist, 'name' | 'description' | 'is_public'>>,
  userId?: number,
  email?: string
): Promise<Wishlist | null> {
  // Invalidar cache antes de atualizar
  await invalidateWishlistCache(wishlistId);
  // Verificar permissão admin
  const permission = await checkWishlistPermission(wishlistId, userId, email, 'admin');
  if (!permission.allowed) {
    return null;
  }

  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (updates.name !== undefined) {
    fields.push(`name = $${paramIndex++}`);
    values.push(updates.name);
  }
  if (updates.description !== undefined) {
    fields.push(`description = $${paramIndex++}`);
    values.push(updates.description);
  }
  if (updates.is_public !== undefined) {
    fields.push(`is_public = $${paramIndex++}`);
    values.push(updates.is_public);
  }

  if (fields.length === 0) {
    return await getWishlist(wishlistId, userId, email);
  }

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(wishlistId);

  const result = await queryDatabase(
    `UPDATE shared_wishlists 
     SET ${fields.join(', ')}
     WHERE id = $${paramIndex}
     RETURNING *`,
    values
  );

  return result[0] as Wishlist || null;
}

/**
 * Deletar wishlist
 */
export async function deleteWishlist(
  wishlistId: number,
  userId?: number,
  email?: string
): Promise<boolean> {
  // Invalidar cache antes de deletar
  await invalidateWishlistCache(wishlistId);
  // Verificar permissão owner
  const permission = await checkWishlistPermission(wishlistId, userId, email, 'admin');
  if (!permission.allowed || permission.role !== 'owner') {
    return false;
  }

  await queryDatabase(
    `DELETE FROM shared_wishlists WHERE id = $1`,
    [wishlistId]
  );

  return true;
}

/**
 * Adicionar item à wishlist
 */
async function invalidateWishlistRelatedCache(wishlistId: number) {
  await invalidateWishlistCache(wishlistId);
  await redisCache.delete(`rsv:wishlist:items:${wishlistId}`);
  // Invalidar cache de lista de usuários também
  await redisCache.deletePattern(`rsv:wishlist:user:*`);
}

export async function addWishlistItem(
  wishlistId: number,
  itemId: number,
  itemType: string = 'property',
  addedBy?: number,
  notes?: string,
  checkIn?: string,
  checkOut?: string,
  guests?: number,
  estimatedPrice?: number,
  userId?: number,
  email?: string
): Promise<WishlistItem | null> {
  // Verificar permissão de adicionar
  const permission = await checkWishlistPermission(wishlistId, userId, email, 'add');
  if (!permission.allowed) {
    return null;
  }

  const result = await queryDatabase(
    `INSERT INTO wishlist_items 
     (wishlist_id, item_id, item_type, added_by, notes, check_in, check_out, guests, estimated_price)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     ON CONFLICT (wishlist_id, item_id, item_type) DO UPDATE
     SET notes = COALESCE(EXCLUDED.notes, wishlist_items.notes),
         updated_at = CURRENT_TIMESTAMP
     RETURNING *`,
    [
      wishlistId,
      itemId,
      itemType,
      addedBy || userId || null,
      notes || null,
      checkIn || null,
      checkOut || null,
      guests || 2,
      estimatedPrice || null,
    ]
  );

  // Invalidar cache relacionado
  await invalidateWishlistRelatedCache(wishlistId);

  return result[0] as WishlistItem || null;
}

/**
 * Remover item da wishlist
 */
export async function removeWishlistItem(
  wishlistId: number,
  itemId: number,
  userId?: number,
  email?: string
): Promise<boolean> {
  // Verificar permissão de adicionar (mesma permissão para remover)
  const permission = await checkWishlistPermission(wishlistId, userId, email, 'add');
  if (!permission.allowed) {
    return false;
  }

  await queryDatabase(
    `DELETE FROM wishlist_items WHERE wishlist_id = $1 AND id = $2`,
    [wishlistId, itemId]
  );

  // Invalidar cache relacionado
  await invalidateWishlistRelatedCache(wishlistId);

  return true;
}

/**
 * Listar items da wishlist
 */
export async function listWishlistItems(
  wishlistId: number,
  userId?: number,
  email?: string
): Promise<WishlistItem[]> {
  // Verificar permissão de leitura
  const permission = await checkWishlistPermission(wishlistId, userId, email, 'read');
  if (!permission.allowed) {
    return [];
  }

  const cacheKey = `rsv:wishlist:items:${wishlistId}`;
  
  return cacheGetOrSet(cacheKey, async () => {
    const items = await queryDatabase(
      `SELECT * FROM wishlist_items 
       WHERE wishlist_id = $1
       ORDER BY votes_up DESC, added_at DESC`,
      [wishlistId]
    );

    return items as WishlistItem[];
  }, 600); // Cache por 10 minutos (itens podem mudar com votos)
}

/**
 * Adicionar membro à wishlist
 */
export async function addWishlistMember(
  wishlistId: number,
  userId?: number,
  email?: string,
  role: 'admin' | 'member' | 'viewer' = 'member',
  canAdd: boolean = true,
  canVote: boolean = true,
  canInvite: boolean = false,
  addedByUserId?: number,
  addedByEmail?: string
): Promise<WishlistMember | null> {
  // Verificar permissão de convidar
  const permission = await checkWishlistPermission(wishlistId, addedByUserId, addedByEmail, 'invite');
  if (!permission.allowed) {
    return null;
  }

  // Determinar permissões baseadas no role
  if (role === 'admin') {
    canAdd = true;
    canVote = true;
    canInvite = true;
  } else if (role === 'viewer') {
    canAdd = false;
    canVote = false;
    canInvite = false;
  }

  const result = await queryDatabase(
    `INSERT INTO wishlist_members 
     (wishlist_id, user_id, email, role, can_add, can_vote, can_invite)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (wishlist_id, COALESCE(user_id::text, email)) DO UPDATE
     SET role = EXCLUDED.role,
         can_add = EXCLUDED.can_add,
         can_vote = EXCLUDED.can_vote,
         can_invite = EXCLUDED.can_invite
     RETURNING *`,
    [wishlistId, userId || null, email || null, role, canAdd, canVote, canInvite]
  );

  return result[0] as WishlistMember || null;
}

/**
 * Remover membro da wishlist
 */
export async function removeWishlistMember(
  wishlistId: number,
  memberId: number,
  userId?: number,
  email?: string
): Promise<boolean> {
  // Verificar permissão admin
  const permission = await checkWishlistPermission(wishlistId, userId, email, 'admin');
  if (!permission.allowed) {
    return false;
  }

  // Não permitir remover owner
  const member = await queryDatabase(
    `SELECT role FROM wishlist_members WHERE id = $1`,
    [memberId]
  );

  if (member.length > 0 && member[0].role === 'owner') {
    return false;
  }

  await queryDatabase(
    `DELETE FROM wishlist_members WHERE id = $1`,
    [memberId]
  );

  return true;
}

/**
 * Listar membros da wishlist
 */
export async function listWishlistMembers(
  wishlistId: number,
  userId?: number,
  email?: string
): Promise<WishlistMember[]> {
  // Verificar permissão de leitura
  const permission = await checkWishlistPermission(wishlistId, userId, email, 'read');
  if (!permission.allowed) {
    return [];
  }

  const members = await queryDatabase(
    `SELECT m.*, u.name as user_name, u.email as user_email
     FROM wishlist_members m
     LEFT JOIN users u ON m.user_id = u.id
     WHERE m.wishlist_id = $1
     ORDER BY 
       CASE m.role 
         WHEN 'owner' THEN 1 
         WHEN 'admin' THEN 2 
         WHEN 'member' THEN 3 
         ELSE 4 
       END,
       m.joined_at ASC`,
    [wishlistId]
  );

  return members as WishlistMember[];
}

/**
 * ✅ ITEM 14: VOTAR EM ITEM DA WISHLIST
 */
export async function voteOnWishlistItem(
  itemId: number,
  vote: 'up' | 'down' | 'maybe',
  userId?: number,
  email?: string,
  comment?: string
): Promise<WishlistVote | null> {
  // Buscar item para verificar wishlist
  const items = await queryDatabase(
    `SELECT wishlist_id FROM wishlist_items WHERE id = $1`,
    [itemId]
  );

  if (items.length === 0) {
    return null;
  }

  const wishlistId = items[0].wishlist_id;

  // Verificar permissão de votar
  const permission = await checkWishlistPermission(wishlistId, userId, email, 'vote');
  if (!permission.allowed) {
    return null;
  }

  // Inserir ou atualizar voto
  const result = await queryDatabase(
    `INSERT INTO wishlist_votes (item_id, user_id, email, vote, comment)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (item_id, COALESCE(user_id::text, email)) DO UPDATE
     SET vote = EXCLUDED.vote,
         comment = COALESCE(EXCLUDED.comment, wishlist_votes.comment),
         voted_at = CURRENT_TIMESTAMP
     RETURNING *`,
    [itemId, userId || null, email || null, vote, comment || null]
  );

  // Invalidar cache de itens (votos mudaram)
  await invalidateWishlistRelatedCache(wishlistId);

  return result[0] as WishlistVote || null;
}

/**
 * Remover voto
 */
export async function removeVote(
  itemId: number,
  userId?: number,
  email?: string
): Promise<boolean> {
  let query = `DELETE FROM wishlist_votes WHERE item_id = $1`;
  const params: any[] = [itemId];

  if (userId) {
    query += ` AND user_id = $2`;
    params.push(userId);
  } else if (email) {
    query += ` AND email = $2`;
    params.push(email);
  } else {
    return false;
  }

  await queryDatabase(query, params);
  return true;
}

/**
 * Buscar votos de um item
 */
export async function getItemVotes(itemId: number): Promise<WishlistVote[]> {
  const votes = await queryDatabase(
    `SELECT * FROM wishlist_votes 
     WHERE item_id = $1
     ORDER BY voted_at DESC`,
    [itemId]
  );

  return votes as WishlistVote[];
}

/**
 * Calcular resultados de votação
 */
export async function calculateVotingResults(
  wishlistId: number
): Promise<{
  total_items: number;
  total_votes: number;
  items_by_votes: Array<{
    item_id: number;
    item_title?: string;
    votes_up: number;
    votes_down: number;
    votes_maybe: number;
    total_votes: number;
    score: number; // up - down
  }>;
}> {
  const items = await queryDatabase(
    `SELECT 
      i.id as item_id,
      i.votes_up,
      i.votes_down,
      i.votes_maybe,
      (i.votes_up + i.votes_down + i.votes_maybe) as total_votes,
      (i.votes_up - i.votes_down) as score
     FROM wishlist_items i
     WHERE i.wishlist_id = $1
     ORDER BY score DESC, votes_up DESC`,
    [wishlistId]
  );

  const totalVotes = items.reduce((sum: number, item: any) => sum + parseInt(item.total_votes || 0), 0);

  return {
    total_items: items.length,
    total_votes: totalVotes,
    items_by_votes: items.map((item: any) => ({
      item_id: item.item_id,
      votes_up: parseInt(item.votes_up || 0),
      votes_down: parseInt(item.votes_down || 0),
      votes_maybe: parseInt(item.votes_maybe || 0),
      total_votes: parseInt(item.total_votes || 0),
      score: parseInt(item.score || 0),
    })),
  };
}

