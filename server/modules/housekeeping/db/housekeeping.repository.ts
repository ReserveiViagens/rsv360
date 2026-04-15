import { Pool } from 'pg';
import type { ChecklistItem, ChecklistTemplate, HousekeepingTask, MaintenanceOrder, Room } from './schema';

type Row = Record<string, any>;
type RoomFilters = {
  status?: string;
  floor?: number | string;
  property_id?: number | string;
  search?: string;
};
type TaskFilters = {
  status?: string;
  date?: string;
  assignee?: number | string;
  room_id?: number | string;
  task_type?: string;
  property_id?: number | string;
};
type MaintenanceFilters = {
  status?: string;
  priority?: string;
  room_id?: number | string;
  date?: string;
};
type ChecklistFilters = {
  task_type?: string;
  room_type?: string;
  property_id?: number | string;
};

type MemoryStore = {
  rooms: Room[];
  tasks: HousekeepingTask[];
  maintenance: MaintenanceOrder[];
  checklists: ChecklistTemplate[];
  nextIds: {
    room: number;
    task: number;
    maintenance: number;
    checklist: number;
  };
};

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const tableCache = new Map<string, string | null>();
const columnsCache = new Map<string, string[]>();
let databaseUnavailable = false;
databaseUnavailable = process.env.NODE_ENV !== 'production' || process.env.ENABLE_MODULE_DB !== 'true';
const memory: MemoryStore = {
  rooms: [],
  tasks: [],
  maintenance: [],
  checklists: [],
  nextIds: {
    room: 1,
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
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function pickFirst<T>(values: Array<T | null | undefined>) {
  return values.find((value) => value !== null && value !== undefined);
}

function arrayify(value: any) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function createChecklistItems(items: Array<Partial<ChecklistItem> & { text: string; category: string; is_required: boolean }>): ChecklistItem[] {
  return items.map((item, index) => ({
    id: item.id || `${Date.now()}-${index + 1}`,
    text: item.text,
    category: item.category,
    is_required: item.is_required,
    completed: item.completed ?? false,
    completed_at: item.completed_at,
  }));
}

function mapRoomRow(row: Row): Room {
  const metadata = typeof row.metadata === 'object' && row.metadata ? row.metadata : {};
  return {
    id: Number(pickFirst([row.id, row.room_id, row.accommodation_id])) || 0,
    name: String(pickFirst([row.name, row.room_name, row.room_number, row.accommodation_name]) || 'Quarto'),
    floor: toNumber(pickFirst([row.floor, row.floor_number, row.floorNumber])),
    room_type: pickFirst([row.room_type, row.accommodation_type, row.property_type]),
    status: (pickFirst([row.status, metadata.status]) || 'clean') as Room['status'],
    current_guest: pickFirst([row.current_guest, row.currentGuest, metadata.current_guest, metadata.currentGuest]),
    notes: pickFirst([row.notes, row.description, metadata.notes, metadata.housekeeping_notes]),
    last_cleaned_at: pickFirst([row.last_cleaned_at, row.lastCleanedAt, metadata.last_cleaned_at]),
    last_inspected_at: pickFirst([row.last_inspected_at, row.lastInspectedAt, metadata.last_inspected_at]),
    property_id: toNumber(pickFirst([row.property_id, row.enterprise_id, row.propertyId])),
  };
}

function mapTaskRow(row: Row): HousekeepingTask {
  return {
    id: Number(row.id) || 0,
    room_id: Number(pickFirst([row.room_id, row.roomId])) || 0,
    room_name: pickFirst([row.room_name, row.roomName]),
    task_type: row.task_type,
    status: row.status,
    priority: row.priority,
    assigned_to: toNumber(pickFirst([row.assigned_to, row.assignedTo])),
    assigned_to_name: pickFirst([row.assigned_to_name, row.assignedToName]),
    checklist_id: toNumber(pickFirst([row.checklist_id, row.checklistId])),
    checklist_items: arrayify(pickFirst([row.checklist_items, row.checklistItems])) as ChecklistItem[],
    started_at: pickFirst([row.started_at, row.startedAt]),
    completed_at: pickFirst([row.completed_at, row.completedAt]),
    inspected_at: pickFirst([row.inspected_at, row.inspectedAt]),
    inspected_by: toNumber(pickFirst([row.inspected_by, row.inspectedBy])),
    inspection_rating: toNumber(pickFirst([row.inspection_rating, row.inspectionRating])),
    estimated_minutes: toNumber(pickFirst([row.estimated_minutes, row.estimatedMinutes])),
    actual_minutes: toNumber(pickFirst([row.actual_minutes, row.actualMinutes])),
    notes: row.notes,
    property_id: toNumber(pickFirst([row.property_id, row.propertyId])),
    created_at: row.created_at || row.createdAt || nowIso(),
    updated_at: row.updated_at || row.updatedAt || nowIso(),
  };
}

function mapMaintenanceRow(row: Row): MaintenanceOrder {
  return {
    id: Number(row.id) || 0,
    room_id: Number(pickFirst([row.room_id, row.roomId])) || 0,
    room_name: pickFirst([row.room_name, row.roomName]),
    category: row.category,
    priority: row.priority,
    status: row.status,
    title: row.title,
    description: row.description,
    reported_by: toNumber(pickFirst([row.reported_by, row.reportedBy])),
    assigned_to: toNumber(pickFirst([row.assigned_to, row.assignedTo])),
    resolution: row.resolution,
    estimated_cost: toNumber(pickFirst([row.estimated_cost, row.estimatedCost])),
    actual_cost: toNumber(pickFirst([row.actual_cost, row.actualCost])),
    started_at: pickFirst([row.started_at, row.startedAt]),
    completed_at: pickFirst([row.completed_at, row.completedAt]),
    property_id: toNumber(pickFirst([row.property_id, row.propertyId])),
    created_at: row.created_at || row.createdAt || nowIso(),
    updated_at: row.updated_at || row.updatedAt || nowIso(),
  };
}

function mapChecklistRow(row: Row): ChecklistTemplate {
  return {
    id: Number(row.id) || 0,
    name: row.name,
    task_type: row.task_type,
    room_type: row.room_type,
    items: arrayify(row.items) as ChecklistItem[],
    is_default: row.is_default ?? row.isDefault,
    property_id: toNumber(pickFirst([row.property_id, row.propertyId])),
  };
}

function dateOnly(value: string | Date) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function daysBetween(start?: string, end?: string) {
  if (!start || !end) return undefined;
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return undefined;
  return Math.max(Math.round((endDate.getTime() - startDate.getTime()) / 60000), 0);
}

function buildWhere(conditions: string[]) {
  return conditions.length ? ` where ${conditions.join(' and ')}` : '';
}

function isConnectionError(error: any) {
  return ['ECONNREFUSED', 'ENOTFOUND', 'EAI_AGAIN', '57P03'].includes(error?.code);
}

export class HousekeepingRepository {
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
    memory.rooms = [];
    memory.tasks = [];
    memory.maintenance = [];
    memory.checklists = [];
    memory.nextIds = { room: 1, task: 1, maintenance: 1, checklist: 1 };
  }

  async tryTable(candidates: string[]) {
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

  async getColumns(table: string) {
    if (databaseUnavailable) {
      return [];
    }

    if (columnsCache.has(table)) {
      return columnsCache.get(table) || [];
    }

    let result;
    try {
      result = await this.query(
        `select column_name
         from information_schema.columns
         where table_schema = 'public' and table_name = $1
         order by ordinal_position`,
        [table]
      );
    } catch (error) {
      if (isConnectionError(error) || error?.code === 'DB_UNAVAILABLE') {
        databaseUnavailable = true;
        return [];
      }
      throw error;
    }

    const columns = result.rows.map((row) => row.column_name as string);
    columnsCache.set(table, columns);
    return columns;
  }

  private async selectRows(table: string, where = '', values: any[] = []) {
    if (databaseUnavailable) {
      return [];
    }

    const result = await this.query(`select * from ${quoteIdent(table)}${where}`, values);
    return result.rows;
  }

  private async selectOne(table: string, where: string, values: any[] = []) {
    if (databaseUnavailable) {
      return null;
    }

    const rows = await this.selectRows(table, `${where} limit 1`, values);
    return rows[0] || null;
  }

  private async insertRow(table: string, data: Row) {
    if (databaseUnavailable) {
      return {};
    }

    const columns = await this.getColumns(table);
    const entries = Object.entries(data).filter(([, value]) => value !== undefined && value !== null);
    const filtered = entries.filter(([key]) => columns.includes(key));

    if (filtered.length === 0) {
      return {};
    }

    const sqlColumns = filtered.map(([key]) => quoteIdent(key)).join(', ');
    const placeholders = filtered.map((_, index) => `$${index + 1}`).join(', ');
    const values = filtered.map(([, value]) => value);
    const result = await this.query(
      `insert into ${quoteIdent(table)} (${sqlColumns}) values (${placeholders}) returning *`,
      values
    );
    return result.rows[0] || {};
  }

  private async updateRow(table: string, idColumn: string, id: number | string, updates: Row) {
    if (databaseUnavailable) {
      return {};
    }

    const columns = await this.getColumns(table);
    const filtered = Object.entries(updates).filter(([key, value]) => value !== undefined && value !== null && columns.includes(key));
    if (filtered.length === 0) {
      return await this.selectOne(table, ` where ${quoteIdent(idColumn)} = $1`, [id]);
    }

    const setSql = filtered.map(([key], index) => `${quoteIdent(key)} = $${index + 1}`).join(', ');
    const values = filtered.map(([, value]) => value);
    values.push(id);
    const result = await this.query(
      `update ${quoteIdent(table)} set ${setSql} where ${quoteIdent(idColumn)} = $${values.length} returning *`,
      values
    );
    return result.rows[0] || {};
  }

  private ensureMemoryRoom(id: number, partial: Partial<Room> = {}): Room {
    let room = memory.rooms.find((entry) => entry.id === id);
    if (!room) {
      room = {
        id,
        name: partial.name || `Quarto ${id}`,
        status: 'clean',
      };
      memory.rooms.push(room);
    }

    Object.assign(room, partial);
    return room;
  }

  private addMemory<T extends { id: number }>(collection: T[], nextKey: keyof MemoryStore['nextIds'], item: Omit<T, 'id'>): T {
    const id = memory.nextIds[nextKey] as number;
    memory.nextIds[nextKey] += 1;
    const row = { id, ...clone(item) } as T;
    collection.push(row);
    return clone(row);
  }

  private updateMemory<T extends { id: number }>(collection: T[], id: number, updates: Partial<T>): T | null {
    const row = collection.find((entry) => entry.id === id);
    if (!row) return null;
    Object.assign(row, clone(updates));
    return clone(row);
  }

  private removeMemory<T extends { id: number }>(collection: T[], id: number) {
    const index = collection.findIndex((entry) => entry.id === id);
    if (index >= 0) {
      collection.splice(index, 1);
    }
  }

  async resolveRoomTable() {
    return this.tryTable(['room_status', 'accommodation_status', 'rooms', 'accommodations', 'room_types']);
  }

  async resolveTaskTable() {
    return this.tryTable(['housekeeping_tasks', 'hk_tasks']);
  }

  async resolveMaintenanceTable() {
    return this.tryTable(['maintenance_orders', 'maintenance_requests']);
  }

  async resolveChecklistTable() {
    return this.tryTable(['housekeeping_checklists', 'hk_checklists']);
  }

  async resolveBookingsTable() {
    return this.tryTable(['bookings', 'reservations']);
  }

  async listRooms(filters: RoomFilters = {}): Promise<Room[]> {
    const table = await this.resolveRoomTable();
    let rooms: Room[] = [];

    if (table) {
      const rows = await this.selectRows(table);
      rooms = rows.map(mapRoomRow);
    } else {
      rooms = clone(memory.rooms);
    }

    return rooms.filter((room) => {
      if (filters.status && room.status !== filters.status) return false;
      if (filters.floor !== undefined && toNumber(filters.floor) !== room.floor) return false;
      if (filters.property_id !== undefined && toNumber(filters.property_id) !== room.property_id) return false;
      if (filters.search) {
        const search = filters.search.toLowerCase();
        return [room.name, room.room_type, room.notes].filter(Boolean).some((value) => String(value).toLowerCase().includes(search));
      }
      return true;
    });
  }

  async getRoomById(id: number | string): Promise<Room | null> {
    const roomId = Number(id);
    const table = await this.resolveRoomTable();
    if (table) {
      const columns = await this.getColumns(table);
      const idColumn = columns.includes('id') ? 'id' : columns.includes('room_id') ? 'room_id' : columns.includes('accommodation_id') ? 'accommodation_id' : null;
      if (!idColumn) return null;
      const row = await this.selectOne(table, ` where ${quoteIdent(idColumn)} = $1`, [roomId]);
      return row ? mapRoomRow(row) : null;
    }

    return clone(memory.rooms.find((room) => room.id === roomId) || null);
  }

  async updateRoomStatus(id: number | string, status: Room['status'], notes?: string): Promise<Room> {
    const roomId = Number(id);
    const table = await this.resolveRoomTable();

    if (table) {
      const columns = await this.getColumns(table);
      const idColumn = columns.includes('id') ? 'id' : columns.includes('room_id') ? 'room_id' : columns.includes('accommodation_id') ? 'accommodation_id' : null;
      if (!idColumn) {
        throw new Error('Quarto não encontrado');
      }

      const current = await this.selectOne(table, ` where ${quoteIdent(idColumn)} = $1`, [roomId]);
      if (!current) {
        throw new Error('Quarto não encontrado');
      }

      const updates: Row = {
        status,
        updated_at: nowIso(),
      };

      if (notes && columns.includes('notes')) {
        updates.notes = notes;
      } else if (notes && columns.includes('metadata')) {
        updates.metadata = {
          ...(typeof current.metadata === 'object' && current.metadata ? current.metadata : {}),
          housekeeping_notes: notes,
          status,
        };
      }

      const result = await this.updateRow(table, idColumn, roomId, updates);
      return mapRoomRow(result);
    }

    const room = this.ensureMemoryRoom(roomId, { status, notes });
    const updatedRoom = { ...room, status, notes };
    const index = memory.rooms.findIndex((entry) => entry.id === roomId);
    memory.rooms[index] = updatedRoom as Room;
    return clone(updatedRoom as Room);
  }

  async bulkUpdateStatus(ids: Array<number | string>, status: Room['status']): Promise<number> {
    let count = 0;
    for (const id of ids) {
      await this.updateRoomStatus(id, status);
      count += 1;
    }
    return count;
  }

  async getRoomsByFloor(): Promise<Record<number, Room[]>> {
    const rooms = await this.listRooms();
    return rooms.reduce<Record<number, Room[]>>((acc, room) => {
      const floor = room.floor ?? 0;
      acc[floor] = acc[floor] || [];
      acc[floor].push(room);
      return acc;
    }, {});
  }

  async getDashboardStats(): Promise<{ clean: number; dirty: number; cleaning: number; maintenance: number; total: number }> {
    const rooms = await this.listRooms();
    return rooms.reduce(
      (acc, room) => {
        acc.total += 1;
        if (room.status in acc) {
          (acc as any)[room.status] += 1;
        }
        return acc;
      },
      { clean: 0, dirty: 0, cleaning: 0, maintenance: 0, total: 0 }
    );
  }

  async markDirtyAfterCheckout(roomId: number | string): Promise<void> {
    await this.updateRoomStatus(roomId, 'dirty', 'Checkout concluído');
  }

  async findRoomIdByBookingId(bookingId: string | number): Promise<number | null> {
    const table = await this.resolveBookingsTable();
    if (!table) return null;

    const columns = await this.getColumns(table);
    const idColumn = columns.includes('id') ? 'id' : columns.includes('booking_id') ? 'booking_id' : null;
    if (!idColumn) return null;

    const row = await this.selectOne(table, ` where ${quoteIdent(idColumn)} = $1`, [bookingId]);
    if (!row) return null;

    const roomId = toNumber(pickFirst([row.room_id, row.accommodation_id, row.roomId, row.accommodationId]));
    return roomId ?? null;
  }

  async createTask(data: Partial<HousekeepingTask> & { room_id: number; task_type: HousekeepingTask['task_type'] }): Promise<HousekeepingTask> {
    const checklist = data.checklist_items?.length ? data.checklist_items : (await this.getChecklistForTaskType(data.task_type))?.items || [];
    const room = await this.getRoomById(data.room_id);
    const task: Omit<HousekeepingTask, 'id'> = {
      room_id: data.room_id,
      room_name: data.room_name || room?.name,
      task_type: data.task_type,
      status: data.status || 'pending',
      priority: data.priority || 'normal',
      assigned_to: data.assigned_to,
      assigned_to_name: data.assigned_to_name,
      checklist_id: data.checklist_id,
      checklist_items: clone(checklist),
      started_at: data.started_at,
      completed_at: data.completed_at,
      inspected_at: data.inspected_at,
      inspected_by: data.inspected_by,
      inspection_rating: data.inspection_rating,
      estimated_minutes: data.estimated_minutes || Number(process.env.HK_DEFAULT_TASK_MINUTES || 30),
      actual_minutes: data.actual_minutes,
      notes: data.notes,
      property_id: data.property_id || room?.property_id,
      created_at: data.created_at || nowIso(),
      updated_at: data.updated_at || nowIso(),
    };

    const table = await this.resolveTaskTable();
    if (table) {
      const inserted = await this.insertRow(table, {
        ...task,
        checklist_items: JSON.stringify(task.checklist_items),
      });
      return mapTaskRow(inserted);
    }

    return this.addMemory(memory.tasks, 'task', task);
  }

  async listTasks(filters: TaskFilters = {}): Promise<HousekeepingTask[]> {
    const table = await this.resolveTaskTable();
    let tasks: HousekeepingTask[] = [];

    if (table) {
      const rows = await this.selectRows(table, ' order by created_at desc');
      tasks = rows.map(mapTaskRow);
    } else {
      tasks = clone(memory.tasks);
    }

    return tasks.filter((task) => {
      if (filters.status && task.status !== filters.status) return false;
      if (filters.task_type && task.task_type !== filters.task_type) return false;
      if (filters.assignee !== undefined && Number(filters.assignee) !== task.assigned_to) return false;
      if (filters.room_id !== undefined && Number(filters.room_id) !== task.room_id) return false;
      if (filters.property_id !== undefined && Number(filters.property_id) !== task.property_id) return false;
      if (filters.date) {
        const taskDate = new Date(task.created_at);
        const target = dateOnly(filters.date);
        if (!target || Number.isNaN(taskDate.getTime()) || taskDate.toISOString().slice(0, 10) !== target.toISOString().slice(0, 10)) {
          return false;
        }
      }
      return true;
    });
  }

  async getTaskById(id: number | string): Promise<HousekeepingTask | null> {
    const taskId = Number(id);
    const table = await this.resolveTaskTable();
    if (table) {
      const row = await this.selectOne(table, ` where id = $1`, [taskId]);
      return row ? mapTaskRow(row) : null;
    }

    return clone(memory.tasks.find((task) => task.id === taskId) || null);
  }

  async updateTask(id: number | string, updates: Partial<HousekeepingTask>): Promise<HousekeepingTask> {
    const taskId = Number(id);
    const table = await this.resolveTaskTable();
    if (table) {
      const result = await this.updateRow(table, 'id', taskId, {
        ...updates,
        checklist_items: updates.checklist_items ? JSON.stringify(updates.checklist_items) : updates.checklist_items,
      });
      return mapTaskRow(result);
    }

    const updated = this.updateMemory(memory.tasks, taskId, updates as any);
    if (!updated) {
      throw new Error('Tarefa não encontrada');
    }
    return updated;
  }

  async assignTask(id: number | string, userId: number | string): Promise<HousekeepingTask> {
    return this.updateTask(id, {
      assigned_to: Number(userId),
      status: 'assigned',
      updated_at: nowIso(),
    } as Partial<HousekeepingTask>);
  }

  async startTask(id: number | string): Promise<HousekeepingTask> {
    return this.updateTask(id, {
      status: 'in_progress',
      started_at: nowIso(),
      updated_at: nowIso(),
    } as Partial<HousekeepingTask>);
  }

  async completeTask(id: number | string, checklist?: ChecklistItem[], notes?: string): Promise<HousekeepingTask> {
    const existing = await this.getTaskById(id);
    if (!existing) {
      throw new Error('Tarefa não encontrada');
    }

    const actualMinutes = daysBetween(existing.started_at, nowIso());
    return this.updateTask(id, {
      status: 'completed',
      completed_at: nowIso(),
      actual_minutes: actualMinutes,
      checklist_items: checklist || existing.checklist_items,
      notes: notes || existing.notes,
      updated_at: nowIso(),
    } as Partial<HousekeepingTask>);
  }

  async inspectTask(id: number | string, rating: number, inspectorId: number | string, notes?: string): Promise<HousekeepingTask> {
    const task = await this.getTaskById(id);
    if (!task) {
      throw new Error('Tarefa não encontrada');
    }

    const minRating = Number(process.env.HK_MIN_INSPECTION_RATING || 4);
    const status: HousekeepingTask['status'] = rating >= minRating ? 'inspected' : 'rejected';
    if (task.room_id) {
      await this.updateRoomStatus(task.room_id, rating >= minRating ? 'clean' : 'dirty', notes);
    }

    return this.updateTask(id, {
      status,
      inspected_at: nowIso(),
      inspected_by: Number(inspectorId),
      inspection_rating: rating,
      notes: notes || task.notes,
      updated_at: nowIso(),
    } as Partial<HousekeepingTask>);
  }

  async getTasksByAssignee(userId: number | string): Promise<HousekeepingTask[]> {
    return this.listTasks({ assignee: userId });
  }

  async getTaskStats(dateRange?: { from?: string; to?: string }): Promise<{ pending: number; inProgress: number; completed: number; avgMinutes: number }> {
    const tasks = await this.listTasks();
    const filtered = tasks.filter((task) => {
      if (!dateRange?.from && !dateRange?.to) return true;
      const created = new Date(task.created_at);
      if (dateRange.from && created < new Date(dateRange.from)) return false;
      if (dateRange.to && created > new Date(dateRange.to)) return false;
      return true;
    });

    const completed = filtered.filter((task) => task.status === 'completed');
    const avgMinutes = completed.length
      ? Math.round(completed.reduce((sum, task) => sum + (task.actual_minutes || 0), 0) / completed.length)
      : 0;

    return {
      pending: filtered.filter((task) => task.status === 'pending').length,
      inProgress: filtered.filter((task) => task.status === 'in_progress').length,
      completed: completed.length,
      avgMinutes,
    };
  }

  async createMaintenanceOrder(data: Partial<MaintenanceOrder> & { room_id: number; title: string; description: string }): Promise<MaintenanceOrder> {
    const room = await this.getRoomById(data.room_id);
    if (data.priority === 'critical' && room) {
      await this.updateRoomStatus(data.room_id, 'out_of_order', data.description);
    } else if (data.priority === 'high' && room) {
      await this.updateRoomStatus(data.room_id, 'maintenance', data.description);
    }

    const order: Omit<MaintenanceOrder, 'id'> = {
      room_id: data.room_id,
      room_name: data.room_name || room?.name,
      category: data.category || 'other',
      priority: data.priority || 'normal',
      status: data.status || 'open',
      title: data.title,
      description: data.description,
      reported_by: data.reported_by,
      assigned_to: data.assigned_to,
      resolution: data.resolution,
      estimated_cost: data.estimated_cost,
      actual_cost: data.actual_cost,
      started_at: data.started_at,
      completed_at: data.completed_at,
      property_id: data.property_id || room?.property_id,
      created_at: data.created_at || nowIso(),
      updated_at: data.updated_at || nowIso(),
    };

    const table = await this.resolveMaintenanceTable();
    if (table) {
      const inserted = await this.insertRow(table, order);
      return mapMaintenanceRow(inserted);
    }

    return this.addMemory(memory.maintenance, 'maintenance', order);
  }

  async listMaintenanceOrders(filters: MaintenanceFilters = {}): Promise<MaintenanceOrder[]> {
    const table = await this.resolveMaintenanceTable();
    let orders: MaintenanceOrder[] = [];
    if (table) {
      const rows = await this.selectRows(table, ' order by created_at desc');
      orders = rows.map(mapMaintenanceRow);
    } else {
      orders = clone(memory.maintenance);
    }

    return orders.filter((order) => {
      if (filters.status && order.status !== filters.status) return false;
      if (filters.priority && order.priority !== filters.priority) return false;
      if (filters.room_id !== undefined && Number(filters.room_id) !== order.room_id) return false;
      if (filters.date) {
        const created = new Date(order.created_at);
        const target = dateOnly(filters.date);
        if (!target || Number.isNaN(created.getTime()) || created.toISOString().slice(0, 10) !== target.toISOString().slice(0, 10)) {
          return false;
        }
      }
      return true;
    });
  }

  async getMaintenanceOrderById(id: number | string): Promise<MaintenanceOrder | null> {
    const orderId = Number(id);
    const table = await this.resolveMaintenanceTable();
    if (table) {
      const row = await this.selectOne(table, ' where id = $1', [orderId]);
      return row ? mapMaintenanceRow(row) : null;
    }

    return clone(memory.maintenance.find((order) => order.id === orderId) || null);
  }

  async updateMaintenanceOrder(id: number | string, updates: Partial<MaintenanceOrder>): Promise<MaintenanceOrder> {
    const orderId = Number(id);
    const table = await this.resolveMaintenanceTable();
    if (table) {
      const result = await this.updateRow(table, 'id', orderId, updates);
      return mapMaintenanceRow(result);
    }

    const updated = this.updateMemory(memory.maintenance, orderId, updates as any);
    if (!updated) {
      throw new Error('Ordem de manutenção não encontrada');
    }
    return updated;
  }

  async assignMaintenanceOrder(id: number | string, userId: number | string): Promise<MaintenanceOrder> {
    return this.updateMaintenanceOrder(id, {
      assigned_to: Number(userId),
      status: 'assigned',
      updated_at: nowIso(),
    } as Partial<MaintenanceOrder>);
  }

  async completeMaintenanceOrder(id: number | string, resolution: string, cost?: number): Promise<MaintenanceOrder> {
    const existing = await this.getMaintenanceOrderById(id);
    if (!existing) {
      throw new Error('Ordem de manutenção não encontrada');
    }

    await this.updateRoomStatus(existing.room_id, 'dirty', resolution);
    return this.updateMaintenanceOrder(id, {
      status: 'completed',
      resolution,
      actual_cost: cost,
      completed_at: nowIso(),
      updated_at: nowIso(),
    } as Partial<MaintenanceOrder>);
  }

  async getMaintenanceStats(): Promise<{ open: number; inProgress: number; completed: number; totalCostMonth: number }> {
    const orders = await this.listMaintenanceOrders();
    return {
      open: orders.filter((order) => order.status === 'open').length,
      inProgress: orders.filter((order) => order.status === 'in_progress').length,
      completed: orders.filter((order) => order.status === 'completed').length,
      totalCostMonth: orders
        .filter((order) => order.status === 'completed')
        .reduce((sum, order) => sum + (order.actual_cost || 0), 0),
    };
  }

  async createChecklist(data: Partial<ChecklistTemplate> & { name: string; task_type: string; items: ChecklistItem[] }): Promise<ChecklistTemplate> {
    const checklist: Omit<ChecklistTemplate, 'id'> = {
      name: data.name,
      task_type: data.task_type,
      room_type: data.room_type,
      items: clone(data.items || []),
      is_default: data.is_default ?? false,
      property_id: data.property_id,
    };

    const table = await this.resolveChecklistTable();
    if (table) {
      const inserted = await this.insertRow(table, {
        ...checklist,
        items: JSON.stringify(checklist.items),
      });
      return mapChecklistRow(inserted);
    }

    return this.addMemory(memory.checklists, 'checklist', checklist);
  }

  async listChecklists(filters: ChecklistFilters = {}): Promise<ChecklistTemplate[]> {
    const table = await this.resolveChecklistTable();
    let checklists: ChecklistTemplate[] = [];
    if (table) {
      const rows = await this.selectRows(table, ' order by id asc');
      checklists = rows.map(mapChecklistRow);
    } else {
      checklists = clone(memory.checklists);
    }

    return checklists.filter((checklist) => {
      if (filters.task_type && checklist.task_type !== filters.task_type) return false;
      if (filters.room_type && checklist.room_type !== filters.room_type) return false;
      if (filters.property_id !== undefined && Number(filters.property_id) !== checklist.property_id) return false;
      return true;
    });
  }

  async getChecklistById(id: number | string): Promise<ChecklistTemplate | null> {
    const checklistId = Number(id);
    const table = await this.resolveChecklistTable();
    if (table) {
      const row = await this.selectOne(table, ' where id = $1', [checklistId]);
      return row ? mapChecklistRow(row) : null;
    }

    return clone(memory.checklists.find((checklist) => checklist.id === checklistId) || null);
  }

  async updateChecklist(id: number | string, updates: Partial<ChecklistTemplate>): Promise<ChecklistTemplate> {
    const checklistId = Number(id);
    const table = await this.resolveChecklistTable();
    if (table) {
      const result = await this.updateRow(table, 'id', checklistId, {
        ...updates,
        items: updates.items ? JSON.stringify(updates.items) : updates.items,
      });
      return mapChecklistRow(result);
    }

    const updated = this.updateMemory(memory.checklists, checklistId, updates as any);
    if (!updated) {
      throw new Error('Checklist não encontrada');
    }
    return updated;
  }

  async deleteChecklist(id: number | string): Promise<void> {
    const checklistId = Number(id);
    const table = await this.resolveChecklistTable();
    if (table) {
      await this.query(`delete from ${quoteIdent(table)} where id = $1`, [checklistId]);
      return;
    }

    this.removeMemory(memory.checklists, checklistId);
  }

  async getChecklistForTaskType(taskType: string, roomType?: string | null): Promise<ChecklistTemplate | null> {
    const checklists = await this.listChecklists();
    const exactMatch = checklists.find((checklist) => checklist.task_type === taskType && checklist.room_type === roomType);
    if (exactMatch) return exactMatch;

    const roomAgnostic = checklists.find((checklist) => checklist.task_type === taskType && !checklist.room_type);
    if (roomAgnostic) return roomAgnostic;

    return checklists.find((checklist) => checklist.task_type === taskType) || null;
  }

  async seedDefaultChecklists(): Promise<void> {
    const existing = await this.listChecklists();
    const defaults = this.getDefaultChecklists();
    const existingKeys = new Set(existing.map((checklist) => `${checklist.task_type}:${checklist.room_type || ''}`));

    for (const checklist of defaults) {
      const key = `${checklist.task_type}:${checklist.room_type || ''}`;
      if (!existingKeys.has(key)) {
        await this.createChecklist(checklist as any);
      }
    }
  }

  private getDefaultChecklists(): Array<Omit<ChecklistTemplate, 'id'>> {
    return [
      {
        name: 'Checkout Clean',
        task_type: 'checkout_clean',
        items: createChecklistItems([
          { text: 'Limpar vaso sanitário', category: 'banheiro', is_required: true },
          { text: 'Limpar pia do banheiro', category: 'banheiro', is_required: true },
          { text: 'Limpar box e chuveiro', category: 'banheiro', is_required: true },
          { text: 'Limpar espelho', category: 'banheiro', is_required: true },
          { text: 'Trocar toalhas', category: 'banheiro', is_required: true },
          { text: 'Trocar roupa de cama', category: 'quarto', is_required: true },
          { text: 'Aspirar o quarto', category: 'quarto', is_required: true },
          { text: 'Limpar superfícies', category: 'quarto', is_required: true },
          { text: 'Limpar cozinha', category: 'cozinha', is_required: true },
          { text: 'Verificar estoque do frigobar', category: 'cozinha', is_required: true },
          { text: 'Repor amenities', category: 'geral', is_required: true },
          { text: 'Verificar danos', category: 'geral', is_required: true },
          { text: 'Esvaziar lixeiras', category: 'geral', is_required: true },
          { text: 'Checar iluminação', category: 'geral', is_required: false },
          { text: 'Ajustar cortinas', category: 'geral', is_required: false },
        ]),
        is_default: true,
      },
      {
        name: 'Stayover Clean',
        task_type: 'stayover_clean',
        items: createChecklistItems([
          { text: 'Arrumar cama', category: 'quarto', is_required: true },
          { text: 'Trocar toalhas usadas', category: 'banheiro', is_required: true },
          { text: 'Limpar banheiro', category: 'banheiro', is_required: true },
          { text: 'Esvaziar lixeiras', category: 'geral', is_required: true },
          { text: 'Reabastecer amenities', category: 'geral', is_required: true },
          { text: 'Aspirar o quarto', category: 'quarto', is_required: true },
          { text: 'Organizar itens pessoais', category: 'geral', is_required: false },
          { text: 'Checar frigobar', category: 'cozinha', is_required: false },
        ]),
        is_default: true,
      },
      {
        name: 'Deep Clean',
        task_type: 'deep_clean',
        items: createChecklistItems([
          { text: 'Limpar vaso sanitário', category: 'banheiro', is_required: true },
          { text: 'Limpar pia do banheiro', category: 'banheiro', is_required: true },
          { text: 'Limpar box e chuveiro', category: 'banheiro', is_required: true },
          { text: 'Limpar espelho', category: 'banheiro', is_required: true },
          { text: 'Trocar toalhas', category: 'banheiro', is_required: true },
          { text: 'Trocar roupa de cama', category: 'quarto', is_required: true },
          { text: 'Aspirar o quarto', category: 'quarto', is_required: true },
          { text: 'Limpar superfícies', category: 'quarto', is_required: true },
          { text: 'Limpar cozinha', category: 'cozinha', is_required: true },
          { text: 'Verificar estoque do frigobar', category: 'cozinha', is_required: true },
          { text: 'Repor amenities', category: 'geral', is_required: true },
          { text: 'Verificar danos', category: 'geral', is_required: true },
          { text: 'Esvaziar lixeiras', category: 'geral', is_required: true },
          { text: 'Lavar cortinas', category: 'quarto', is_required: true },
          { text: 'Limpar ar-condicionado', category: 'quarto', is_required: true },
          { text: 'Desinfetar colchão', category: 'quarto', is_required: true },
          { text: 'Limpar atrás dos móveis', category: 'quarto', is_required: true },
          { text: 'Polir metais', category: 'geral', is_required: true },
          { text: 'Limpar janelas', category: 'geral', is_required: true },
          { text: 'Verificar encanamentos', category: 'banheiro', is_required: true },
          { text: 'Checar tomadas', category: 'geral', is_required: false },
          { text: 'Inspecionar portas', category: 'geral', is_required: false },
          { text: 'Revisar iluminação', category: 'geral', is_required: false },
          { text: 'Checar odores', category: 'geral', is_required: false },
          { text: 'Finalizar inspeção geral', category: 'geral', is_required: true },
        ]),
        is_default: true,
      },
      {
        name: 'Turndown',
        task_type: 'turndown',
        items: createChecklistItems([
          { text: 'Abrir cama', category: 'quarto', is_required: true },
          { text: 'Colocar chocolate ou água', category: 'amenities', is_required: true },
          { text: 'Fechar cortinas', category: 'quarto', is_required: true },
          { text: 'Ajustar iluminação', category: 'geral', is_required: true },
          { text: 'Reabastecer toalhas', category: 'banheiro', is_required: true },
          { text: 'Esvaziar lixeiras', category: 'geral', is_required: true },
        ]),
        is_default: true,
      },
    ];
  }
}

export const housekeepingRepository = new HousekeepingRepository();

module.exports = { HousekeepingRepository, housekeepingRepository };
