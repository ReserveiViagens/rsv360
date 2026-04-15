import { Pool } from 'pg';
import type { CampaignStatus } from '../types';
import type {
  GuestProfile,
  GuestSegment,
  LoyaltyMember,
  LoyaltyProgram,
  LoyaltyTransaction,
  MarketingCampaign,
} from './schema';

type Row = Record<string, any>;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function nowIso() {
  return new Date().toISOString();
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function toNumber(value: any, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toBoolean(value: any, fallback = false) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return ['true', '1', 'yes'].includes(value.toLowerCase());
  if (value === undefined || value === null) return fallback;
  return Boolean(value);
}

function toText(value: any, fallback = '') {
  return value === undefined || value === null ? fallback : String(value);
}

function parseJson(value: any, fallback: any) {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(String(value));
  } catch {
    return fallback;
  }
}

function randomMemberNumber() {
  return `RSV-${Math.floor(100000 + Math.random() * 900000)}`;
}

function monthIndex(date?: string) {
  if (!date) return -1;
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return -1;
  return parsed.getUTCMonth();
}

function monthsSince(date?: string) {
  if (!date) return Number.POSITIVE_INFINITY;
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return Number.POSITIVE_INFINITY;
  const diff = Date.now() - parsed.getTime();
  return diff / (1000 * 60 * 60 * 24 * 30.4375);
}

export class CrmRepository {
  private useFallback = false;
  private guestProfiles = new Map<number, GuestProfile>();
  private loyaltyPrograms = new Map<number, LoyaltyProgram>();
  private loyaltyMembers = new Map<number, LoyaltyMember>();
  private loyaltyTransactions = new Map<number, LoyaltyTransaction>();
  private campaigns = new Map<number, MarketingCampaign>();
  private segments = new Map<number, GuestSegment>();
  private nextId = {
    profiles: 1,
    programs: 1,
    members: 1,
    transactions: 1,
    campaigns: 1,
    segments: 1,
  };

  private async query(text: string, values: any[] = []) {
    return pool.query(text, values);
  }

  private async tableExists(tableName: string) {
    const result = await this.query(
      `select table_name from information_schema.tables where table_schema = 'public' and table_name = $1 limit 1`,
      [tableName]
    );
    return Boolean(result.rows[0]);
  }

  private async ensureTable(tableName: string, createSql: string, columns: string[]) {
    await this.query(createSql);
    for (const column of columns) {
      await this.query(`alter table if exists "${tableName}" add column if not exists ${column}`);
    }
  }

  private ensureMemorySeeds() {
    if (this.loyaltyPrograms.size === 0) {
      this.createProgram({
        user_id: 1,
        property_id: 1,
        name: process.env.CRM_LOYALTY_PROGRAM_NAME || 'RSV360 Fidelidade',
        points_per_brl: Number(process.env.CRM_DEFAULT_POINTS_PER_BRL || 1.0),
        points_expiry_days: Number(process.env.CRM_POINTS_EXPIRY_DAYS || 365),
        is_active: true,
        tiers: [
          { name: 'Bronze', min_points: 0, benefits: ['Welcome drink'] },
          { name: 'Prata', min_points: 1000, benefits: ['Welcome drink', 'Late checkout 13h', '10% spa'] },
          { name: 'Ouro', min_points: 5000, benefits: ['Welcome drink', 'Late checkout 14h', '20% spa', 'Room upgrade subject to availability'] },
          { name: 'Diamante', min_points: 15000, benefits: ['Welcome drink', 'Late checkout 16h', '30% spa', 'Room upgrade guaranteed', 'Airport transfer'] },
        ],
      });
    }

    if (this.segments.size === 0) {
      const seeds = [
        { name: 'VIPs', filter_criteria: { is_vip: true } },
        { name: 'Hóspedes Frequentes', filter_criteria: { min_total_stays: 5 } },
        { name: 'Alto Valor', filter_criteria: { min_total_revenue: 10000 } },
        { name: 'Em Risco', filter_criteria: { lifecycle_stage: 'at_risk' } },
        { name: 'Aniversariantes do Mês', filter_criteria: { birthday_month: new Date().getUTCMonth() + 1 } },
      ];
      for (const seed of seeds) {
        void this.createSegment({ user_id: 1, property_id: 1, name: seed.name, description: seed.name, filter_criteria: seed.filter_criteria, is_dynamic: true });
      }
    }

    if (this.guestProfiles.size === 0) {
      const guests: Array<Partial<GuestProfile>> = [
        { first_name: 'João', last_name: 'Silva', email: 'joao.silva@example.com', phone: '(62) 99999-0001', lifecycle_stage: 'loyal', total_stays: 12, total_revenue: 18500, average_daily_rate: 1541.67, is_vip: false, is_blacklisted: false, source: 'direct', tags: ['frequente'] },
        { first_name: 'Maria', last_name: 'Santos', email: 'maria.santos@example.com', phone: '(62) 99999-0002', lifecycle_stage: 'repeat', total_stays: 4, total_revenue: 6200, average_daily_rate: 1550, is_vip: false, is_blacklisted: false, source: 'ota', tags: ['família'] },
        { first_name: 'Pedro', last_name: 'Oliveira', email: 'pedro.oliveira@example.com', phone: '(62) 99999-0003', lifecycle_stage: 'first_stay', total_stays: 1, total_revenue: 850, average_daily_rate: 850, is_vip: false, is_blacklisted: false, source: 'booking.com', tags: ['primeira-viagem'] },
        { first_name: 'Ana', last_name: 'Costa', email: 'ana.costa@example.com', phone: '(62) 99999-0004', lifecycle_stage: 'advocate', total_stays: 20, total_revenue: 45000, average_daily_rate: 2250, is_vip: true, is_blacklisted: false, source: 'direct', tags: ['vip'] },
        { first_name: 'Carlos', last_name: 'Lima', email: 'carlos.lima@example.com', phone: '(62) 99999-0005', lifecycle_stage: 'at_risk', total_stays: 3, total_revenue: 4100, average_daily_rate: 1366.67, is_vip: false, is_blacklisted: false, source: 'ota', last_stay_date: new Date(Date.now() - 14 * 30 * 86400000).toISOString() },
      ];
      guests.forEach((guest) => void this.createProfile(guest));
    }
  }

