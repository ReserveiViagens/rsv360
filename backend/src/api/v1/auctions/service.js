const { queryDatabase } = require('../auth/refresh-token.service');

function isAuctionsDbEnabled() {
  return Boolean(process.env.DATABASE_URL);
}

function parsePositiveInt(value, fallback) {
  const n = parseInt(String(value), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function parseDecimal(value) {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function mapAuctionRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    enterprise_id: row.enterprise_id,
    property_id: row.property_id,
    accommodation_id: row.accommodation_id,
    title: row.title,
    description: row.description,
    start_price: Number(row.start_price),
    current_price: Number(row.current_price),
    min_increment: Number(row.min_increment),
    reserve_price: row.reserve_price != null ? Number(row.reserve_price) : undefined,
    start_date: row.start_date,
    end_date: row.end_date,
    status: row.status,
    winner_id: row.winner_id,
    winner_bid_id: row.winner_bid_id,
    latitude: row.latitude != null ? Number(row.latitude) : undefined,
    longitude: row.longitude != null ? Number(row.longitude) : undefined,
    image_url: row.image_url,
    total_bids: row.total_bids != null ? Number(row.total_bids) : undefined,
    highest_bid: row.highest_bid != null ? Number(row.highest_bid) : undefined,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function mapBidRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    auction_id: row.auction_id,
    customer_id: row.customer_id,
    amount: Number(row.amount),
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
    customer_name: row.customer_name,
    customer_email: row.customer_email,
  };
}

async function syncAuctionStatuses() {
  const now = new Date().toISOString();
  await queryDatabase(
    `UPDATE auctions SET status = 'active', updated_at = CURRENT_TIMESTAMP
     WHERE status = 'scheduled' AND start_date <= $1 AND end_date > $1`,
    [now]
  );
  await queryDatabase(
    `UPDATE auctions SET status = 'finished', updated_at = CURRENT_TIMESTAMP
     WHERE status IN ('scheduled', 'active') AND end_date <= $1`,
    [now]
  );
}

async function listAuctions(filters = {}) {
  await syncAuctionStatuses();

  const page = parsePositiveInt(filters.page, 1);
  const limit = Math.min(parsePositiveInt(filters.limit, 12), 100);
  const offset = (page - 1) * limit;

  const conditions = [];
  const params = [];
  let idx = 1;

  if (filters.status) {
    conditions.push(`a.status = $${idx++}`);
    params.push(filters.status);
  }
  if (filters.enterprise_id) {
    conditions.push(`a.enterprise_id = $${idx++}`);
    params.push(filters.enterprise_id);
  }
  if (filters.property_id) {
    conditions.push(`a.property_id = $${idx++}`);
    params.push(filters.property_id);
  }
  if (filters.search) {
    conditions.push(`(a.title ILIKE $${idx} OR a.description ILIKE $${idx})`);
    params.push(`%${filters.search}%`);
    idx += 1;
  }
  if (filters.minPrice != null) {
    conditions.push(`a.current_price >= $${idx++}`);
    params.push(filters.minPrice);
  }
  if (filters.maxPrice != null) {
    conditions.push(`a.current_price <= $${idx++}`);
    params.push(filters.maxPrice);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const countRows = await queryDatabase(
    `SELECT COUNT(*)::int AS total FROM auctions a ${where}`,
    params
  );
  const total = countRows?.[0]?.total ?? 0;

  const rows = await queryDatabase(
    `SELECT a.*,
            COUNT(b.id)::int AS total_bids,
            MAX(b.amount) AS highest_bid
     FROM auctions a
     LEFT JOIN bids b ON b.auction_id = a.id
     ${where}
     GROUP BY a.id
     ORDER BY a.end_date ASC
     LIMIT $${idx} OFFSET $${idx + 1}`,
    [...params, limit, offset]
  );

  return {
    data: (rows || []).map(mapAuctionRow),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 0,
    },
  };
}

async function listActiveAuctions(filters = {}) {
  await syncAuctionStatuses();
  const conditions = [`a.status = 'active'`];
  const params = [];
  let idx = 1;

  if (filters.enterprise_id) {
    conditions.push(`a.enterprise_id = $${idx++}`);
    params.push(filters.enterprise_id);
  }
  if (filters.search) {
    conditions.push(`(a.title ILIKE $${idx} OR a.description ILIKE $${idx})`);
    params.push(`%${filters.search}%`);
    idx += 1;
  }

  const rows = await queryDatabase(
    `SELECT a.*,
            COUNT(b.id)::int AS total_bids,
            MAX(b.amount) AS highest_bid
     FROM auctions a
     LEFT JOIN bids b ON b.auction_id = a.id
     WHERE ${conditions.join(' AND ')}
     GROUP BY a.id
     ORDER BY a.end_date ASC`,
    params
  );

  return (rows || []).map(mapAuctionRow);
}

async function getAuctionMapData() {
  await syncAuctionStatuses();
  const rows = await queryDatabase(
    `SELECT id, latitude AS lat, longitude AS lng, title, current_price, status
     FROM auctions
     WHERE status = 'active' AND latitude IS NOT NULL AND longitude IS NOT NULL
     ORDER BY end_date ASC`
  );
  return (rows || []).map((row) => ({
    id: row.id,
    lat: Number(row.lat),
    lng: Number(row.lng),
    title: row.title,
    current_price: Number(row.current_price),
    status: row.status,
  }));
}

async function getAuctionById(id) {
  await syncAuctionStatuses();
  const rows = await queryDatabase(
    `SELECT a.*,
            COUNT(b.id)::int AS total_bids,
            MAX(b.amount) AS highest_bid
     FROM auctions a
     LEFT JOIN bids b ON b.auction_id = a.id
     WHERE a.id = $1
     GROUP BY a.id`,
    [id]
  );
  return mapAuctionRow(rows?.[0]);
}

async function listBids(auctionId) {
  const rows = await queryDatabase(
    `SELECT b.*, c.name AS customer_name, c.email AS customer_email
     FROM bids b
     LEFT JOIN customers c ON c.id = b.customer_id
     WHERE b.auction_id = $1
     ORDER BY b.amount DESC, b.created_at DESC`,
    [auctionId]
  );
  return (rows || []).map(mapBidRow);
}

async function resolveCustomerForUser({ userId, email, name }) {
  const existing = await queryDatabase('SELECT id FROM customers WHERE user_id = $1', [userId]);
  if (existing?.[0]?.id) return existing[0].id;

  const safeEmail = email || `user${userId}@local.dev`;
  const safeName = name || `Usuário ${userId}`;

  const byEmail = await queryDatabase('SELECT id, user_id FROM customers WHERE email = $1', [
    safeEmail,
  ]);
  if (byEmail?.[0]?.id) {
    if (!byEmail[0].user_id) {
      await queryDatabase('UPDATE customers SET user_id = $1 WHERE id = $2', [
        userId,
        byEmail[0].id,
      ]);
    }
    return byEmail[0].id;
  }

  const inserted = await queryDatabase(
    `INSERT INTO customers (user_id, name, email, is_active, is_verified)
     VALUES ($1, $2, $3, true, false)
     RETURNING id`,
    [userId, safeName, safeEmail]
  );
  return inserted?.[0]?.id ?? null;
}

async function placeBid(auctionId, user, amount) {
  const bidAmount = parseDecimal(amount);
  if (bidAmount == null || bidAmount <= 0) {
    return { error: 'validation', status: 400, message: 'Valor do lance inválido' };
  }

  const auction = await getAuctionById(auctionId);
  if (!auction) {
    return { error: 'not_found', status: 404, message: 'Leilão não encontrado' };
  }
  if (auction.status !== 'active') {
    return { error: 'validation', status: 400, message: 'Leilão não está ativo para lances' };
  }

  const minAllowed = Number(auction.current_price) + Number(auction.min_increment);
  if (bidAmount < minAllowed) {
    return {
      error: 'validation',
      status: 400,
      message: `Lance mínimo: R$ ${minAllowed.toFixed(2)}`,
    };
  }

  const customerId = await resolveCustomerForUser(user);
  if (!customerId) {
    return { error: 'validation', status: 400, message: 'Não foi possível identificar o cliente' };
  }

  await queryDatabase(
    `UPDATE bids SET status = 'outbid', updated_at = CURRENT_TIMESTAMP
     WHERE auction_id = $1 AND status = 'accepted'`,
    [auctionId]
  );

  const inserted = await queryDatabase(
    `INSERT INTO bids (auction_id, customer_id, amount, status)
     VALUES ($1, $2, $3, 'accepted')
     RETURNING *`,
    [auctionId, customerId, bidAmount]
  );

  const bid = inserted?.[0];
  if (!bid) {
    return { error: 'server', status: 503, message: 'Não foi possível registrar o lance' };
  }

  await queryDatabase(
    `UPDATE auctions
     SET current_price = $1, winner_id = $2, winner_bid_id = $3, updated_at = CURRENT_TIMESTAMP
     WHERE id = $4`,
    [bidAmount, customerId, bid.id, auctionId]
  );

  const rows = await queryDatabase(
    `SELECT b.*, c.name AS customer_name, c.email AS customer_email
     FROM bids b
     LEFT JOIN customers c ON c.id = b.customer_id
     WHERE b.id = $1`,
    [bid.id]
  );

  return { bid: mapBidRow(rows?.[0]) };
}

async function createAuction(payload) {
  const title = typeof payload.title === 'string' ? payload.title.trim() : '';
  const startPrice = parseDecimal(payload.start_price ?? payload.starting_price);
  const startDate = payload.start_date;
  const endDate = payload.end_date;

  if (!title || startPrice == null || !startDate || !endDate) {
    return {
      error: 'validation',
      status: 400,
      message: 'title, start_price, start_date e end_date são obrigatórios',
    };
  }

  const minIncrement = parseDecimal(payload.min_increment) ?? 10;
  const currentPrice = parseDecimal(payload.current_price) ?? startPrice;

  const rows = await queryDatabase(
    `INSERT INTO auctions (
       enterprise_id, property_id, accommodation_id, title, description,
       start_price, current_price, min_increment, reserve_price,
       start_date, end_date, status, latitude, longitude, image_url
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
     RETURNING *`,
    [
      payload.enterprise_id ?? null,
      payload.property_id ?? null,
      payload.accommodation_id ?? null,
      title,
      payload.description ?? null,
      startPrice,
      currentPrice,
      minIncrement,
      payload.reserve_price ?? null,
      startDate,
      endDate,
      payload.status ?? 'scheduled',
      payload.latitude ?? null,
      payload.longitude ?? null,
      payload.image_url ?? null,
    ]
  );

  return { auction: mapAuctionRow(rows?.[0]) };
}

module.exports = {
  isAuctionsDbEnabled,
  listAuctions,
  listActiveAuctions,
  getAuctionMapData,
  getAuctionById,
  listBids,
  placeBid,
  createAuction,
};
