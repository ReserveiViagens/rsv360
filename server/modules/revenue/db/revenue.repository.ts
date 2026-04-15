import { Pool } from 'pg';
import type {
  AppliedRule,
  CompetitorRate,
  DemandForecast,
  PricingRule,
  RateCalendarEntry,
  RuleCondition,
} from './schema';

type Row = Record<string, any>;
type RoomRow = Record<string, any>;
type BookingRow = Record<string, any>;

type MemoryStore = {
  rules: PricingRule[];
  calendar: RateCalendarEntry[];
  forecast: DemandForecast[];
  competitorRates: CompetitorRate[];
  tasks: Row[];
  maintenance: Row[];
  checklists: Row[];
  rooms: RoomRow[];
  bookings: BookingRow[];
  nextIds: {
    rule: number;
    calendar: number;
    forecast: number;
    competitorRate: number;
    task: number;
    maintenance: number;
    checklist: number;
  };
};

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const tableCache = new Map<string, string | null>();
const columnsCache = new Map<string, string[]>();
let databaseUnavailable = false;

const memory: MemoryStore = {
  rules: [],
  calendar: [],
  forecast: [],
  competitorRates: [],
  tasks: [],
  maintenance: [],
  checklists: [],
  rooms: [],
  bookings: [],
  nextIds: {
    rule: 1,
    calendar: 1,
    forecast: 1,
    competitorRate: 1,
    task: 1,
    maintenance: 1,
    checklist: 1,
  },
};