  async init() {
    try {
      if (process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID) {
        this.useFallback = true;
        this.ensureMemorySeeds();
        return { fallback: true, reason: 'test-mode' };
      }

      const tables = [
        {
          name: 'guest_profiles',
          createSql: `
            create table if not exists guest_profiles (
              id serial primary key,
              user_id integer,
              property_id integer,
              first_name varchar(100) not null,
              last_name varchar(100) not null,
              email varchar(255),
              phone varchar(50),
              document_type varchar(20),
              document_number varchar(50),
              nationality varchar(50) default 'Brasileira',
              date_of_birth date,
              gender varchar(20),
              address_street varchar(255),
              address_city varchar(100),
              address_state varchar(50),
              address_zip varchar(20),
              address_country varchar(50) default 'Brasil',
              preferred_language varchar(10) default 'pt-BR',
              preferred_room_type varchar(50),
              preferred_floor varchar(20),
              dietary_restrictions text,
              special_requests text,
              tags text default '[]',
              source varchar(50),
              lifecycle_stage varchar(30) default 'prospect',
              total_stays integer default 0,
              total_revenue numeric(12,2) default 0,
              average_daily_rate numeric(10,2) default 0,
              last_stay_date date,
              first_stay_date date,
              notes text,
              is_vip boolean default false,
              is_blacklisted boolean default false,
              blacklist_reason text,
              merged_into_id integer,
              created_at timestamp default now(),
              updated_at timestamp default now()
            )`,
          columns: ['"property_id" integer', '"preferred_language" varchar(10) default \'pt-BR\'', '"preferred_room_type" varchar(50)', '"preferred_floor" varchar(20)', '"dietary_restrictions" text', '"special_requests" text', '"tags" text default \'[]\'', '"source" varchar(50)', '"lifecycle_stage" varchar(30) default \'prospect\'', '"total_stays" integer default 0', '"total_revenue" numeric(12,2) default 0', '"average_daily_rate" numeric(10,2) default 0', '"last_stay_date" date', '"first_stay_date" date', '"notes" text', '"is_vip" boolean default false', '"is_blacklisted" boolean default false', '"blacklist_reason" text', '"merged_into_id" integer', '"created_at" timestamp default now()', '"updated_at" timestamp default now()'],
        },
        {
          name: 'loyalty_programs',
          createSql: `
            create table if not exists loyalty_programs (
              id serial primary key,
              user_id integer,
              property_id integer,
              name varchar(100) default 'RSV360 Fidelidade',
              points_per_brl numeric(5,3) default 1.000,
              points_expiry_days integer default 365,
              is_active boolean default true,
              tiers text default '[]',
              created_at timestamp default now(),
              updated_at timestamp default now()
            )`,
          columns: ['"property_id" integer', '"name" varchar(100) default \'RSV360 Fidelidade\'', '"points_per_brl" numeric(5,3) default 1.000', '"points_expiry_days" integer default 365', '"is_active" boolean default true', '"tiers" text default \'[]\'', '"created_at" timestamp default now()', '"updated_at" timestamp default now()'],
        },
        {
          name: 'loyalty_members',
          createSql: `
            create table if not exists loyalty_members (
              id serial primary key,
              program_id integer,
              guest_profile_id integer,
              member_number varchar(20) unique,
              tier varchar(30) default 'Bronze',
              available_points integer default 0,
              total_earned_points integer default 0,
              total_redeemed_points integer default 0,
              lifetime_points integer default 0,
              enrolled_at timestamp default now(),
              tier_updated_at timestamp,
              is_active boolean default true,
              created_at timestamp default now(),
              updated_at timestamp default now()
            )`,
          columns: ['"member_number" varchar(20) unique', '"tier" varchar(30) default \'Bronze\'', '"available_points" integer default 0', '"total_earned_points" integer default 0', '"total_redeemed_points" integer default 0', '"lifetime_points" integer default 0', '"enrolled_at" timestamp default now()', '"tier_updated_at" timestamp', '"is_active" boolean default true', '"created_at" timestamp default now()', '"updated_at" timestamp default now()'],
        },
        {
          name: 'loyalty_transactions',
          createSql: `
            create table if not exists loyalty_transactions (
              id serial primary key,
              member_id integer,
              type varchar(20) not null,
              points integer not null,
              balance_after integer,
              description text,
              booking_id integer,
              reference_id varchar(100),
              expires_at timestamp,
              created_at timestamp default now()
            )`,
          columns: ['"type" varchar(20) not null', '"points" integer not null', '"balance_after" integer', '"description" text', '"booking_id" integer', '"reference_id" varchar(100)', '"expires_at" timestamp', '"created_at" timestamp default now()'],
        },
        {
          name: 'marketing_campaigns',
          createSql: `
            create table if not exists marketing_campaigns (
              id serial primary key,
              user_id integer,
              property_id integer,
              name varchar(200),
              description text,
              type varchar(30),
              channel varchar(30),
              status varchar(30) default 'draft',
              segment_filter text default '{}',
              template_id integer,
              subject varchar(255),
              body text,
              audience_count integer default 0,
              sent_count integer default 0,
              delivered_count integer default 0,
              opened_count integer default 0,
              clicked_count integer default 0,
              bounced_count integer default 0,
              scheduled_at timestamp,
              sent_at timestamp,
              completed_at timestamp,
              created_at timestamp default now(),
              updated_at timestamp default now()
            )`,
          columns: ['"property_id" integer', '"name" varchar(200)', '"description" text', '"type" varchar(30)', '"channel" varchar(30)', '"status" varchar(30) default \'draft\'', '"segment_filter" text default \'{}\'', '"template_id" integer', '"subject" varchar(255)', '"body" text', '"audience_count" integer default 0', '"sent_count" integer default 0', '"delivered_count" integer default 0', '"opened_count" integer default 0', '"clicked_count" integer default 0', '"bounced_count" integer default 0', '"scheduled_at" timestamp', '"sent_at" timestamp', '"completed_at" timestamp', '"created_at" timestamp default now()', '"updated_at" timestamp default now()'],
        },
        {
          name: 'guest_segments',
          createSql: `
            create table if not exists guest_segments (
              id serial primary key,
              user_id integer,
              property_id integer,
              name varchar(100),
              description text,
              filter_criteria text default '{}',
              guest_count integer default 0,
              is_dynamic boolean default true,
              last_calculated_at timestamp,
              created_at timestamp default now(),
              updated_at timestamp default now()
            )`,
          columns: ['"property_id" integer', '"name" varchar(100)', '"description" text', '"filter_criteria" text default \'{}\'', '"guest_count" integer default 0', '"is_dynamic" boolean default true', '"last_calculated_at" timestamp', '"created_at" timestamp default now()', '"updated_at" timestamp default now()'],
        },
      ];

      for (const table of tables) {
        const exists = await this.tableExists(table.name);
        if (!exists) {
          await this.query(table.createSql);
        } else {
          await this.query(table.createSql);
        }
      }

      this.ensureMemorySeeds();
      return { fallback: false };
    } catch (error) {
      this.useFallback = true;
      this.ensureMemorySeeds();
      return { fallback: true, error: error instanceof Error ? error.message : String(error) };
    }
  }

