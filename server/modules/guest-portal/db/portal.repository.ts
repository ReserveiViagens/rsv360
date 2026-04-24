import { Pool } from 'pg';

type Row = Record<string, any>;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const tableCache = new Map<string, string | null>();
const columnsCache = new Map<string, string[]>();

function quoteIdent(identifier: string) {
  return `"${identifier.replace(/"/g, '""')}"`;
}

function toDateOnly(value: unknown) {
  if (!value) return null;
  const date = new Date(value as any);
  if (Number.isNaN(date.getTime())) return null;
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function pickFirst<T>(values: Array<T | null | undefined>) {
  return values.find((value) => value !== null && value !== undefined);
}

function getBookingIdentifier(row: Row | null) {
  if (!row) return null;
  return pickFirst([row.id, row.booking_id, row.bookingId, row.reservation_id, row.reservationId]);
}

export class PortalRepository {
  pickFirst<T>(values: Array<T | null | undefined>) {
    return pickFirst(values);
  }

  async query(text: string, values: any[] = []) {
    return pool.query(text, values);
  }

  async resolveTable(candidates: string[]) {
    const cacheKey = candidates.join('|');
    if (tableCache.has(cacheKey)) {
      return tableCache.get(cacheKey);
    }

    for (const candidate of candidates) {
      const qualified = `public.${candidate}`;
      const result = await this.query('select to_regclass($1) as regclass', [qualified]);

      if (result.rows[0]?.regclass) {
        tableCache.set(cacheKey, candidate);
        return candidate;
      }
    }

    tableCache.set(cacheKey, null);
    return null;
  }

  async getColumns(table: string) {
    if (columnsCache.has(table)) {
      return columnsCache.get(table) || [];
    }

    const result = await this.query(
      `select column_name
       from information_schema.columns
       where table_schema = 'public' and table_name = $1
       order by ordinal_position`,
      [table]
    );

    const columns = result.rows.map((row) => row.column_name as string);
    columnsCache.set(table, columns);
    return columns;
  }

  async hasTable(candidates: string[]) {
    return Boolean(await this.resolveTable(candidates));
  }

  async getBookingTable() {
    return this.resolveTable(['bookings', 'reservations', 'booking']);
  }

  async getGuestTable() {
    return this.resolveTable(['guests', 'guest_profiles', 'guest_profile', 'guest_contacts']);
  }

  async getTokenTable() {
    return this.resolveTable(['guest_portal_tokens', 'portal_tokens', 'guest_tokens']);
  }

  async getRequestTable() {
    return this.resolveTable(['guest_requests', 'portal_requests', 'guest_portal_requests']);
  }

  async getFeedbackTable() {
    return this.resolveTable(['guest_feedback', 'portal_feedback', 'guest_reviews']);
  }

  async getBookingById(bookingId: string) {
    const table = await this.getBookingTable();
    if (!table) return null;

    const columns = await this.getColumns(table);
    const idColumn = this.pickColumn(columns, ['id', 'booking_id']);
    if (!idColumn) return null;

    const result = await this.query(
      `select * from ${quoteIdent(table)} where ${quoteIdent(idColumn)} = $1 limit 1`,
      [bookingId]
    );

    return result.rows[0] || null;
  }

  async findGuestForBooking(booking: Row | null, bookingId: string) {
    const guestTable = await this.getGuestTable();
    if (!guestTable) {
      return this.buildGuestFromBooking(booking);
    }

    const columns = await this.getColumns(guestTable);
    const bookingColumn = this.pickColumn(columns, ['booking_id', 'reservation_id']);
    const guestIdColumn = this.pickColumn(columns, ['id', 'guest_id']);
    const emailColumn = this.pickColumn(columns, ['email', 'guest_email']);

    let queryResult = null;
    if (bookingColumn) {
      queryResult = await this.query(
        `select * from ${quoteIdent(guestTable)} where ${quoteIdent(bookingColumn)} = $1 limit 1`,
        [bookingId]
      );
    }

    if ((!queryResult || !queryResult.rows[0]) && guestIdColumn && booking) {
      const bookingGuestId = this.pickFirst([
        booking.guest_id,
        booking.guestId,
        booking.guest_profile_id,
        booking.guestProfileId,
      ]);

      if (bookingGuestId) {
        queryResult = await this.query(
          `select * from ${quoteIdent(guestTable)} where ${quoteIdent(guestIdColumn)} = $1 limit 1`,
          [bookingGuestId]
        );
      }
    }

    if ((!queryResult || !queryResult.rows[0]) && emailColumn && booking) {
      const bookingEmail = this.pickFirst([
        booking.guest_email,
        booking.guestEmail,
        booking.email,
      ]);

      if (bookingEmail) {
        queryResult = await this.query(
          `select * from ${quoteIdent(guestTable)} where ${quoteIdent(emailColumn)} = $1 limit 1`,
          [bookingEmail]
        );
      }
    }

    return queryResult?.rows[0] || this.buildGuestFromBooking(booking);
  }

  async insertPortalToken(data: Row) {
    const table = await this.getTokenTable();
    if (!table) {
      throw new Error('Tabela guest_portal_tokens não encontrada');
    }

    return this.insertRow(table, data);
  }

  async findValidToken(token: string) {
    const table = await this.getTokenTable();
    if (!table) return null;

    const columns = await this.getColumns(table);
    const tokenColumn = this.pickColumn(columns, ['token']);
    const activeColumn = this.pickColumn(columns, ['is_active', 'active']);
    const expiresColumn = this.pickColumn(columns, ['expires_at', 'expiresAt']);
    const bookingColumn = this.pickColumn(columns, ['booking_id']);

    if (!tokenColumn) return null;

    const conditions = [`${quoteIdent(tokenColumn)} = $1`];
    const params = [token];

    if (activeColumn) {
      conditions.push(`${quoteIdent(activeColumn)} = true`);
    }

    if (expiresColumn) {
      conditions.push(`(${quoteIdent(expiresColumn)} is null or ${quoteIdent(expiresColumn)} > now())`);
    }

    const result = await this.query(
      `select * from ${quoteIdent(table)} where ${conditions.join(' and ')} limit 1`,
      params
    );

    const tokenRow = result.rows[0];
    if (!tokenRow) return null;

    const bookingId = bookingColumn ? tokenRow[bookingColumn] : tokenRow.booking_id;
    const booking = bookingId ? await this.getBookingById(String(bookingId)) : null;
    const guest = booking ? await this.findGuestForBooking(booking, String(bookingId)) : null;

    return { token: tokenRow, booking, guest };
  }

  async touchToken(token: string) {
    const table = await this.getTokenTable();
    if (!table) return;

    const columns = await this.getColumns(table);
    const tokenColumn = this.pickColumn(columns, ['token']);
    const lastAccessedColumn = this.pickColumn(columns, ['last_accessed_at', 'lastAccessedAt']);
    const accessCountColumn = this.pickColumn(columns, ['access_count', 'accessCount']);
    const updatedAtColumn = this.pickColumn(columns, ['updated_at', 'updatedAt']);
    const setParts = [];

    if (lastAccessedColumn) {
      setParts.push(`${quoteIdent(lastAccessedColumn)} = now()`);
    }
    if (accessCountColumn) {
      setParts.push(`${quoteIdent(accessCountColumn)} = coalesce(${quoteIdent(accessCountColumn)}, 0) + 1`);
    }
    if (updatedAtColumn) {
      setParts.push(`${quoteIdent(updatedAtColumn)} = now()`);
    }

    if (!tokenColumn || setParts.length === 0) return;

    await this.query(
      `update ${quoteIdent(table)} set ${setParts.join(', ')} where ${quoteIdent(tokenColumn)} = $1`,
      [token]
    );
  }

  async revokeToken(bookingId: string) {
    const table = await this.getTokenTable();
    if (!table) return 0;

    const columns = await this.getColumns(table);
    const bookingColumn = this.pickColumn(columns, ['booking_id']);
    const activeColumn = this.pickColumn(columns, ['is_active', 'active']);
    const updatedAtColumn = this.pickColumn(columns, ['updated_at', 'updatedAt']);
    if (!bookingColumn || !activeColumn) return 0;

    const setParts = [`${quoteIdent(activeColumn)} = false`];
    if (updatedAtColumn) {
      setParts.push(`${quoteIdent(updatedAtColumn)} = now()`);
    }

    const result = await this.query(
      `update ${quoteIdent(table)} set ${setParts.join(', ')} where ${quoteIdent(bookingColumn)} = $1`,
      [bookingId]
    );

    return result.rowCount || 0;
  }

  async revokeExpiredTokens() {
    const table = await this.getTokenTable();
    if (!table) return 0;

    const columns = await this.getColumns(table);
    const activeColumn = this.pickColumn(columns, ['is_active', 'active']);
    const expiresColumn = this.pickColumn(columns, ['expires_at', 'expiresAt']);
    const updatedAtColumn = this.pickColumn(columns, ['updated_at', 'updatedAt']);
    if (!activeColumn || !expiresColumn) return 0;

    const setParts = [`${quoteIdent(activeColumn)} = false`];
    if (updatedAtColumn) {
      setParts.push(`${quoteIdent(updatedAtColumn)} = now()`);
    }

    const result = await this.query(
      `update ${quoteIdent(table)} set ${setParts.join(', ')} where ${quoteIdent(activeColumn)} = true and ${quoteIdent(expiresColumn)} < now()`,
      []
    );

    return result.rowCount || 0;
  }

  async updateBookingStatus(bookingId: string, updates: Row) {
    const table = await this.getBookingTable();
    if (!table) {
      throw new Error('Tabela bookings não encontrada');
    }

    return this.updateRowById(table, bookingId, updates);
  }

  async upsertGuestForBooking(bookingId: string, guestData: Row, booking: Row | null) {
    const guestTable = await this.getGuestTable();
    if (!guestTable) {
      return this.buildGuestFromBooking(booking, guestData);
    }

    const columns = await this.getColumns(guestTable);
    const bookingColumn = this.pickColumn(columns, ['booking_id', 'reservation_id']);
    const emailColumn = this.pickColumn(columns, ['email', 'guest_email']);
    const documentColumn = this.pickColumn(columns, ['document', 'cpf', 'identity_document']);
    const idColumn = this.pickColumn(columns, ['id', 'guest_id']);

    const whereParts = [];
    const params = [];

    if (bookingColumn) {
      whereParts.push(`${quoteIdent(bookingColumn)} = $${params.length + 1}`);
      params.push(bookingId);
    }

    const documentValue = pickFirst([guestData.document, guestData.cpf, guestData.identityDocument]);
    const emailValue = pickFirst([guestData.email, guestData.guest_email]);

    if (documentColumn && documentValue) {
      whereParts.push(`${quoteIdent(documentColumn)} = $${params.length + 1}`);
      params.push(documentValue);
    } else if (emailColumn && emailValue) {
      whereParts.push(`${quoteIdent(emailColumn)} = $${params.length + 1}`);
      params.push(emailValue);
    }

    let existing = null;
    if (whereParts.length > 0) {
      existing = await this.query(
        `select * from ${quoteIdent(guestTable)} where ${whereParts.join(' or ')} limit 1`,
        params
      );
    }

    const payload = {
      ...booking,
      ...guestData,
      booking_id: bookingId,
      updated_at: new Date(),
    };

    const row = existing?.rows[0];
    if (row && idColumn) {
      return this.updateRowByColumn(guestTable, idColumn, row[idColumn], payload);
    }

    return this.insertRow(guestTable, payload);
  }

  async insertRequest(data: Row) {
    const table = await this.getRequestTable();
    if (!table) {
      throw new Error('Tabela guest_requests não encontrada');
    }

    return this.insertRow(table, data);
  }

  async listRequests(bookingId?: string) {
    const table = await this.getRequestTable();
    if (!table) return [];

    const columns = await this.getColumns(table);
    const bookingColumn = this.pickColumn(columns, ['booking_id']);
    const orderColumn = this.pickColumn(columns, ['created_at', 'createdAt']) || 'created_at';
    if (!bookingId || !bookingColumn) {
      const result = await this.query(`select * from ${quoteIdent(table)} order by ${quoteIdent(orderColumn)} desc`);
      return result.rows;
    }

    const result = await this.query(
      `select * from ${quoteIdent(table)} where ${quoteIdent(bookingColumn)} = $1 order by ${quoteIdent(orderColumn)} desc`,
      [bookingId]
    );
    return result.rows;
  }

  async getRequestById(requestId: string) {
    const table = await this.getRequestTable();
    if (!table) return null;

    const columns = await this.getColumns(table);
    const idColumn = this.pickColumn(columns, ['id', 'request_id']);
    if (!idColumn) return null;

    const result = await this.query(
      `select * from ${quoteIdent(table)} where ${quoteIdent(idColumn)} = $1 limit 1`,
      [requestId]
    );

    return result.rows[0] || null;
  }

  async updateRequest(requestId: string, updates: Row) {
    const table = await this.getRequestTable();
    if (!table) {
      throw new Error('Tabela guest_requests não encontrada');
    }

    return this.updateRowById(table, requestId, updates);
  }

  async insertFeedback(data: Row) {
    const table = await this.getFeedbackTable();
    if (!table) {
      throw new Error('Tabela guest_feedback não encontrada');
    }

    return this.insertRow(table, data);
  }

  async getFeedbackByBooking(bookingId: string) {
    const table = await this.getFeedbackTable();
    if (!table) return [];

    const columns = await this.getColumns(table);
    const bookingColumn = this.pickColumn(columns, ['booking_id']);
    const orderColumn = this.pickColumn(columns, ['created_at', 'createdAt']) || 'created_at';
    if (!bookingColumn) return [];

    const result = await this.query(
      `select * from ${quoteIdent(table)} where ${quoteIdent(bookingColumn)} = $1 order by ${quoteIdent(orderColumn)} desc`,
      [bookingId]
    );
    return result.rows;
  }

  async listFeedback(filters: Row = {}) {
    const table = await this.getFeedbackTable();
    if (!table) {
      return { data: [], total: 0 };
    }

    const columns = await this.getColumns(table);
    const bookingColumn = this.pickColumn(columns, ['booking_id']);
    const ratingColumn = this.pickColumn(columns, ['overall_rating', 'rating', 'score']);
    const publishedColumn = this.pickColumn(columns, ['is_published', 'published']);
    const createdColumn = this.pickColumn(columns, ['created_at', 'createdAt']) || 'created_at';

    const conditions = [];
    const params = [];

    if (filters.min_rating !== undefined && ratingColumn) {
      conditions.push(`${quoteIdent(ratingColumn)} >= $${params.length + 1}`);
      params.push(Number(filters.min_rating));
    }
    if (filters.max_rating !== undefined && ratingColumn) {
      conditions.push(`${quoteIdent(ratingColumn)} <= $${params.length + 1}`);
      params.push(Number(filters.max_rating));
    }
    if (filters.is_published !== undefined && publishedColumn) {
      conditions.push(`${quoteIdent(publishedColumn)} = $${params.length + 1}`);
      params.push(Boolean(filters.is_published));
    }
    if (filters.date_from && createdColumn) {
      conditions.push(`${quoteIdent(createdColumn)} >= $${params.length + 1}`);
      params.push(filters.date_from);
    }
    if (filters.date_to && createdColumn) {
      conditions.push(`${quoteIdent(createdColumn)} <= $${params.length + 1}`);
      params.push(filters.date_to);
    }

    const page = Math.max(Number(filters.page || 1), 1);
    const limit = Math.max(Number(filters.limit || 20), 1);
    const offset = (page - 1) * limit;

    const whereClause = conditions.length > 0 ? `where ${conditions.join(' and ')}` : '';
    const result = await this.query(
      `select * from ${quoteIdent(table)} ${whereClause} order by ${quoteIdent(createdColumn)} desc limit $${params.length + 1} offset $${params.length + 2}`,
      [...params, limit, offset]
    );

    let total = result.rowCount || 0;
    if (bookingColumn) {
      const countResult = await this.query(
        `select count(*)::int as total from ${quoteIdent(table)} ${whereClause}`,
        params
      );
      total = countResult.rows[0]?.total || total;
    }

    return { data: result.rows, total, page, limit };
  }

  async updateFeedback(feedbackId: string, updates: Row) {
    const table = await this.getFeedbackTable();
    if (!table) {
      throw new Error('Tabela guest_feedback não encontrada');
    }

    return this.updateRowById(table, feedbackId, updates);
  }

  async getFeedbackStats() {
    const table = await this.getFeedbackTable();
    if (!table) {
      return {
        total: 0,
        average: {},
        recommendationRate: 0,
        ratings: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    const columns = await this.getColumns(table);
    const ratingColumn = this.pickColumn(columns, ['overall_rating', 'rating', 'score']);
    const recommendColumn = this.pickColumn(columns, ['would_recommend', 'wouldRecommend']);
    if (!ratingColumn) {
      return {
        total: 0,
        average: {},
        recommendationRate: 0,
        ratings: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    const avgColumns = [
      'cleanliness',
      'comfort',
      'location',
      'service',
      'value_for_money',
    ].filter((column) => columns.includes(column));

    const averagesSql = avgColumns.length > 0
      ? avgColumns.map((column) => `avg(${quoteIdent(column)})::float as ${column}`).join(', ')
      : '';

    const recommendSql = recommendColumn
      ? `, round((sum(case when ${quoteIdent(recommendColumn)} = true then 1 else 0 end)::numeric / nullif(count(*), 0)) * 100, 2) as recommendation_rate`
      : '';

    const ratingCases = [1, 2, 3, 4, 5]
      .map((rating) => `sum(case when ${quoteIdent(ratingColumn)} = ${rating} then 1 else 0 end)::int as rating_${rating}`)
      .join(', ');

    const result = await this.query(
      `select count(*)::int as total, avg(${quoteIdent(ratingColumn)})::float as overall_average${averagesSql ? `, ${averagesSql}` : ''}${recommendSql ? recommendSql : ''}, ${ratingCases} from ${quoteIdent(table)}`,
      []
    );

    const row = result.rows[0] || {};
    const average: Row = {};
    for (const column of avgColumns) {
      average[column] = row[column] ?? null;
    }

    return {
      total: row.total || 0,
      average: {
        overall_rating: row.overall_average ?? null,
        ...average,
      },
      recommendationRate: row.recommendation_rate || 0,
      ratings: {
        1: row.rating_1 || 0,
        2: row.rating_2 || 0,
        3: row.rating_3 || 0,
        4: row.rating_4 || 0,
        5: row.rating_5 || 0,
      },
    };
  }

  async insertRow(table: string, data: Row) {
    const columns = await this.getColumns(table);
    const entries = Object.entries(data).filter(([key, value]) => columns.includes(key) && value !== undefined);

    if (entries.length === 0) {
      return {};
    }

    const insertColumns = entries.map(([key]) => quoteIdent(key)).join(', ');
    const placeholders = entries.map((_, index) => `$${index + 1}`).join(', ');
    const values = entries.map(([, value]) => value);
    const result = await this.query(
      `insert into ${quoteIdent(table)} (${insertColumns}) values (${placeholders}) returning *`,
      values
    );

    return result.rows[0] || {};
  }

  async updateRowById(table: string, id: string, updates: Row) {
    const columns = await this.getColumns(table);
    const idColumn = this.pickColumn(columns, ['id', `${table.slice(0, -1)}_id`]) || 'id';
    return this.updateRowByColumn(table, idColumn, id, updates);
  }

  async updateRowByColumn(table: string, column: string, value: any, updates: Row) {
    const columns = await this.getColumns(table);
    const entries = Object.entries(updates).filter(([key, updateValue]) => columns.includes(key) && updateValue !== undefined);

    if (entries.length === 0) {
      const result = await this.query(
        `select * from ${quoteIdent(table)} where ${quoteIdent(column)} = $1 limit 1`,
        [value]
      );
      return result.rows[0] || {};
    }

    const setSql = entries.map(([key], index) => `${quoteIdent(key)} = $${index + 1}`).join(', ');
    const values = entries.map(([, updateValue]) => updateValue);
    values.push(value);

    const result = await this.query(
      `update ${quoteIdent(table)} set ${setSql} where ${quoteIdent(column)} = $${values.length} returning *`,
      values
    );

    return result.rows[0] || {};
  }

  private pickColumn(columns: string[], candidates: string[]) {
    return candidates.find((candidate) => columns.includes(candidate));
  }

  private buildGuestFromBooking(booking: Row | null, guestData: Row = {}) {
    if (!booking && Object.keys(guestData).length === 0) {
      return null;
    }

    return {
      id: booking?.guest_id || booking?.guestId || guestData.id || null,
      booking_id: booking?.id || guestData.booking_id || null,
      name: pickFirst([
        guestData.name,
        guestData.full_name,
        booking?.guest_name,
        booking?.name,
        booking?.full_name,
      ]),
      email: pickFirst([
        guestData.email,
        booking?.guest_email,
        booking?.email,
      ]),
      document: pickFirst([
        guestData.document,
        guestData.cpf,
        booking?.document,
      ]),
      phone: pickFirst([
        guestData.phone,
        booking?.guest_phone,
        booking?.phone,
      ]),
      metadata: {
        ...(booking?.metadata || {}),
        ...guestData,
      },
    };
  }
}

export const portalRepository = new PortalRepository();
export { addDays, pickFirst, toDateOnly, getBookingIdentifier };

module.exports = { PortalRepository, portalRepository, addDays, pickFirst, toDateOnly, getBookingIdentifier };
