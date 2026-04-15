export interface Room {
  id: number;
  name: string;
  floor?: number;
  room_type?: string;
  status: 'clean' | 'dirty' | 'cleaning' | 'inspected' | 'maintenance' | 'out_of_order';
  current_guest?: string;
  notes?: string;
  last_cleaned_at?: string;
  last_inspected_at?: string;
  property_id?: number;
}

export interface ChecklistItem {
  id: string;
  text: string;
  category: string;
  is_required: boolean;
  completed?: boolean;
  completed_at?: string;
}

export interface HousekeepingTask {
  id: number;
  room_id: number;
  room_name?: string;
  task_type: 'checkout_clean' | 'stayover_clean' | 'deep_clean' | 'turndown' | 'inspection';
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'inspected' | 'rejected';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  assigned_to?: number;
  assigned_to_name?: string;
  checklist_id?: number;
  checklist_items?: ChecklistItem[];
  started_at?: string;
  completed_at?: string;
  inspected_at?: string;
  inspected_by?: number;
  inspection_rating?: number;
  estimated_minutes?: number;
  actual_minutes?: number;
  notes?: string;
  property_id?: number;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceOrder {
  id: number;
  room_id: number;
  room_name?: string;
  category: 'plumbing' | 'electrical' | 'hvac' | 'furniture' | 'appliance' | 'structural' | 'other';
  priority: 'low' | 'normal' | 'high' | 'critical';
  status: 'open' | 'assigned' | 'in_progress' | 'waiting_parts' | 'completed' | 'cancelled';
  title: string;
  description: string;
  reported_by?: number;
  assigned_to?: number;
  resolution?: string;
  estimated_cost?: number;
  actual_cost?: number;
  started_at?: string;
  completed_at?: string;
  property_id?: number;
  created_at: string;
  updated_at: string;
}

export interface ChecklistTemplate {
  id: number;
  name: string;
  task_type: string;
  room_type?: string;
  items: ChecklistItem[];
  is_default?: boolean;
  property_id?: number;
}