  async resetMemory() {
    this.guestProfiles.clear();
    this.loyaltyPrograms.clear();
    this.loyaltyMembers.clear();
    this.loyaltyTransactions.clear();
    this.campaigns.clear();
    this.segments.clear();
    this.nextId = { profiles: 1, programs: 1, members: 1, transactions: 1, campaigns: 1, segments: 1 };
    this.ensureMemorySeeds();
  }

  private profileFromRow(row: Row): GuestProfile {
    return {
      id: toNumber(row.id),
      user_id: toNumber(row.user_id),
      property_id: row.property_id !== null && row.property_id !== undefined ? toNumber(row.property_id) : undefined,
      first_name: toText(row.first_name),
      last_name: toText(row.last_name),
      email: row.email ?? undefined,
      phone: row.phone ?? undefined,
      document_type: row.document_type ?? undefined,
      document_number: row.document_number ?? undefined,
      nationality: row.nationality ?? undefined,
      date_of_birth: row.date_of_birth ? new Date(row.date_of_birth).toISOString() : undefined,
      gender: row.gender ?? undefined,
      address_street: row.address_street ?? undefined,
      address_city: row.address_city ?? undefined,
      address_state: row.address_state ?? undefined,
      address_zip: row.address_zip ?? undefined,
      address_country: row.address_country ?? undefined,
      preferred_language: row.preferred_language ?? undefined,
      preferred_room_type: row.preferred_room_type ?? undefined,
      preferred_floor: row.preferred_floor ?? undefined,
      dietary_restrictions: row.dietary_restrictions ?? undefined,
      special_requests: row.special_requests ?? undefined,
      tags: Array.isArray(row.tags) ? row.tags : parseJson(row.tags, []),
      source: row.source ?? undefined,
      lifecycle_stage: row.lifecycle_stage || 'prospect',
      total_stays: toNumber(row.total_stays),
      total_revenue: toNumber(row.total_revenue),
      average_daily_rate: toNumber(row.average_daily_rate),
      last_stay_date: row.last_stay_date ? new Date(row.last_stay_date).toISOString() : undefined,
      first_stay_date: row.first_stay_date ? new Date(row.first_stay_date).toISOString() : undefined,
      notes: row.notes ?? undefined,
      is_vip: toBoolean(row.is_vip),
      is_blacklisted: toBoolean(row.is_blacklisted),
      blacklist_reason: row.blacklist_reason ?? undefined,
      merged_into_id: row.merged_into_id !== null && row.merged_into_id !== undefined ? toNumber(row.merged_into_id) : undefined,
      created_at: row.created_at ? new Date(row.created_at).toISOString() : nowIso(),
      updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : nowIso(),
    };
  }

