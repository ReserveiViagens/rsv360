import { housekeepingRepository } from '../db/housekeeping.repository';
import type { ChecklistTemplate, ChecklistItem } from '../db/schema';

export class ChecklistsService {
  constructor(private repository = housekeepingRepository) {}

  async createChecklist(data: Partial<ChecklistTemplate> & { name: string; task_type: string; items: ChecklistItem[] }) {
    return this.repository.createChecklist(data as any);
  }

  async listChecklists(filters?: Record<string, any>) {
    return this.repository.listChecklists(filters);
  }

  async getChecklistById(id: number | string) {
    return this.repository.getChecklistById(id);
  }

  async updateChecklist(id: number | string, updates: Partial<ChecklistTemplate>) {
    return this.repository.updateChecklist(id, updates);
  }

  async deleteChecklist(id: number | string) {
    return this.repository.deleteChecklist(id);
  }

  async getChecklistForTaskType(taskType: string, roomType?: string | null) {
    return this.repository.getChecklistForTaskType(taskType, roomType);
  }

  async seedDefaults() {
    await this.repository.seedDefaultChecklists();
    return this.listChecklists();
  }
}

export const checklistsService = new ChecklistsService();

module.exports = { ChecklistsService, checklistsService };