function quoteIdent(identifier: string) {
  return `"${identifier.replace(/"/g, '""')}"`;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function nowIso() {
  return new Date().toISOString();
}

function toNumber(value: any) {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function toBoolean(value: any) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return ['true', '1', 'yes'].includes(value.toLowerCase());
  return Boolean(value);
}

function parseJson<T>(value: any, fallback: T): T {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'object') return value as T;
  if (typeof value !== 'string') return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function pickFirst<T>(values: Array<T | null | undefined>) {
  return values.find((value) => value !== null && value !== undefined);
}

function isConnectionError(error: any) {
  return ['ECONNREFUSED', 'ENOTFOUND', 'EAI_AGAIN', '57P03'].includes(error?.code);
}

function normalizeDateOnly(value: string | Date) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function toDateOnlyIso(value: string | Date) {
  const date = normalizeDateOnly(value);
  return date ? date.toISOString().split('T')[0] : '';
}

function dateRange(start: string, end: string) {
  const days: string[] = [];
  const current = new Date(start);
  const finish = new Date(end);
  if (Number.isNaN(current.getTime()) || Number.isNaN(finish.getTime())) {
    return days;
  }
  while (current <= finish) {
    days.push(current.toISOString().split('T')[0]);
    current.setUTCDate(current.getUTCDate() + 1);
  }
  return days;
}

function mapRuleRow(row: Row): PricingRule {
  return {
    id: Number(pickFirst([row.id, row.rule_id])) || 0,
    name: String(pickFirst([row.name, row.rule_name]) || 'Regra'),
    description: pickFirst([row.description, row.notes]),
    rule_type: (pickFirst([row.rule_type, row.type, row.ruleType]) || 'OCCUPANCY') as PricingRule['rule_type'],
    conditions: parseJson<RuleCondition>(pickFirst([row.conditions, row.condition, row.rule_conditions]), {}),
    adjustment_type: (pickFirst([row.adjustment_type, row.adjustmentType]) || 'percentage') as PricingRule['adjustment_type'],
    adjustment_value: Number(pickFirst([row.adjustment_value, row.adjustmentValue, row.value])) || 0,
    priority: Number(pickFirst([row.priority, row.sort_order])) || 0,
    is_active: toBoolean(pickFirst([row.is_active, row.active, row.enabled])),
    room_type_id: toNumber(pickFirst([row.room_type_id, row.roomTypeId])),
    channel: pickFirst([row.channel, row.sales_channel]),
    valid_from: pickFirst([row.valid_from, row.validFrom]),
    valid_until: pickFirst([row.valid_until, row.validUntil]),
    property_id: toNumber(pickFirst([row.property_id, row.propertyId])),
    created_at: row.created_at || row.createdAt || nowIso(),
    updated_at: row.updated_at || row.updatedAt || nowIso(),
  };
}

function mapCalendarRow(row: Row): RateCalendarEntry {
  return {
    id: Number(row.id) || 0,
    room_type_id: Number(pickFirst([row.room_type_id, row.roomTypeId])) || 0,
    room_type_name: pickFirst([row.room_type_name, row.roomTypeName]),
    date: String(row.date || row.calendar_date || '').split('T')[0],
    base_price: Number(pickFirst([row.base_price, row.basePrice])) || 0,
    calculated_price: Number(pickFirst([row.calculated_price, row.calculatedPrice])) || 0,
    manual_override: toBoolean(pickFirst([row.manual_override, row.manualOverride])),
    override_price: pickFirst([toNumber(row.override_price), toNumber(row.overridePrice)]),
    final_price: Number(pickFirst([row.final_price, row.finalPrice])) || 0,
    occupancy_rate: toNumber(pickFirst([row.occupancy_rate, row.occupancyRate])),
    applied_rules: parseJson<AppliedRule[]>(pickFirst([row.applied_rules, row.appliedRules]), []),
    min_stay: toNumber(pickFirst([row.min_stay, row.minStay])),
    max_stay: toNumber(pickFirst([row.max_stay, row.maxStay])),
    closed_to_arrival: toBoolean(pickFirst([row.closed_to_arrival, row.closedToArrival])),
    closed_to_departure: toBoolean(pickFirst([row.closed_to_departure, row.closedToDeparture])),
    stop_sell: toBoolean(pickFirst([row.stop_sell, row.stopSell])),
    property_id: toNumber(pickFirst([row.property_id, row.propertyId])),
    updated_at: row.updated_at || row.updatedAt || nowIso(),
  };
}

function mapForecastRow(row: Row): DemandForecast {
  return {
    id: Number(row.id) || 0,
    date: String(row.date || '').split('T')[0],
    room_type_id: toNumber(pickFirst([row.room_type_id, row.roomTypeId])),
    predicted_occupancy: Number(pickFirst([row.predicted_occupancy, row.predictedOccupancy])) || 0,
    predicted_demand: Number(pickFirst([row.predicted_demand, row.predictedDemand])) || 0,
    confidence: Number(row.confidence) || 0,
    historical_occupancy: toNumber(pickFirst([row.historical_occupancy, row.historicalOccupancy])),
    seasonality_factor: Number(pickFirst([row.seasonality_factor, row.seasonalityFactor])) || 1,
    day_of_week_factor: Number(pickFirst([row.day_of_week_factor, row.dayOfWeekFactor])) || 1,
    trend_factor: Number(pickFirst([row.trend_factor, row.trendFactor])) || 1,
    events: parseJson<string[]>(pickFirst([row.events, row.event_list]), []),
    property_id: toNumber(pickFirst([row.property_id, row.propertyId])),
    generated_at: row.generated_at || row.generatedAt || nowIso(),
  };
}

function mapCompetitorRateRow(row: Row): CompetitorRate {
  return {
    id: Number(row.id) || 0,
    competitor_name: String(pickFirst([row.competitor_name, row.competitorName]) || 'Concorrente'),
    room_type_equivalent: pickFirst([row.room_type_equivalent, row.roomTypeEquivalent]),
    date: String(row.date || '').split('T')[0],
    price: Number(row.price) || 0,
    currency: String(row.currency || 'BRL'),
    source: (pickFirst([row.source, 'manual']) || 'manual') as CompetitorRate['source'],
    url: pickFirst([row.url, row.source_url]),
    notes: pickFirst([row.notes, row.comment]),
    property_id: toNumber(pickFirst([row.property_id, row.propertyId])),
    captured_at: row.captured_at || row.capturedAt || nowIso(),
  };
}

function mapRoomRow(row: Row) {
  return {
    id: Number(pickFirst([row.id, row.room_id, row.roomId, row.accommodation_id, row.accommodationId])) || 0,
    name: String(pickFirst([row.name, row.room_name, row.roomNumber, row.accommodation_name, row.accommodationName]) || 'Quarto'),
    floor: toNumber(pickFirst([row.floor, row.floor_number, row.floorNumber])),
    room_type: pickFirst([row.room_type, row.room_type_name, row.accommodation_type, row.accommodationType, row.property_type]),
    status: String(pickFirst([row.status, row.room_status, row.accommodation_status]) || 'clean'),
    current_guest: pickFirst([row.current_guest, row.currentGuest]),
    notes: pickFirst([row.notes, row.description]),
    last_cleaned_at: pickFirst([row.last_cleaned_at, row.lastCleanedAt]),
    last_inspected_at: pickFirst([row.last_inspected_at, row.lastInspectedAt]),
    property_id: toNumber(pickFirst([row.property_id, row.propertyId, row.enterprise_id])),
  };
}

function mapBookingRow(row: Row) {
  return {
    ...row,
    check_in_date: String(pickFirst([row.check_in_date, row.checkInDate, row.checkin_date]) || '').split('T')[0],
    check_out_date: String(pickFirst([row.check_out_date, row.checkOutDate, row.checkout_date]) || '').split('T')[0],
    created_at: row.created_at || row.createdAt || nowIso(),
  };
}

function dateKey(value: string | Date) {
  return toDateOnlyIso(value);
}

export class RevenueRepository {
  private memory = memory;

  async query(text: string, values: any[] = []) {
    if (databaseUnavailable) {
      throw Object.assign(new Error('Database unavailable'), { code: 'DB_UNAVAILABLE' });
    }

    try {
      return await pool.query(text, values);
    } catch (error) {
      if (isConnectionError(error)) {
        databaseUnavailable = true;
        tableCache.clear();
        columnsCache.clear();
      }
      throw error;
    }
  }

  async resetMemory() {
    memory.rules = [];
    memory.calendar = [];
    memory.forecast = [];
    memory.competitorRates = [];
    memory.tasks = [];
    memory.maintenance = [];
    memory.checklists = [];
    memory.rooms = [];
    memory.bookings = [];
    memory.nextIds = {
      rule: 1,
      calendar: 1,
      forecast: 1,
      competitorRate: 1,
      task: 1,
      maintenance: 1,
      checklist: 1,
    };
  }

  async resolveTable(candidates: string[]) {
    if (databaseUnavailable) {
      return null;
    }

    const key = candidates.join('|');
    if (tableCache.has(key)) {
      return tableCache.get(key);
    }

    for (const candidate of candidates) {
      try {
        const result = await this.query('select to_regclass($1) as regclass', [`public.${candidate}`]);
        if (result.rows[0]?.regclass) {
          tableCache.set(key, candidate);
          return candidate;
        }
      } catch (error) {
        if (isConnectionError(error) || error?.code === 'DB_UNAVAILABLE') {
          databaseUnavailable = true;
          tableCache.clear();
          columnsCache.clear();
          tableCache.set(key, null);
          return null;
        }
        throw error;
      }
    }

    tableCache.set(key, null);
    return null;
  }

  async tryTable(candidates: string[]) {
    return this.resolveTable(candidates);
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

  private async selectAll(table: string) {
    const result = await this.query(`select * from ${quoteIdent(table)}`);
    return result.rows as Row[];
  }

  private async insertRow(table: string, row: Row) {
    const columns = Object.keys(row);
    const values = columns.map((column) => row[column]);
    const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
    const result = await this.query(
      `insert into ${quoteIdent(table)} (${columns.map(quoteIdent).join(', ')})
       values (${placeholders})
       returning *`,
      values
    );
    return result.rows[0];
  }

  private async updateRowById(table: string, id: number, row: Row) {
    const columns = Object.keys(row);
    const values = columns.map((column) => row[column]);
    const setClause = columns.map((column, index) => `${quoteIdent(column)} = $${index + 1}`).join(', ');
    const result = await this.query(
      `update ${quoteIdent(table)}
       set ${setClause}
       where id = $${columns.length + 1}
       returning *`,
      [...values, id]
    );
    return result.rows[0] || null;
  }

  private async deleteRowById(table: string, id: number) {
    await this.query(`delete from ${quoteIdent(table)} where id = $1`, [id]);
  }

  private cloneRules(rows: PricingRule[]) {
    return rows.map((row) => clone(row));
  }

  private cloneCalendars(rows: RateCalendarEntry[]) {
    return rows.map((row) => clone(row));
  }

  private cloneForecast(rows: DemandForecast[]) {
    return rows.map((row) => clone(row));
  }

  private cloneRates(rows: CompetitorRate[]) {
    return rows.map((row) => clone(row));
  }

  async getRuleTable() {
    return this.tryTable(['pricing_rules', 'revenue_rules', 'rate_rules']);
  }

  async getCalendarTable() {
    return this.tryTable(['rate_calendar', 'pricing_calendar', 'room_rates']);
  }

  async getForecastTable() {
    return this.tryTable(['demand_forecast', 'occupancy_forecast', 'demand_predictions']);
  }

  async getCompetitorTable() {
    return this.tryTable(['competitor_rates', 'market_rates', 'comp_rates']);
  }

  async getBookingsTable() {
    return this.tryTable(['bookings', 'reservations']);
  }

  async getRoomsTable() {
    return this.tryTable(['rooms', 'accommodations', 'room_types']);
  }

  async listRules(filters?: { is_active?: boolean; roomTypeId?: number; channel?: string }) {
    const table = await this.getRuleTable();
    let rows: PricingRule[] = [];

    if (table) {
      rows = (await this.selectAll(table)).map(mapRuleRow);
    } else {
      rows = clone(this.memory.rules);
    }

    if (filters?.is_active !== undefined) {
      rows = rows.filter((rule) => rule.is_active === filters.is_active);
    }
    if (filters?.roomTypeId !== undefined) {
      rows = rows.filter((rule) => rule.room_type_id === filters.roomTypeId || rule.room_type_id === undefined || rule.room_type_id === null);
    }
    if (filters?.channel !== undefined) {
      rows = rows.filter((rule) => !rule.channel || rule.channel === filters.channel);
    } else {
      rows = rows.filter((rule) => !rule.channel);
    }

    return rows.sort((left, right) => left.priority - right.priority);
  }

  async getRuleById(id: number) {
    const table = await this.getRuleTable();
    if (table) {
      const rows = await this.selectAll(table);
      const found = rows.map(mapRuleRow).find((rule) => Number(rule.id) === Number(id));
      return found ? clone(found) : null;
    }
    const found = this.memory.rules.find((rule) => Number(rule.id) === Number(id));
    return found ? clone(found) : null;
  }

  async createRule(data: Partial<PricingRule>) {
    const row: PricingRule = {
      id: this.memory.nextIds.rule++,
      name: String(data.name || 'Nova Regra'),
      description: data.description,
      rule_type: (data.rule_type || 'OCCUPANCY') as PricingRule['rule_type'],
      conditions: data.conditions || {},
      adjustment_type: (data.adjustment_type || 'percentage') as PricingRule['adjustment_type'],
      adjustment_value: Number(data.adjustment_value || 0),
      priority: Number(data.priority || this.memory.rules.length + 1),
      is_active: data.is_active ?? true,
      room_type_id: data.room_type_id,
      channel: data.channel,
      valid_from: data.valid_from,
      valid_until: data.valid_until,
      property_id: data.property_id,
      created_at: nowIso(),
      updated_at: nowIso(),
    };

    const table = await this.getRuleTable();
    if (table) {
      const dbRow = {
        name: row.name,
        description: row.description,
        rule_type: row.rule_type,
        conditions: row.conditions,
        adjustment_type: row.adjustment_type,
        adjustment_value: row.adjustment_value,
        priority: row.priority,
        is_active: row.is_active,
        room_type_id: row.room_type_id,
        channel: row.channel,
        valid_from: row.valid_from,
        valid_until: row.valid_until,
        property_id: row.property_id,
        created_at: row.created_at,
        updated_at: row.updated_at,
      };
      try {
        const created = await this.insertRow(table, dbRow);
        return mapRuleRow(created);
      } catch {
        // fall back to memory if table shape is not compatible
      }
    }

    this.memory.rules.push(row);
    return clone(row);
  }

  async updateRule(id: number, updates: Partial<PricingRule>) {
    const existing = await this.getRuleById(id);
    if (!existing) {
      return null;
    }

    const updated: PricingRule = {
      ...existing,
      ...updates,
      conditions: updates.conditions ? { ...existing.conditions, ...updates.conditions } : existing.conditions,
      updated_at: nowIso(),
    };

    const table = await this.getRuleTable();
    if (table) {
      try {
        const dbRow = {
          name: updated.name,
          description: updated.description,
          rule_type: updated.rule_type,
          conditions: updated.conditions,
          adjustment_type: updated.adjustment_type,
          adjustment_value: updated.adjustment_value,
          priority: updated.priority,
          is_active: updated.is_active,
          room_type_id: updated.room_type_id,
          channel: updated.channel,
          valid_from: updated.valid_from,
          valid_until: updated.valid_until,
          property_id: updated.property_id,
          updated_at: updated.updated_at,
        };
        const dbUpdated = await this.updateRowById(table, id, dbRow);
        if (dbUpdated) {
          return mapRuleRow(dbUpdated);
        }
      } catch {
        // ignore and fall back to memory
      }
    }

    const index = this.memory.rules.findIndex((rule) => Number(rule.id) === Number(id));
    if (index >= 0) {
      this.memory.rules[index] = updated;
    }
    return clone(updated);
  }

  async deleteRule(id: number) {
    const table = await this.getRuleTable();
    if (table) {
      try {
        await this.deleteRowById(table, id);
      } catch {
        // ignore and fall back to memory
      }
    }

    this.memory.rules = this.memory.rules.filter((rule) => Number(rule.id) !== Number(id));
  }

  async reorderRules(ruleIds: number[]) {
    for (const [index, ruleId] of ruleIds.entries()) {
      await this.updateRule(ruleId, { priority: index + 1 });
    }
  }

  async toggleRule(id: number, isActive: boolean) {
    const updated = await this.updateRule(id, { is_active: isActive });
    return updated;
  }

  async getActiveRules(roomTypeId?: number, channel?: string) {
    return this.listRules({ is_active: true, roomTypeId, channel });
  }

  async listRateCalendar(startDate: string, endDate: string, roomTypeId?: number) {
    const table = await this.getCalendarTable();
    let rows: RateCalendarEntry[] = [];

    if (table) {
      rows = (await this.selectAll(table)).map(mapCalendarRow);
    } else {
      rows = clone(this.memory.calendar);
    }

    const start = dateKey(startDate);
    const end = dateKey(endDate);
    return rows.filter((entry) => {
      const entryDate = entry.date;
      const inRange = (!start || entryDate >= start) && (!end || entryDate <= end);
      const matchesRoomType = roomTypeId === undefined || Number(entry.room_type_id) === Number(roomTypeId);
      return inRange && matchesRoomType;
    }).sort((left, right) => left.date.localeCompare(right.date));
  }

  async getRateCalendar(startDate: string, endDate: string, roomTypeId?: number) {
    return this.listRateCalendar(startDate, endDate, roomTypeId);
  }

  async upsertRateEntry(data: Partial<RateCalendarEntry> & { room_type_id: number; date: string; base_price: number; calculated_price: number; final_price: number }) {
    const existing = this.memory.calendar.find(
      (entry) => Number(entry.room_type_id) === Number(data.room_type_id) && entry.date === dateKey(data.date)
    );

    const entry: RateCalendarEntry = {
      id: existing?.id || this.memory.nextIds.calendar++,
      room_type_id: data.room_type_id,
      room_type_name: data.room_type_name,
      date: dateKey(data.date),
      base_price: data.base_price,
      calculated_price: data.calculated_price,
      manual_override: data.manual_override ?? false,
      override_price: data.override_price ?? null,
      final_price: data.final_price,
      occupancy_rate: data.occupancy_rate,
      applied_rules: data.applied_rules || [],
      min_stay: data.min_stay,
      max_stay: data.max_stay,
      closed_to_arrival: data.closed_to_arrival,
      closed_to_departure: data.closed_to_departure,
      stop_sell: data.stop_sell,
      property_id: data.property_id,
      updated_at: nowIso(),
    };

    const table = await this.getCalendarTable();
    if (table) {
      try {
        const dbRow = {
          room_type_id: entry.room_type_id,
          room_type_name: entry.room_type_name,
          date: entry.date,
          base_price: entry.base_price,
          calculated_price: entry.calculated_price,
          manual_override: entry.manual_override,
          override_price: entry.override_price,
          final_price: entry.final_price,
          occupancy_rate: entry.occupancy_rate,
          applied_rules: entry.applied_rules,
          min_stay: entry.min_stay,
          max_stay: entry.max_stay,
          closed_to_arrival: entry.closed_to_arrival,
          closed_to_departure: entry.closed_to_departure,
          stop_sell: entry.stop_sell,
          property_id: entry.property_id,
          updated_at: entry.updated_at,
        };
        if (existing) {
          const updated = await this.updateRowById(table, existing.id, dbRow);
          if (updated) {
            return mapCalendarRow(updated);
          }
        } else {
          const created = await this.insertRow(table, dbRow);
          return mapCalendarRow(created);
        }
      } catch {
        // fall back to memory
      }
    }

    const index = this.memory.calendar.findIndex(
      (item) => Number(item.room_type_id) === Number(entry.room_type_id) && item.date === entry.date
    );
    if (index >= 0) {
      this.memory.calendar[index] = entry;
    } else {
      this.memory.calendar.push(entry);
    }
    return clone(entry);
  }

  async bulkUpsertRateEntries(entries: Array<Partial<RateCalendarEntry> & { room_type_id: number; date: string; base_price: number; calculated_price: number; final_price: number }>) {
    let count = 0;
    for (const entry of entries) {
      await this.upsertRateEntry(entry);
      count += 1;
    }
    return count;
  }

  async overridePrice(roomTypeId: number, date: string, price: number) {
    const existing = this.memory.calendar.find(
      (entry) => Number(entry.room_type_id) === Number(roomTypeId) && entry.date === dateKey(date)
    );
    const basePrice = existing?.base_price ?? price;
    return this.upsertRateEntry({
      room_type_id: roomTypeId,
      date: dateKey(date),
      base_price: basePrice,
      calculated_price: existing?.calculated_price ?? price,
      manual_override: true,
      override_price: price,
      final_price: price,
      applied_rules: existing?.applied_rules || [],
      occupancy_rate: existing?.occupancy_rate,
      min_stay: existing?.min_stay,
      max_stay: existing?.max_stay,
      stop_sell: existing?.stop_sell,
      closed_to_arrival: existing?.closed_to_arrival,
      closed_to_departure: existing?.closed_to_departure,
      property_id: existing?.property_id,
      room_type_name: existing?.room_type_name,
    });
  }

  async removeOverride(roomTypeId: number, date: string) {
    const existing = this.memory.calendar.find(
      (entry) => Number(entry.room_type_id) === Number(roomTypeId) && entry.date === dateKey(date)
    );
    if (!existing) {
      return this.upsertRateEntry({
        room_type_id: roomTypeId,
        date: dateKey(date),
        base_price: Number(process.env.DEFAULT_BASE_PRICE || 250),
        calculated_price: Number(process.env.DEFAULT_BASE_PRICE || 250),
        manual_override: false,
        override_price: null,
        final_price: Number(process.env.DEFAULT_BASE_PRICE || 250),
      });
    }
    return this.upsertRateEntry({
      room_type_id: roomTypeId,
      date: dateKey(date),
      base_price: existing.base_price,
      calculated_price: existing.calculated_price,
      manual_override: false,
      override_price: null,
      final_price: existing.calculated_price,
      applied_rules: existing.applied_rules,
      occupancy_rate: existing.occupancy_rate,
      min_stay: existing.min_stay,
      max_stay: existing.max_stay,
      stop_sell: existing.stop_sell,
      closed_to_arrival: existing.closed_to_arrival,
      closed_to_departure: existing.closed_to_departure,
      property_id: existing.property_id,
      room_type_name: existing.room_type_name,
    });
  }

  async getForecast(startDate: string, endDate: string) {
    const table = await this.getForecastTable();
    let rows: DemandForecast[] = [];

    if (table) {
      rows = (await this.selectAll(table)).map(mapForecastRow);
    } else {
      rows = clone(this.memory.forecast);
    }

    const start = dateKey(startDate);
    const end = dateKey(endDate);
    return rows.filter((entry) => (!start || entry.date >= start) && (!end || entry.date <= end)).sort((left, right) => left.date.localeCompare(right.date));
  }

  async saveForecast(entries: Array<Partial<DemandForecast> & { date: string; predicted_occupancy: number; predicted_demand: number; confidence: number; seasonality_factor: number; day_of_week_factor: number; trend_factor: number; generated_at?: string }>) {
    let count = 0;
    for (const entry of entries) {
      const existing = this.memory.forecast.find(
        (item) => item.date === dateKey(entry.date) && Number(item.room_type_id || 0) === Number(entry.room_type_id || 0)
      );
      const forecastEntry: DemandForecast = {
        id: existing?.id || this.memory.nextIds.forecast++,
        date: dateKey(entry.date),
        room_type_id: entry.room_type_id,
        predicted_occupancy: entry.predicted_occupancy,
        predicted_demand: entry.predicted_demand,
        confidence: entry.confidence,
        historical_occupancy: entry.historical_occupancy,
        seasonality_factor: entry.seasonality_factor,
        day_of_week_factor: entry.day_of_week_factor,
        trend_factor: entry.trend_factor,
        events: entry.events || [],
        property_id: entry.property_id,
        generated_at: entry.generated_at || nowIso(),
      };

      const table = await this.getForecastTable();
      if (table) {
        try {
          const dbRow = {
            date: forecastEntry.date,
            room_type_id: forecastEntry.room_type_id,
            predicted_occupancy: forecastEntry.predicted_occupancy,
            predicted_demand: forecastEntry.predicted_demand,
            confidence: forecastEntry.confidence,
            historical_occupancy: forecastEntry.historical_occupancy,
            seasonality_factor: forecastEntry.seasonality_factor,
            day_of_week_factor: forecastEntry.day_of_week_factor,
            trend_factor: forecastEntry.trend_factor,
            events: forecastEntry.events,
            property_id: forecastEntry.property_id,
            generated_at: forecastEntry.generated_at,
          };
          if (existing) {
            await this.updateRowById(table, existing.id, dbRow);
          } else {
            await this.insertRow(table, dbRow);
          }
        } catch {
          // fall back to memory
        }
      }

      const index = this.memory.forecast.findIndex(
        (item) => item.date === forecastEntry.date && Number(item.room_type_id || 0) === Number(forecastEntry.room_type_id || 0)
      );
      if (index >= 0) {
        this.memory.forecast[index] = forecastEntry;
      } else {
        this.memory.forecast.push(forecastEntry);
      }
      count += 1;
    }
    return count;
  }

  async getLatestForecast(date: string) {
    const forecasts = await this.getForecast(date, date);
    return forecasts[0] ? clone(forecasts[0]) : null;
  }

  async listCompetitorRates(filters?: { competitor_name?: string; date?: string; source?: string; property_id?: number }) {
    const table = await this.getCompetitorTable();
    let rows: CompetitorRate[] = [];

    if (table) {
      rows = (await this.selectAll(table)).map(mapCompetitorRateRow);
    } else {
      rows = clone(this.memory.competitorRates);
    }

    if (filters?.competitor_name) {
      rows = rows.filter((rate) => rate.competitor_name === filters.competitor_name);
    }
    if (filters?.date) {
      rows = rows.filter((rate) => rate.date === dateKey(filters.date as string));
    }
    if (filters?.source) {
      rows = rows.filter((rate) => rate.source === filters.source);
    }
    if (filters?.property_id !== undefined) {
      rows = rows.filter((rate) => Number(rate.property_id) === Number(filters.property_id));
    }

    return rows.sort((left, right) => right.captured_at.localeCompare(left.captured_at));
  }

  async createCompetitorRate(data: Partial<CompetitorRate> & { competitor_name: string; date: string; price: number; currency?: string; source?: CompetitorRate['source'] }) {
    const rate: CompetitorRate = {
      id: this.memory.nextIds.competitorRate++,
      competitor_name: data.competitor_name,
      room_type_equivalent: data.room_type_equivalent,
      date: dateKey(data.date),
      price: Number(data.price) || 0,
      currency: data.currency || 'BRL',
      source: data.source || 'manual',
      url: data.url,
      notes: data.notes,
      property_id: data.property_id,
      captured_at: data.captured_at || nowIso(),
    };

    const table = await this.getCompetitorTable();
    if (table) {
      try {
        const dbRow = {
          competitor_name: rate.competitor_name,
          room_type_equivalent: rate.room_type_equivalent,
          date: rate.date,
          price: rate.price,
          currency: rate.currency,
          source: rate.source,
          url: rate.url,
          notes: rate.notes,
          property_id: rate.property_id,
          captured_at: rate.captured_at,
        };
        const created = await this.insertRow(table, dbRow);
        return mapCompetitorRateRow(created);
      } catch {
        // fall back to memory
      }
    }

    this.memory.competitorRates.push(rate);
    return clone(rate);
  }

  async updateCompetitorRate(id: number, updates: Partial<CompetitorRate>) {
    const existing = this.memory.competitorRates.find((rate) => Number(rate.id) === Number(id));
    if (!existing) {
      return null;
    }
    const updated: CompetitorRate = {
      ...existing,
      ...updates,
      date: updates.date ? dateKey(updates.date) : existing.date,
      captured_at: nowIso(),
    };

    const table = await this.getCompetitorTable();
    if (table) {
      try {
        const dbRow = {
          competitor_name: updated.competitor_name,
          room_type_equivalent: updated.room_type_equivalent,
          date: updated.date,
          price: updated.price,
          currency: updated.currency,
          source: updated.source,
          url: updated.url,
          notes: updated.notes,
          property_id: updated.property_id,
          captured_at: updated.captured_at,
        };
        const dbUpdated = await this.updateRowById(table, id, dbRow);
        if (dbUpdated) {
          return mapCompetitorRateRow(dbUpdated);
        }
      } catch {
        // fall back to memory
      }
    }

    Object.assign(existing, updated);
    return clone(updated);
  }

  async deleteCompetitorRate(id: number) {
    const table = await this.getCompetitorTable();
    if (table) {
      try {
        await this.deleteRowById(table, id);
      } catch {
        // ignore
      }
    }
    this.memory.competitorRates = this.memory.competitorRates.filter((rate) => Number(rate.id) !== Number(id));
  }

  async getCompetitorRatesForDate(date: string) {
    return this.listCompetitorRates({ date: dateKey(date) });
  }

  async listRooms(filters?: { status?: string; floor?: number; property_id?: number; search?: string }) {
    const table = await this.getRoomsTable();
    let rows: RoomRow[] = [];

    if (table) {
      rows = await this.selectAll(table);
    } else {
      rows = clone(this.memory.rooms);
    }

    let rooms = rows.map(mapRoomRow);
    if (filters?.status) {
      rooms = rooms.filter((room) => String(room.status) === filters.status);
    }
    if (filters?.floor !== undefined) {
      rooms = rooms.filter((room) => Number(room.floor ?? 0) === Number(filters.floor));
    }
    if (filters?.property_id !== undefined) {
      rooms = rooms.filter((room) => Number(room.property_id) === Number(filters.property_id));
    }
    if (filters?.search) {
      const needle = filters.search.toLowerCase();
      rooms = rooms.filter((room) => `${room.name} ${room.room_type || ''}`.toLowerCase().includes(needle));
    }
    return rooms;
  }

  async getRoomById(id: number) {
    const rooms = await this.listRooms();
    return rooms.find((room) => Number(room.id) === Number(id)) || null;
  }

  async upsertRoom(room: RoomRow) {
    const table = await this.getRoomsTable();
    const existing = this.memory.rooms.find((entry) => Number(pickFirst([entry.id, entry.room_id, entry.accommodation_id])) === Number(room.id));
    const row = {
      ...room,
      id: room.id,
    };

    if (table) {
      try {
        const created = await this.insertRow(table, row);
        return mapRoomRow(created);
      } catch {
        // fall back to memory
      }
    }

    if (existing) {
      Object.assign(existing, row);
    } else {
      this.memory.rooms.push(row);
    }
    return mapRoomRow(row);
  }

  async updateRoomStatus(id: number, status: string, notes?: string) {
    const existing = await this.getRoomById(id);
    const room = existing || {
      id,
      name: `Quarto ${id}`,
      status: 'clean',
    };

    const updated = {
      ...room,
      status,
      notes: notes ?? room.notes,
      last_cleaned_at: status === 'clean' ? nowIso() : room.last_cleaned_at,
      last_inspected_at: status === 'inspected' ? nowIso() : room.last_inspected_at,
    };

    const table = await this.getRoomsTable();
    if (table) {
      try {
        await this.upsertRoom({
          ...updated,
          id,
          room_type: updated.room_type,
          floor: updated.floor,
          property_id: updated.property_id,
        });
      } catch {
        // ignore
      }
    } else {
      const index = this.memory.rooms.findIndex((entry) => Number(pickFirst([entry.id, entry.room_id, entry.accommodation_id])) === Number(id));
      const memoryRow = {
        id,
        name: updated.name,
        floor: updated.floor,
        room_type: updated.room_type,
        status: updated.status,
        notes: updated.notes,
        last_cleaned_at: updated.last_cleaned_at,
        last_inspected_at: updated.last_inspected_at,
        property_id: updated.property_id,
      };
      if (index >= 0) {
        this.memory.rooms[index] = memoryRow;
      } else {
        this.memory.rooms.push(memoryRow);
      }
    }

    return clone(updated);
  }

  async bulkUpdateStatus(ids: number[], status: string) {
    let count = 0;
    for (const id of ids) {
      await this.updateRoomStatus(id, status);
      count += 1;
    }
    return count;
  }

  async getRoomsByFloor() {
    const rooms = await this.listRooms();
    return rooms.reduce<Record<number, typeof rooms>>((accumulator, room) => {
      const floor = Number(room.floor ?? 0);
      if (!accumulator[floor]) {
        accumulator[floor] = [];
      }
      accumulator[floor].push(room);
      return accumulator;
    }, {});
  }

  async getDashboardStats() {
    const rooms = await this.listRooms();
    const buckets = {
      clean: 0,
      dirty: 0,
      cleaning: 0,
      maintenance: 0,
      total: rooms.length,
    };

    for (const room of rooms) {
      const status = String(room.status || 'clean');
      if (status in buckets) {
        (buckets as any)[status] += 1;
      }
    }

    return buckets;
  }

  async markDirtyAfterCheckout(roomId: number) {
    await this.updateRoomStatus(roomId, 'dirty', 'Checkout concluído');
  }

  async createTask(data: Partial<any>) {
    const room = data.room_id ? await this.getRoomById(Number(data.room_id)) : null;
    const task = {
      id: this.memory.nextIds.task++,
      room_id: Number(data.room_id) || 0,
      room_name: data.room_name || room?.name || `Quarto ${data.room_id || 0}`,
      task_type: (data.task_type || 'checkout_clean') as any,
      status: (data.status || 'pending') as any,
      priority: (data.priority || 'normal') as any,
      assigned_to: toNumber(data.assigned_to),
      assigned_to_name: data.assigned_to_name,
      checklist_id: toNumber(data.checklist_id),
      checklist_items: parseJson(data.checklist_items, []),
      started_at: data.started_at,
      completed_at: data.completed_at,
      inspected_at: data.inspected_at,
      inspected_by: toNumber(data.inspected_by),
      inspection_rating: toNumber(data.inspection_rating),
      estimated_minutes: toNumber(data.estimated_minutes) ?? Number(process.env.HK_DEFAULT_TASK_MINUTES || 30),
      actual_minutes: toNumber(data.actual_minutes),
      notes: data.notes,
      property_id: toNumber(data.property_id),
      created_at: data.created_at || nowIso(),
      updated_at: data.updated_at || nowIso(),
    };
    this.memory.tasks.push(task);
    return clone(task);
  }

  private tasksList() {
    return clone(this.memory.tasks || []);
  }

  async listTasks(filters?: { status?: string; date?: string; assignee?: number; room_id?: number; task_type?: string; property_id?: number }) {
    const tasks = this.tasksList();
    let rows = tasks as any[];
    if (filters?.status) rows = rows.filter((task) => task.status === filters.status);
    if (filters?.assignee !== undefined) rows = rows.filter((task) => Number(task.assigned_to) === Number(filters.assignee));
    if (filters?.room_id !== undefined) rows = rows.filter((task) => Number(task.room_id) === Number(filters.room_id));
    if (filters?.task_type) rows = rows.filter((task) => task.task_type === filters.task_type);
    if (filters?.property_id !== undefined) rows = rows.filter((task) => Number(task.property_id) === Number(filters.property_id));
    if (filters?.date) rows = rows.filter((task) => toDateOnlyIso(task.created_at) === dateKey(filters.date as string));
    return rows;
  }

  async getTaskById(id: number) {
    const tasks = this.tasksList();
    return tasks.find((task: any) => Number(task.id) === Number(id)) || null;
  }

  async updateTask(id: number, updates: Partial<any>) {
    const index = this.memory.tasks.findIndex((task: any) => Number(task.id) === Number(id));
    if (index < 0) return null;
    const current = this.memory.tasks[index];
    const updated = {
      ...current,
      ...updates,
      updated_at: nowIso(),
    };
    this.memory.tasks[index] = updated;
    return clone(updated);
  }

  async assignTask(id: number, userId: number) {
    return this.updateTask(id, { assigned_to: userId, status: 'assigned' });
  }

  async startTask(id: number) {
    return this.updateTask(id, { status: 'in_progress', started_at: nowIso() });
  }

  async completeTask(id: number, checklist?: any, notes?: string) {
    const task = await this.getTaskById(id);
    if (!task) return null;
    const startedAt = task.started_at ? new Date(task.started_at) : null;
    const actualMinutes = startedAt && !Number.isNaN(startedAt.getTime()) ? Math.max(Math.round((Date.now() - startedAt.getTime()) / 60000), 0) : undefined;
    return this.updateTask(id, {
      status: 'completed',
      completed_at: nowIso(),
      checklist_items: checklist || task.checklist_items || [],
      notes: notes ?? task.notes,
      actual_minutes: actualMinutes,
    });
  }

  async inspectTask(id: number, rating: number, inspectorId: number, notes?: string) {
    const task = await this.getTaskById(id);
    if (!task) return null;
    return this.updateTask(id, {
      status: rating >= 4 ? 'inspected' : 'rejected',
      inspected_at: nowIso(),
      inspected_by: inspectorId,
      inspection_rating: rating,
      notes: notes ?? task.notes,
    });
  }

  async getTasksByAssignee(userId: number) {
    return this.listTasks({ assignee: userId });
  }

  async getTaskStats(dateRange?: { start?: string; end?: string }) {
    let tasks = this.tasksList();
    if (dateRange?.start) {
      tasks = tasks.filter((task: any) => toDateOnlyIso(task.created_at) >= dateKey(dateRange.start as string));
    }
    if (dateRange?.end) {
      tasks = tasks.filter((task: any) => toDateOnlyIso(task.created_at) <= dateKey(dateRange.end as string));
    }
    const pending = tasks.filter((task: any) => task.status === 'pending').length;
    const inProgress = tasks.filter((task: any) => task.status === 'in_progress' || task.status === 'assigned').length;
    const completed = tasks.filter((task: any) => ['completed', 'inspected'].includes(task.status)).length;
    const minutes = tasks.map((task: any) => Number(task.actual_minutes || 0)).filter((value) => value > 0);
    const avgMinutes = minutes.length ? minutes.reduce((left, right) => left + right, 0) / minutes.length : 0;
    return { pending, inProgress, completed, avgMinutes };
  }

  async createMaintenanceOrder(data: Partial<any>) {
    const order = {
      id: this.memory.nextIds.maintenance++,
      room_id: Number(data.room_id) || 0,
      room_name: data.room_name || `Quarto ${data.room_id || 0}`,
      category: (data.category || 'other') as any,
      priority: (data.priority || 'normal') as any,
      status: (data.status || 'open') as any,
      title: data.title || 'Ordem de manutenção',
      description: data.description || '',
      reported_by: toNumber(data.reported_by),
      assigned_to: toNumber(data.assigned_to),
      resolution: data.resolution,
      estimated_cost: toNumber(data.estimated_cost),
      actual_cost: toNumber(data.actual_cost),
      started_at: data.started_at,
      completed_at: data.completed_at,
      property_id: toNumber(data.property_id),
      created_at: data.created_at || nowIso(),
      updated_at: data.updated_at || nowIso(),
    };
    this.memory.maintenance.push(order);
    return clone(order);
  }

  async listMaintenanceOrders(filters?: { status?: string; priority?: string; room_id?: number; date?: string }) {
    let rows = clone(this.memory.maintenance || []);
    if (filters?.status) rows = rows.filter((order) => order.status === filters.status);
    if (filters?.priority) rows = rows.filter((order) => order.priority === filters.priority);
    if (filters?.room_id !== undefined) rows = rows.filter((order) => Number(order.room_id) === Number(filters.room_id));
    if (filters?.date) rows = rows.filter((order) => toDateOnlyIso(order.created_at) === dateKey(filters.date as string));
    return rows;
  }

  async getMaintenanceOrderById(id: number) {
    const orders = clone(this.memory.maintenance || []);
    return orders.find((order) => Number(order.id) === Number(id)) || null;
  }

  async updateMaintenanceOrder(id: number, updates: Partial<any>) {
    const orders = this.memory.maintenance || [];
    const index = orders.findIndex((order) => Number(order.id) === Number(id));
    if (index < 0) return null;
    const updated = {
      ...orders[index],
      ...updates,
      updated_at: nowIso(),
    };
    orders[index] = updated;
    return clone(updated);
  }

  async assignMaintenanceOrder(id: number, userId: number) {
    return this.updateMaintenanceOrder(id, { assigned_to: userId, status: 'assigned' });
  }

  async completeMaintenanceOrder(id: number, resolution: string, cost?: number) {
    return this.updateMaintenanceOrder(id, {
      status: 'completed',
      resolution,
      actual_cost: cost,
      completed_at: nowIso(),
    });
  }

  async getMaintenanceStats() {
    const orders = clone(this.memory.maintenance || []);
    const open = orders.filter((order) => order.status === 'open').length;
    const inProgress = orders.filter((order) => ['assigned', 'in_progress', 'waiting_parts'].includes(order.status)).length;
    const completed = orders.filter((order) => order.status === 'completed').length;
    const totalCostMonth = orders.reduce((sum, order) => sum + Number(order.actual_cost || 0), 0);
    return { open, inProgress, completed, totalCostMonth };
  }

  async createChecklist(data: Partial<any>) {
    const checklist = {
      id: this.memory.nextIds.checklist++,
      name: data.name || 'Checklist',
      task_type: data.task_type || 'checkout_clean',
      room_type: data.room_type,
      items: parseJson(data.items, []),
      is_default: data.is_default ?? false,
      property_id: toNumber(data.property_id),
    };
    this.memory.checklists.push(checklist);
    return clone(checklist);
  }

  async listChecklists(filters?: { task_type?: string; room_type?: string; property_id?: number }) {
    let rows = clone(this.memory.checklists || []);
    if (filters?.task_type) rows = rows.filter((checklist) => checklist.task_type === filters.task_type);
    if (filters?.room_type) rows = rows.filter((checklist) => checklist.room_type === filters.room_type);
    if (filters?.property_id !== undefined) rows = rows.filter((checklist) => Number(checklist.property_id) === Number(filters.property_id));
    return rows;
  }

  async getChecklistById(id: number) {
    const checklists = clone(this.memory.checklists || []);
    return checklists.find((checklist) => Number(checklist.id) === Number(id)) || null;
  }

  async updateChecklist(id: number, updates: Partial<any>) {
    const checklists = this.memory.checklists || [];
    const index = checklists.findIndex((checklist) => Number(checklist.id) === Number(id));
    if (index < 0) return null;
    const updated = {
      ...checklists[index],
      ...updates,
    };
    checklists[index] = updated;
    return clone(updated);
  }

  async deleteChecklist(id: number) {
    this.memory.checklists = (this.memory.checklists || []).filter((checklist) => Number(checklist.id) !== Number(id));
  }

  async getChecklistForTaskType(taskType: string, roomType?: string) {
    const checklists = await this.listChecklists({ task_type: taskType, room_type: roomType });
    return checklists[0] || null;
  }

  async seedDefaultChecklists() {
    const existing = await this.listChecklists();
    if (existing.length >= 4) {
      return;
    }
    await this.createChecklist({
      name: 'Checkout Clean',
      task_type: 'checkout_clean',
      is_default: true,
      items: [
        { id: '1', text: 'Limpar vaso sanitário', category: 'Banheiro', is_required: true },
        { id: '2', text: 'Limpar pia', category: 'Banheiro', is_required: true },
        { id: '3', text: 'Limpar box', category: 'Banheiro', is_required: true },
        { id: '4', text: 'Limpar espelho', category: 'Banheiro', is_required: true },
        { id: '5', text: 'Trocar toalhas', category: 'Banheiro', is_required: true },
        { id: '6', text: 'Trocar roupa de cama', category: 'Quarto', is_required: true },
        { id: '7', text: 'Aspirar piso', category: 'Quarto', is_required: true },
        { id: '8', text: 'Limpar superfícies', category: 'Quarto', is_required: true },
        { id: '9', text: 'Limpar frigobar', category: 'Cozinha/Frigobar', is_required: true },
        { id: '10', text: 'Verificar estoque do frigobar', category: 'Cozinha/Frigobar', is_required: true },
        { id: '11', text: 'Verificar danos', category: 'Geral', is_required: true },
        { id: '12', text: 'Reabastecer amenities', category: 'Geral', is_required: true },
        { id: '13', text: 'Esvaziar lixeiras', category: 'Geral', is_required: true },
        { id: '14', text: 'Desinfetar controles', category: 'Geral', is_required: false },
        { id: '15', text: 'Checar iluminação', category: 'Geral', is_required: false },
      ],
    });
    await this.createChecklist({
      name: 'Stayover Clean',
      task_type: 'stayover_clean',
      is_default: true,
      items: [
        { id: '1', text: 'Arrumar cama', category: 'Quarto', is_required: true },
        { id: '2', text: 'Trocar toalhas usadas', category: 'Banheiro', is_required: true },
        { id: '3', text: 'Limpar banheiro', category: 'Banheiro', is_required: true },
        { id: '4', text: 'Esvaziar lixeiras', category: 'Geral', is_required: true },
        { id: '5', text: 'Reabastecer amenities', category: 'Geral', is_required: true },
        { id: '6', text: 'Aspirar piso', category: 'Quarto', is_required: true },
        { id: '7', text: 'Organizar ambiente', category: 'Quarto', is_required: false },
        { id: '8', text: 'Verificar minibar', category: 'Cozinha/Frigobar', is_required: false },
      ],
    });
    await this.createChecklist({
      name: 'Deep Clean',
      task_type: 'deep_clean',
      is_default: true,
      items: [
        ...Array.from({ length: 25 }).map((_, index) => ({
          id: String(index + 1),
          text: [
            'Limpar vaso',
            'Limpar pia',
            'Limpar box',
            'Limpar espelho',
            'Trocar toalhas',
            'Trocar roupa de cama',
            'Aspirar piso',
            'Limpar superfícies',
            'Limpar frigobar',
            'Verificar estoque',
            'Verificar danos',
            'Reabastecer amenities',
            'Esvaziar lixeiras',
            'Lavar cortinas',
            'Limpar ar-condicionado',
            'Desinfetar colchão',
            'Limpar atrás dos móveis',
            'Polir metais',
            'Limpar janelas',
            'Verificar encanamentos',
            'Limpar rodapés',
            'Limpar porta',
            'Limpar interruptores',
            'Limpar tomadas',
            'Checagem final',
          ][index],
          category: ['Banheiro', 'Quarto', 'Cozinha/Frigobar', 'Geral'][index % 4],
          is_required: true,
        })),
      ],
    });
    await this.createChecklist({
      name: 'Turndown',
      task_type: 'turndown',
      is_default: true,
      items: [
        { id: '1', text: 'Abrir cama', category: 'Quarto', is_required: true },
        { id: '2', text: 'Colocar chocolate', category: 'Quarto', is_required: true },
        { id: '3', text: 'Colocar água', category: 'Quarto', is_required: true },
        { id: '4', text: 'Fechar cortinas', category: 'Quarto', is_required: true },
        { id: '5', text: 'Ajustar iluminação', category: 'Geral', is_required: true },
        { id: '6', text: 'Reabastecer toalhas', category: 'Banheiro', is_required: true },
      ],
    });
  }

  async getBasePriceForRoomType(roomTypeId: number) {
    const room = await this.getRoomById(roomTypeId);
    const roomTable = await this.getRoomsTable();
    if (roomTable) {
      try {
        const rows = await this.selectAll(roomTable);
        const found = rows.find((item) => Number(pickFirst([item.id, item.room_id, item.accommodation_id])) === Number(roomTypeId));
        const basePrice = toNumber(pickFirst([found?.base_price_per_night, found?.base_price, found?.price, found?.basePricePerNight]));
        if (basePrice !== undefined) {
          return basePrice;
        }
      } catch {
        // ignore and fallback
      }
    }

    if (room) {
      const roomBase = toNumber((room as any).base_price_per_night || (room as any).basePricePerNight || (room as any).base_price);
      if (roomBase !== undefined) {
        return roomBase;
      }
    }

    return Number(process.env.DEFAULT_BASE_PRICE || 250);
  }

  async getTotalRooms() {
    const rooms = await this.listRooms();
    if (rooms.length > 0) {
      return rooms.length;
    }
    const table = await this.getRoomsTable();
    if (table) {
      try {
        const rows = await this.selectAll(table);
        return rows.length;
      } catch {
        return 0;
      }
    }
    return 0;
  }

  async getBookings() {
    const table = await this.getBookingsTable();
    if (table) {
      try {
        const rows = await this.selectAll(table);
        return rows.map(mapBookingRow);
      } catch {
        return [];
      }
    }
    return clone(this.memory.bookings);
  }

  async getOccupancyRate(date: string, roomTypeId?: number) {
    const bookings = await this.getBookings();
    if (bookings.length === 0) {
      return 85;
    }

    const targetDate = dateKey(date);
    const activeBookings = bookings.filter((booking) => {
      const checkIn = String(pickFirst([booking.check_in_date, booking.checkInDate]) || '');
      const checkOut = String(pickFirst([booking.check_out_date, booking.checkOutDate]) || '');
      return (!checkIn || targetDate >= checkIn) && (!checkOut || targetDate < checkOut);
    });

    const matchingBookings = roomTypeId === undefined
      ? activeBookings
      : activeBookings.filter((booking) => Number(pickFirst([booking.room_type_id, booking.roomTypeId, booking.accommodation_id])) === Number(roomTypeId));

    const totalRooms = Math.max(await this.getTotalRooms(), 1);
    return Math.min(100, Math.round((matchingBookings.length / totalRooms) * 100));
  }

  async getOccupancyRange(startDate: string, endDate: string) {
    const dates = dateRange(startDate, endDate);
    const result = [];
    for (const date of dates) {
      result.push({ date, rate: await this.getOccupancyRate(date) });
    }
    return result;
  }

  async getRevenueRange(startDate: string, endDate: string) {
    const bookings = await this.getBookings();
    const dates = dateRange(startDate, endDate);
    return dates.map((date) => {
      const dailyRevenue = bookings
        .filter((booking) => {
          const checkIn = String(pickFirst([booking.check_in_date, booking.checkInDate]) || '');
          const checkOut = String(pickFirst([booking.check_out_date, booking.checkOutDate]) || '');
          const bookingDate = dateKey(date);
          return (!checkIn || bookingDate >= checkIn) && (!checkOut || bookingDate < checkOut);
        })
        .reduce((sum, booking) => sum + Number(pickFirst([booking.amount, booking.total_amount, booking.totalAmount, booking.price]) || 0), 0);
      return { date, revenue: dailyRevenue };
    });
  }

  async getRoomsSold(startDate: string, endDate: string) {
    const bookings = await this.getBookings();
    const start = dateKey(startDate);
    const end = dateKey(endDate);
    return bookings.filter((booking) => {
      const checkIn = String(pickFirst([booking.check_in_date, booking.checkInDate]) || '');
      return (!start || checkIn >= start) && (!end || checkIn <= end) && ['confirmed', 'checked_in', 'checked_out', 'paid'].includes(String(booking.status || 'confirmed'));
    }).length;
  }

  async getBookingLeadTimes(startDate: string, endDate: string) {
    const bookings = await this.getBookings();
    const start = dateKey(startDate);
    const end = dateKey(endDate);
    return bookings
      .filter((booking) => {
        const checkIn = String(pickFirst([booking.check_in_date, booking.checkInDate]) || '');
        return (!start || checkIn >= start) && (!end || checkIn <= end);
      })
      .map((booking) => {
        const createdAt = new Date(booking.created_at || booking.createdAt || Date.now());
        const checkIn = new Date(pickFirst([booking.check_in_date, booking.checkInDate]) || booking.check_in || booking.checkInDate || Date.now());
        return Math.max(Math.round((checkIn.getTime() - createdAt.getTime()) / 86400000), 0);
      });
  }

  async getCancellationCount(startDate: string, endDate: string) {
    const bookings = await this.getBookings();
    const start = dateKey(startDate);
    const end = dateKey(endDate);
    return bookings.filter((booking) => {
      const createdAt = dateKey(booking.created_at || booking.createdAt || '');
      return (!start || createdAt >= start) && (!end || createdAt <= end) && ['cancelled', 'canceled'].includes(String(booking.status || '').toLowerCase());
    }).length;
  }

  async getAverageLengthOfStay(startDate: string, endDate: string) {
    const bookings = await this.getBookings();
    const start = dateKey(startDate);
    const end = dateKey(endDate);
    const stays = bookings
      .filter((booking) => {
        const checkIn = String(pickFirst([booking.check_in_date, booking.checkInDate]) || '');
        return (!start || checkIn >= start) && (!end || checkIn <= end);
      })
      .map((booking) => {
        const checkIn = new Date(pickFirst([booking.check_in_date, booking.checkInDate]) || Date.now());
        const checkOut = new Date(pickFirst([booking.check_out_date, booking.checkOutDate]) || Date.now());
        return Math.max(Math.round((checkOut.getTime() - checkIn.getTime()) / 86400000), 0);
      })
      .filter((stay) => stay > 0);

    if (!stays.length) {
      return 0;
    }
    return stays.reduce((sum, stay) => sum + stay, 0) / stays.length;
  }

  async getTotalRevenue(startDate: string, endDate: string) {
    const bookings = await this.getBookings();
    const start = dateKey(startDate);
    const end = dateKey(endDate);
    return bookings
      .filter((booking) => {
        const createdAt = dateKey(booking.created_at || booking.createdAt || '');
        return (!start || createdAt >= start) && (!end || createdAt <= end) && ['confirmed', 'checked_in', 'checked_out', 'paid'].includes(String(booking.status || 'confirmed'));
      })
      .reduce((sum, booking) => sum + Number(pickFirst([booking.amount, booking.total_amount, booking.totalAmount, booking.price]) || 0), 0);
  }

  async getRevenueByRoomType(startDate: string, endDate: string) {
    const bookings = await this.getBookings();
    const start = dateKey(startDate);
    const end = dateKey(endDate);
    const grouped = new Map<string, { roomType: string; revenue: number; bookings: number }>();
    for (const booking of bookings) {
      const createdAt = dateKey(booking.created_at || booking.createdAt || '');
      if ((start && createdAt < start) || (end && createdAt > end)) continue;
      const roomType = String(pickFirst([booking.room_type, booking.roomType, booking.accommodation_type, booking.accommodationType]) || 'default');
      const revenue = Number(pickFirst([booking.amount, booking.total_amount, booking.totalAmount, booking.price]) || 0);
      const entry = grouped.get(roomType) || { roomType, revenue: 0, bookings: 0 };
      entry.revenue += revenue;
      entry.bookings += 1;
      grouped.set(roomType, entry);
    }
    const totalRooms = Math.max(await this.getTotalRooms(), 1);
    return Array.from(grouped.values()).map((entry) => ({
      roomType: entry.roomType,
      revenue: entry.revenue,
      bookings: entry.bookings,
      adr: entry.bookings ? entry.revenue / entry.bookings : 0,
      occupancy: Math.min(100, (entry.bookings / totalRooms) * 100),
    }));
  }

  async getRevenueByChannel(startDate: string, endDate: string) {
    const bookings = await this.getBookings();
    const start = dateKey(startDate);
    const end = dateKey(endDate);
    const grouped = new Map<string, { channel: string; revenue: number; bookings: number; commission: number }>();
    for (const booking of bookings) {
      const createdAt = dateKey(booking.created_at || booking.createdAt || '');
      if ((start && createdAt < start) || (end && createdAt > end)) continue;
      const channel = String(pickFirst([booking.channel, booking.source, booking.booking_channel]) || 'direct');
      const revenue = Number(pickFirst([booking.amount, booking.total_amount, booking.totalAmount, booking.price]) || 0);
      const commission = Number(pickFirst([booking.commission, booking.commission_amount]) || 0);
      const entry = grouped.get(channel) || { channel, revenue: 0, bookings: 0, commission: 0 };
      entry.revenue += revenue;
      entry.bookings += 1;
      entry.commission += commission;
      grouped.set(channel, entry);
    }
    return Array.from(grouped.values()).map((entry) => ({
      channel: entry.channel,
      revenue: entry.revenue,
      bookings: entry.bookings,
      commission: entry.commission,
      netRevenue: entry.revenue - entry.commission,
    }));
  }

  async getBookingsRangeSummary(startDate: string, endDate: string) {
    const bookings = await this.getBookings();
    const start = dateKey(startDate);
    const end = dateKey(endDate);
    return bookings.filter((booking) => {
      const createdAt = dateKey(booking.created_at || booking.createdAt || '');
      return (!start || createdAt >= start) && (!end || createdAt <= end);
    });
  }
}

export const revenueRepository = new RevenueRepository();