  private loyaltyProgramFromRow(row: Row): LoyaltyProgram {
    return {
      id: toNumber(row.id),
      user_id: toNumber(row.user_id),
      property_id: row.property_id !== null && row.property_id !== undefined ? toNumber(row.property_id) : undefined,
      name: row.name || 'RSV360 Fidelidade',
      points_per_brl: Number(row.points_per_brl || 1),
      points_expiry_days: toNumber(row.points_expiry_days, 365),
      is_active: toBoolean(row.is_active, true),
      tiers: parseJson(row.tiers, []),
      created_at: row.created_at ? new Date(row.created_at).toISOString() : nowIso(),
      updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : nowIso(),
    };
  }

  private loyaltyMemberFromRow(row: Row): LoyaltyMember {
    return {
      id: toNumber(row.id),
      program_id: toNumber(row.program_id),
      guest_profile_id: toNumber(row.guest_profile_id),
      member_number: row.member_number || randomMemberNumber(),
      tier: row.tier || 'Bronze',
      available_points: toNumber(row.available_points),
      total_earned_points: toNumber(row.total_earned_points),
      total_redeemed_points: toNumber(row.total_redeemed_points),
      lifetime_points: toNumber(row.lifetime_points),
      enrolled_at: row.enrolled_at ? new Date(row.enrolled_at).toISOString() : nowIso(),
      tier_updated_at: row.tier_updated_at ? new Date(row.tier_updated_at).toISOString() : undefined,
      is_active: toBoolean(row.is_active, true),
      created_at: row.created_at ? new Date(row.created_at).toISOString() : nowIso(),
      updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : nowIso(),
    };
  }

  private transactionFromRow(row: Row): LoyaltyTransaction {
    return {
      id: toNumber(row.id),
      member_id: toNumber(row.member_id),
      type: row.type,
      points: toNumber(row.points),
      balance_after: row.balance_after !== null && row.balance_after !== undefined ? toNumber(row.balance_after) : undefined,
      description: row.description ?? undefined,
      booking_id: row.booking_id !== null && row.booking_id !== undefined ? toNumber(row.booking_id) : undefined,
      reference_id: row.reference_id ?? undefined,
      expires_at: row.expires_at ? new Date(row.expires_at).toISOString() : undefined,
      created_at: row.created_at ? new Date(row.created_at).toISOString() : nowIso(),
    };
  }

  private campaignFromRow(row: Row): MarketingCampaign {
    return {
      id: toNumber(row.id),
      user_id: toNumber(row.user_id),
      property_id: row.property_id !== null && row.property_id !== undefined ? toNumber(row.property_id) : undefined,
      name: row.name || 'Campanha',
      description: row.description ?? undefined,
      type: row.type ?? undefined,
      channel: row.channel ?? undefined,
      status: (row.status || 'draft') as CampaignStatus,
      segment_filter: parseJson(row.segment_filter, {}),
      template_id: row.template_id !== null && row.template_id !== undefined ? toNumber(row.template_id) : undefined,
      subject: row.subject ?? undefined,
      body: row.body ?? undefined,
      audience_count: toNumber(row.audience_count),
      sent_count: toNumber(row.sent_count),
      delivered_count: toNumber(row.delivered_count),
      opened_count: toNumber(row.opened_count),
      clicked_count: toNumber(row.clicked_count),
      bounced_count: toNumber(row.bounced_count),
      scheduled_at: row.scheduled_at ? new Date(row.scheduled_at).toISOString() : undefined,
      sent_at: row.sent_at ? new Date(row.sent_at).toISOString() : undefined,
      completed_at: row.completed_at ? new Date(row.completed_at).toISOString() : undefined,
      created_at: row.created_at ? new Date(row.created_at).toISOString() : nowIso(),
      updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : nowIso(),
    };
  }

  private segmentFromRow(row: Row): GuestSegment {
    return {
      id: toNumber(row.id),
      user_id: toNumber(row.user_id),
      property_id: row.property_id !== null && row.property_id !== undefined ? toNumber(row.property_id) : undefined,
      name: row.name || 'Segmento',
      description: row.description ?? undefined,
      filter_criteria: parseJson(row.filter_criteria, {}),
      guest_count: toNumber(row.guest_count),
      is_dynamic: toBoolean(row.is_dynamic, true),
      last_calculated_at: row.last_calculated_at ? new Date(row.last_calculated_at).toISOString() : undefined,
      created_at: row.created_at ? new Date(row.created_at).toISOString() : nowIso(),
      updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : nowIso(),
    };
  }

  private serialize(value: any) {
    if (value === undefined) return undefined;
    if (Array.isArray(value) || typeof value === 'object') return JSON.stringify(value);
    return value;
  }

