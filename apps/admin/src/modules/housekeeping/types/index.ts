export type RoomStatus = 'clean' | 'dirty' | 'cleaning' | 'maintenance';

export interface RoomItem {
  id: number;
  number: string;
  floor?: string;
  status: RoomStatus;
  type?: string;
  guest_name?: string;
}

export interface TaskItem {
  id: number;
  title: string;
  status: 'pending' | 'in_progress' | 'completed' | 'inspected';
  assignee_name?: string;
  room_id?: number;
  priority?: 'low' | 'medium' | 'high';
  checklist?: Array<{ label: string; done: boolean }>;
  created_at?: string;
}

export interface MaintenanceItem {
  id: number;
  title: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority?: 'low' | 'medium' | 'high';
  room_id?: number;
  created_at?: string;
}

export interface ChecklistTemplate {
  id: number;
  name: string;
  items: string[];
}

export interface HousekeepingStats {
  totalRooms: number;
  dirtyRooms: number;
  cleaningRooms: number;
  tasksToday: number;
  maintenanceOpen: number;
}
