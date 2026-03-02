/**
 * ✅ WISHLISTS COMPARTILHADAS COM VOTAÇÃO AVANÇADA
 * Sistema completo de votação com ranking, comentários e estatísticas
 */

import { queryDatabase } from './db';

export interface VoteResult {
  itemId: number;
  totalVotes: number;
  votesUp: number;
  votesDown: number;
  votesMaybe: number;
  score: number; // votesUp - votesDown
  ranking: number;
  comments: VoteComment[];
  consensus: 'strong_yes' | 'yes' | 'maybe' | 'no' | 'strong_no';
}

export interface VoteComment {
  id: number;
  userId?: number;
  userEmail?: string;
  userName?: string;
  comment: string;
  vote: 'up' | 'down' | 'maybe';
  createdAt: string;
}

export interface VotingStatistics {
  totalItems: number;
  totalVotes: number;
  averageScore: number;
  mostVoted: VoteResult;
  leastVoted: VoteResult;
  consensusItems: VoteResult[];
  disputedItems: VoteResult[];
}

/**
 * Votar em item da wishlist
 */
export async function voteOnWishlistItem(
  itemId: number,
  userId: number | undefined,
  email: string | undefined,
  vote: 'up' | 'down' | 'maybe',
  comment?: string
): Promise<VoteResult> {
  // Verificar se já votou
  const existingVote = await queryDatabase(
    `SELECT * FROM wishlist_votes 
     WHERE item_id = $1 AND (user_id = $2 OR email = $3)`,
    [itemId, userId || null, email || null]
  );

  if (existingVote.length > 0) {
    // Atualizar voto existente
    await queryDatabase(
      `UPDATE wishlist_votes 
       SET vote = $1, comment = $2, voted_at = NOW()
       WHERE id = $3`,
      [vote, comment || null, existingVote[0].id]
    );
  } else {
    // Criar novo voto
    await queryDatabase(
      `INSERT INTO wishlist_votes (item_id, user_id, email, vote, comment)
       VALUES ($1, $2, $3, $4, $5)`,
      [itemId, userId || null, email || null, vote, comment || null]
    );
  }

  // Atualizar contadores no item
  const voteCounts = await queryDatabase(
    `SELECT 
       COUNT(*) FILTER (WHERE vote = 'up') as votes_up,
       COUNT(*) FILTER (WHERE vote = 'down') as votes_down,
       COUNT(*) FILTER (WHERE vote = 'maybe') as votes_maybe
     FROM wishlist_votes
     WHERE item_id = $1`,
    [itemId]
  );

  const counts = voteCounts[0];
  await queryDatabase(
    `UPDATE wishlist_items 
     SET votes_up = $1, votes_down = $2, votes_maybe = $3
     WHERE id = $4`,
    [counts.votes_up, counts.votes_down, counts.votes_maybe, itemId]
  );

  return getVoteResult(itemId);
}

/**
 * Obter resultado de votação de um item
 */
export async function getVoteResult(itemId: number): Promise<VoteResult> {
  const item = await queryDatabase(
    `SELECT * FROM wishlist_items WHERE id = $1`,
    [itemId]
  );

  if (item.length === 0) {
    throw new Error('Item não encontrado');
  }

  const votes = await queryDatabase(
    `SELECT v.*, u.name as user_name, u.email as user_email
     FROM wishlist_votes v
     LEFT JOIN users u ON v.user_id = u.id
     WHERE v.item_id = $1
     ORDER BY v.voted_at DESC`,
    [itemId]
  );

  const votesUp = votes.filter((v: any) => v.vote === 'up').length;
  const votesDown = votes.filter((v: any) => v.vote === 'down').length;
  const votesMaybe = votes.filter((v: any) => v.vote === 'maybe').length;
  const totalVotes = votes.length;
  const score = votesUp - votesDown;

  // Determinar consenso
  let consensus: VoteResult['consensus'] = 'maybe';
  if (totalVotes === 0) {
    consensus = 'maybe';
  } else if (votesUp / totalVotes >= 0.8) {
    consensus = 'strong_yes';
  } else if (votesUp / totalVotes >= 0.6) {
    consensus = 'yes';
  } else if (votesDown / totalVotes >= 0.6) {
    consensus = 'no';
  } else if (votesDown / totalVotes >= 0.8) {
    consensus = 'strong_no';
  }

  return {
    itemId,
    totalVotes,
    votesUp,
    votesDown,
    votesMaybe,
    score,
    ranking: 0, // Será calculado depois
    comments: votes
      .filter((v: any) => v.comment)
      .map((v: any) => ({
        id: v.id,
        userId: v.user_id,
        userEmail: v.user_email || v.email,
        userName: v.user_name,
        comment: v.comment,
        vote: v.vote,
        createdAt: v.voted_at,
      })),
    consensus,
  };
}

/**
 * Obter ranking de itens da wishlist
 */
export async function getWishlistRanking(wishlistId: number): Promise<VoteResult[]> {
  const items = await queryDatabase(
    `SELECT id FROM wishlist_items WHERE wishlist_id = $1`,
    [wishlistId]
  );

  const results = await Promise.all(
    items.map((item: any) => getVoteResult(item.id))
  );

  // Ordenar por score e adicionar ranking
  results.sort((a, b) => b.score - a.score);
  results.forEach((result, index) => {
    result.ranking = index + 1;
  });

  return results;
}

/**
 * Obter estatísticas de votação da wishlist
 */
export async function getVotingStatistics(wishlistId: number): Promise<VotingStatistics> {
  const ranking = await getWishlistRanking(wishlistId);

  const totalItems = ranking.length;
  const totalVotes = ranking.reduce((sum, r) => sum + r.totalVotes, 0);
  const averageScore = totalItems > 0 
    ? ranking.reduce((sum, r) => sum + r.score, 0) / totalItems 
    : 0;

  const mostVoted = ranking[0] || null;
  const leastVoted = ranking[ranking.length - 1] || null;

  const consensusItems = ranking.filter(
    (r) => r.consensus === 'strong_yes' || r.consensus === 'yes'
  );

  const disputedItems = ranking.filter(
    (r) => r.totalVotes > 0 && 
           Math.abs(r.votesUp - r.votesDown) <= 2 &&
           r.consensus === 'maybe'
  );

  return {
    totalItems,
    totalVotes,
    averageScore,
    mostVoted: mostVoted!,
    leastVoted: leastVoted!,
    consensusItems,
    disputedItems,
  };
}

/**
 * Obter itens por consenso
 */
export async function getItemsByConsensus(
  wishlistId: number,
  consensus: VoteResult['consensus']
): Promise<VoteResult[]> {
  const ranking = await getWishlistRanking(wishlistId);
  return ranking.filter((r) => r.consensus === consensus);
}