  async createProfile(data: Partial<GuestProfile>) {
    const profile: GuestProfile = {
      id: this.nextId.profiles++,
      user_id: toNumber(data.user_id, 1),
      property_id: data.property_id,
      first_name: data.first_name || 'Nome',
      last_name: data.last_name || 'Sobrenome',
      email: data.email,
      phone: data.phone,
      document_type: data.document_type,
      document_number: data.document_number,
      nationality: data.nationality || 'Brasileira',
      date_of_birth: data.date_of_birth,
      gender: data.gender,
      address_street: data.address_street,
      address_city: data.address_city,
      address_state: data.address_state,
      address_zip: data.address_zip,
      address_country: data.address_country || 'Brasil',
      preferred_language: data.preferred_language || 'pt-BR',
      preferred_room_type: data.preferred_room_type,
      preferred_floor: data.preferred_floor,
      dietary_restrictions: data.dietary_restrictions,
      special_requests: data.special_requests,
      tags: data.tags || [],
      source: data.source,
      lifecycle_stage: data.lifecycle_stage || 'prospect',
      total_stays: toNumber(data.total_stays),
      total_revenue: Number(data.total_revenue || 0),
      average_daily_rate: Number(data.average_daily_rate || 0),
      last_stay_date: data.last_stay_date,
      first_stay_date: data.first_stay_date,
      notes: data.notes,
      is_vip: toBoolean(data.is_vip),
      is_blacklisted: toBoolean(data.is_blacklisted),
      blacklist_reason: data.blacklist_reason,
      merged_into_id: data.merged_into_id,
      created_at: nowIso(),
      updated_at: nowIso(),
    };

    this.guestProfiles.set(profile.id, profile);
    return clone(profile);
  }

  async getProfile(id: number) {
    const profile = this.guestProfiles.get(Number(id));
    return profile ? clone(profile) : null;
  }

  async updateProfile(id: number, data: Partial<GuestProfile>) {
    const existing = this.guestProfiles.get(Number(id));
    if (!existing) return null;
    const updated = {
      ...existing,
      ...data,
      tags: data.tags ?? existing.tags,
      updated_at: nowIso(),
    } as GuestProfile;
    this.guestProfiles.set(Number(id), updated);
    await this.updateLifecycleStage(Number(id));
    return clone(updated);
  }

  async deleteProfile(id: number) {
    const existing = this.guestProfiles.get(Number(id));
    if (!existing) return false;
    existing.merged_into_id = -1;
    existing.updated_at = nowIso();
    this.guestProfiles.set(Number(id), existing);
    return true;
  }

  private profileMatches(profile: GuestProfile, filter: any) {
    if (!filter) return true;
    if (filter.query) {
      const query = String(filter.query).toLowerCase();
      const haystack = [profile.first_name, profile.last_name, profile.email, profile.phone, profile.document_number].filter(Boolean).join(' ').toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    if (filter.is_vip !== undefined && profile.is_vip !== toBoolean(filter.is_vip)) return false;
    if (filter.is_blacklisted !== undefined && profile.is_blacklisted !== toBoolean(filter.is_blacklisted)) return false;
    if (filter.lifecycle_stage && profile.lifecycle_stage !== filter.lifecycle_stage) return false;
    if (filter.min_total_stays !== undefined && profile.total_stays < Number(filter.min_total_stays)) return false;
    if (filter.max_total_stays !== undefined && profile.total_stays > Number(filter.max_total_stays)) return false;
    if (filter.min_total_revenue !== undefined && profile.total_revenue < Number(filter.min_total_revenue)) return false;
    if (filter.max_total_revenue !== undefined && profile.total_revenue > Number(filter.max_total_revenue)) return false;
    if (filter.property_id !== undefined && Number(profile.property_id || 0) !== Number(filter.property_id)) return false;
    if (filter.birthday_month !== undefined && monthIndex(profile.date_of_birth || '') + 1 !== Number(filter.birthday_month)) return false;
    return true;
  }

  async searchProfiles(query: string, limit = 20) {
    const q = String(query || '').toLowerCase();
    return Array.from(this.guestProfiles.values())
      .filter((profile) => this.profileMatches(profile, { query: q }))
      .slice(0, limit)
      .map(clone);
  }

  async listProfiles(filters: any, page = 1, limit = 20) {
    const all = Array.from(this.guestProfiles.values()).filter((profile) => this.profileMatches(profile, filters));
    const start = (page - 1) * limit;
    return { data: all.slice(start, start + limit).map(clone), total: all.length };
  }

  async mergeProfiles(keepId: number, mergeId: number) {
    const keep = this.guestProfiles.get(Number(keepId));
    const merge = this.guestProfiles.get(Number(mergeId));
    if (!keep || !merge) return null;
    keep.total_stays += merge.total_stays;
    keep.total_revenue += merge.total_revenue;
    keep.average_daily_rate = keep.total_stays ? keep.total_revenue / keep.total_stays : keep.average_daily_rate;
    keep.is_vip = keep.is_vip || merge.is_vip;
    keep.merged_into_id = undefined;
    merge.merged_into_id = keepId;
    merge.is_blacklisted = true;
    merge.updated_at = nowIso();
    keep.updated_at = nowIso();
    await this.updateLifecycleStage(keepId);
    return clone(keep);
  }

  async getGuestTimeline(guestId: number) {
    const profile = this.guestProfiles.get(Number(guestId));
    if (!profile) return [];
    const timeline: Array<{ type: string; date: string; title: string; details?: string; icon: string }> = [
      { type: 'profile', date: profile.created_at, title: 'Perfil criado', details: `${profile.first_name} ${profile.last_name}`, icon: 'user' },
    ];
    if (profile.first_stay_date) {
      timeline.push({ type: 'stay', date: profile.first_stay_date, title: 'Primeira estadia', icon: 'calendar' });
    }
    if (profile.last_stay_date) {
      timeline.push({ type: 'stay', date: profile.last_stay_date, title: 'Última estadia', icon: 'bed' });
    }
    const member = await this.getMemberByGuest(guestId);
    if (member) {
      const txs = await this.getStatement(member.id);
      for (const tx of txs) {
        timeline.push({ type: `loyalty-${tx.type}`, date: tx.created_at, title: tx.description || `Pontos ${tx.type}`, details: `${tx.points} pts`, icon: 'star' });
      }
    }
    return timeline.sort((left, right) => right.date.localeCompare(left.date));
  }

  async updateLifecycleStage(guestId: number) {
    const profile = this.guestProfiles.get(Number(guestId));
    if (!profile) return 'prospect';
    const lastStayMonths = monthsSince(profile.last_stay_date);
    let stage: GuestProfile['lifecycle_stage'] = 'prospect';
    if (profile.total_stays <= 0) stage = 'prospect';
    else if (profile.total_stays === 1) stage = 'first_stay';
    else if (profile.total_stays <= 4) stage = 'repeat';
    else if (profile.total_stays <= 9) stage = 'loyal';
    else stage = 'advocate';
    if (lastStayMonths > 24) stage = 'lost';
    else if (lastStayMonths > 12) stage = 'at_risk';
    profile.lifecycle_stage = stage;
    profile.updated_at = nowIso();
    this.guestProfiles.set(profile.id, profile);
    return stage;
  }

  async getProfilesBySegment(filter: any) {
    const profiles = Array.from(this.guestProfiles.values()).filter((profile) => this.profileMatches(profile, filter));
    return { data: profiles.map(clone), count: profiles.length };
  }

  async createProgram(data: Partial<LoyaltyProgram>) {
    const program: LoyaltyProgram = {
      id: this.nextId.programs++,
      user_id: toNumber(data.user_id, 1),
      property_id: data.property_id,
      name: data.name || process.env.CRM_LOYALTY_PROGRAM_NAME || 'RSV360 Fidelidade',
      points_per_brl: Number(data.points_per_brl || process.env.CRM_DEFAULT_POINTS_PER_BRL || 1),
      points_expiry_days: toNumber(data.points_expiry_days, Number(process.env.CRM_POINTS_EXPIRY_DAYS || 365)),
      is_active: toBoolean(data.is_active, true),
      tiers: data.tiers || [
        { name: 'Bronze', min_points: 0, benefits: ['Welcome drink'] },
        { name: 'Prata', min_points: 1000, benefits: ['Welcome drink', 'Late checkout 13h', '10% spa'] },
        { name: 'Ouro', min_points: 5000, benefits: ['Welcome drink', 'Late checkout 14h', '20% spa', 'Room upgrade subject to availability'] },
        { name: 'Diamante', min_points: 15000, benefits: ['Welcome drink', 'Late checkout 16h', '30% spa', 'Room upgrade guaranteed', 'Airport transfer'] },
      ],
      created_at: nowIso(),
      updated_at: nowIso(),
    };
    this.loyaltyPrograms.set(program.id, program);
    return clone(program);
  }

  async getProgram(id: number) {
    const program = this.loyaltyPrograms.get(Number(id));
    return program ? clone(program) : null;
  }

  async updateProgram(id: number, data: Partial<LoyaltyProgram>) {
    const existing = this.loyaltyPrograms.get(Number(id));
    if (!existing) return null;
    const updated = { ...existing, ...data, tiers: data.tiers ?? existing.tiers, updated_at: nowIso() };
    this.loyaltyPrograms.set(Number(id), updated);
    return clone(updated);
  }

  async getActiveProgram(userId: number) {
    const program = Array.from(this.loyaltyPrograms.values()).find((item) => item.user_id === Number(userId) && item.is_active);
    return program ? clone(program) : null;
  }

  async enrollMember(programId: number, guestProfileId: number) {
    const member: LoyaltyMember = {
      id: this.nextId.members++,
      program_id: Number(programId),
      guest_profile_id: Number(guestProfileId),
      member_number: randomMemberNumber(),
      tier: 'Bronze',
      available_points: 0,
      total_earned_points: 0,
      total_redeemed_points: 0,
      lifetime_points: 0,
      enrolled_at: nowIso(),
      tier_updated_at: nowIso(),
      is_active: true,
      created_at: nowIso(),
      updated_at: nowIso(),
    };
    this.loyaltyMembers.set(member.id, member);
    return clone(member);
  }

  async getMember(id: number) {
    const member = this.loyaltyMembers.get(Number(id));
    return member ? clone(member) : null;
  }

  async getMemberByGuest(guestProfileId: number) {
    const member = Array.from(this.loyaltyMembers.values()).find((item) => item.guest_profile_id === Number(guestProfileId));
    return member ? clone(member) : null;
  }

  async updateMember(id: number, data: Partial<LoyaltyMember>) {
    const existing = this.loyaltyMembers.get(Number(id));
    if (!existing) return null;
    const updated = { ...existing, ...data, updated_at: nowIso() };
    this.loyaltyMembers.set(Number(id), updated);
    return clone(updated);
  }

  async listMembers(filters: any, page = 1, limit = 20) {
    const all = Array.from(this.loyaltyMembers.values()).filter((member) => {
      if (!filters) return true;
      if (filters.program_id !== undefined && member.program_id !== Number(filters.program_id)) return false;
      if (filters.tier && member.tier !== filters.tier) return false;
      if (filters.guest_profile_id !== undefined && member.guest_profile_id !== Number(filters.guest_profile_id)) return false;
      return true;
    });
    const start = (page - 1) * limit;
    return { data: all.slice(start, start + limit).map(clone), total: all.length };
  }

  async createTransaction(data: Partial<LoyaltyTransaction>) {
    const tx: LoyaltyTransaction = {
      id: this.nextId.transactions++,
      member_id: Number(data.member_id || 0),
      type: (data.type || 'adjust') as LoyaltyTransaction['type'],
      points: toNumber(data.points),
      balance_after: data.balance_after,
      description: data.description,
      booking_id: data.booking_id,
      reference_id: data.reference_id,
      expires_at: data.expires_at,
      created_at: nowIso(),
    };
    this.loyaltyTransactions.set(tx.id, tx);
    return clone(tx);
  }

  async listTransactions(memberId: number, page = 1, limit = 20) {
    const all = Array.from(this.loyaltyTransactions.values()).filter((tx) => tx.member_id === Number(memberId));
    all.sort((left, right) => right.created_at.localeCompare(left.created_at));
    const start = (page - 1) * limit;
    return { data: all.slice(start, start + limit).map(clone), total: all.length };
  }

  async getStatement(memberId: number, startDate?: string, endDate?: string) {
    const all = Array.from(this.loyaltyTransactions.values()).filter((tx) => tx.member_id === Number(memberId));
    return all.filter((tx) => {
      if (startDate && tx.created_at < startDate) return false;
      if (endDate && tx.created_at > endDate) return false;
      return true;
    }).sort((left, right) => right.created_at.localeCompare(left.created_at)).map(clone);
  }

  async expirePoints() {
    const now = new Date().toISOString();
    let expired = 0;
    let membersAffected = 0;
    for (const member of this.loyaltyMembers.values()) {
      const program = this.loyaltyPrograms.get(member.program_id);
      const eligible = Array.from(this.loyaltyTransactions.values()).filter((tx) => tx.member_id === member.id && tx.type === 'earn' && tx.expires_at && tx.expires_at <= now && tx.points > 0);
      let memberExpired = 0;
      for (const tx of eligible) {
        const duplicate = Array.from(this.loyaltyTransactions.values()).some((existing) => existing.member_id === member.id && existing.type === 'expire' && existing.reference_id === String(tx.id));
        if (duplicate) continue;
        const amount = Math.min(tx.points, member.available_points);
        if (amount <= 0) continue;
        member.available_points -= amount;
        member.total_redeemed_points += amount;
        const expireTx = await this.createTransaction({
          member_id: member.id,
          type: 'expire',
          points: -amount,
          balance_after: member.available_points,
          description: 'Pontos expirados',
          reference_id: String(tx.id),
        });
        void expireTx;
        expired += amount;
        memberExpired += amount;
      }
      if (memberExpired > 0) {
        membersAffected += 1;
        member.updated_at = nowIso();
      }
    }
    return { expired, membersAffected };
  }

  async createCampaign(data: Partial<MarketingCampaign>) {
    const campaign: MarketingCampaign = {
      id: this.nextId.campaigns++,
      user_id: toNumber(data.user_id, 1),
      property_id: data.property_id,
      name: data.name || 'Campanha CRM',
      description: data.description,
      type: data.type || 'email',
      channel: data.channel || data.type || 'email',
      status: (data.status || 'draft') as MarketingCampaign['status'],
      segment_filter: data.segment_filter || {},
      template_id: data.template_id,
      subject: data.subject,
      body: data.body,
      audience_count: toNumber(data.audience_count),
      sent_count: toNumber(data.sent_count),
      delivered_count: toNumber(data.delivered_count),
      opened_count: toNumber(data.opened_count),
      clicked_count: toNumber(data.clicked_count),
      bounced_count: toNumber(data.bounced_count),
      scheduled_at: data.scheduled_at,
      sent_at: data.sent_at,
      completed_at: data.completed_at,
      created_at: nowIso(),
      updated_at: nowIso(),
    };
    this.campaigns.set(campaign.id, campaign);
    return clone(campaign);
  }

  async getCampaign(id: number) {
    const campaign = this.campaigns.get(Number(id));
    return campaign ? clone(campaign) : null;
  }

  async updateCampaign(id: number, data: Partial<MarketingCampaign>) {
    const existing = this.campaigns.get(Number(id));
    if (!existing) return null;
    const updated = { ...existing, ...data, segment_filter: data.segment_filter ?? existing.segment_filter, updated_at: nowIso() };
    this.campaigns.set(Number(id), updated);
    return clone(updated);
  }

  async deleteCampaign(id: number) {
    return this.campaigns.delete(Number(id));
  }

  async listCampaigns(filters: any, page = 1, limit = 20) {
    const all = Array.from(this.campaigns.values()).filter((campaign) => {
      if (!filters) return true;
      if (filters.status && campaign.status !== filters.status) return false;
      if (filters.type && campaign.type !== filters.type) return false;
      return true;
    });
    const start = (page - 1) * limit;
    return { data: all.slice(start, start + limit).map(clone), total: all.length };
  }

  async createSegment(data: Partial<GuestSegment>) {
    const segment: GuestSegment = {
      id: this.nextId.segments++,
      user_id: toNumber(data.user_id, 1),
      property_id: data.property_id,
      name: data.name || 'Segmento CRM',
      description: data.description,
      filter_criteria: data.filter_criteria || {},
      guest_count: toNumber(data.guest_count),
      is_dynamic: toBoolean(data.is_dynamic, true),
      last_calculated_at: data.last_calculated_at,
      created_at: nowIso(),
      updated_at: nowIso(),
    };
    this.segments.set(segment.id, segment);
    return clone(segment);
  }

  async getSegment(id: number) {
    const segment = this.segments.get(Number(id));
    return segment ? clone(segment) : null;
  }

  async updateSegment(id: number, data: Partial<GuestSegment>) {
    const existing = this.segments.get(Number(id));
    if (!existing) return null;
    const updated = { ...existing, ...data, filter_criteria: data.filter_criteria ?? existing.filter_criteria, updated_at: nowIso() };
    this.segments.set(Number(id), updated);
    return clone(updated);
  }

  async deleteSegment(id: number) {
    return this.segments.delete(Number(id));
  }

  async listSegments(userId: number) {
    const all = Array.from(this.segments.values()).filter((segment) => Number(userId) === 0 || segment.user_id === Number(userId));
    return all.map(clone);
  }

  async calculateSegmentCount(filter: any) {
    const result = await this.getProfilesBySegment(filter);
    return result.count;
  }

  async getDashboardKPIs(userId: number) {
    const profiles = Array.from(this.guestProfiles.values()).filter((profile) => Number(userId) === 0 || profile.user_id === Number(userId));
    const members = Array.from(this.loyaltyMembers.values());
    const campaigns = Array.from(this.campaigns.values()).filter((campaign) => Number(userId) === 0 || campaign.user_id === Number(userId));
    const totalGuests = profiles.length;
    const activeGuests = profiles.filter((profile) => monthsSince(profile.last_stay_date) <= 12).length;
    const newGuestsThisMonth = profiles.filter((profile) => profile.created_at.slice(0, 7) === nowIso().slice(0, 7)).length;
    const vipCount = profiles.filter((profile) => profile.is_vip).length;
    const avgLtv = totalGuests ? profiles.reduce((sum, profile) => sum + Number(profile.total_revenue || 0), 0) / totalGuests : 0;
    const loyaltyMembers = members.length;
    const pointsCirculation = members.reduce((sum, member) => sum + Number(member.available_points || 0), 0);
    const retentionRate = totalGuests ? (profiles.filter((profile) => profile.total_stays > 1).length / totalGuests) * 100 : 0;
    const lifecycleDistribution = Object.fromEntries(['prospect', 'first_stay', 'repeat', 'loyal', 'advocate', 'at_risk', 'lost'].map((stage) => [stage, profiles.filter((profile) => profile.lifecycle_stage === stage).length]));
    const tierDistribution = Object.fromEntries(['Bronze', 'Prata', 'Ouro', 'Diamante'].map((tier) => [tier, members.filter((member) => member.tier === tier).length]));
    const topGuests = [...profiles].sort((left, right) => Number(right.total_revenue || 0) - Number(left.total_revenue || 0)).slice(0, 10).map((profile) => ({
      id: profile.id,
      name: `${profile.first_name} ${profile.last_name}`,
      total_revenue: profile.total_revenue,
      total_stays: profile.total_stays,
      lifecycle_stage: profile.lifecycle_stage,
    }));
    const campaignsActive = campaigns.filter((campaign) => ['draft', 'scheduled', 'sending'].includes(campaign.status)).length;
    const campaignsMonth = campaigns.filter((campaign) => campaign.created_at.slice(0, 7) === nowIso().slice(0, 7)).length;

    return {
      total_guests: totalGuests,
      active_guests: activeGuests,
      new_guests_month: newGuestsThisMonth,
      vip_count: vipCount,
      avg_ltv: avgLtv,
      loyalty_members: loyaltyMembers,
      points_circulation: pointsCirculation,
      retention_rate: retentionRate,
      lc_prospect: lifecycleDistribution.prospect,
      lc_first_stay: lifecycleDistribution.first_stay,
      lc_repeat: lifecycleDistribution.repeat,
      lc_loyal: lifecycleDistribution.loyal,
      lc_advocate: lifecycleDistribution.advocate,
      lc_at_risk: lifecycleDistribution.at_risk,
      lc_lost: lifecycleDistribution.lost,
      tier_bronze: tierDistribution.Bronze,
      tier_prata: tierDistribution.Prata,
      tier_ouro: tierDistribution.Ouro,
      tier_diamante: tierDistribution.Diamante,
      top_guests: topGuests,
      campaigns_active: campaignsActive,
      campaigns_month: campaignsMonth,
    };
  }
}

export const crmRepository = new CrmRepository();
