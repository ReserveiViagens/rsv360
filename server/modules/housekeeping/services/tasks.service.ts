import { housekeepingRepository } from '../db/housekeeping.repository';
import { roomStatusService } from './room-status.service';
import type { HousekeepingTask, ChecklistItem } from '../db/schema';

export class TasksService {
  constructor(private repository = housekeepingRepository) {}

  async createTask(data: Partial<HousekeepingTask> & { room_id: number; task_type: HousekeepingTask['task_type'] }) {
    return this.repository.createTask(data);
  }

  async listTasks(filters?: Record<string, any>) {
    return this.repository.listTasks(filters);
  }

  async getTaskById(id: number | string) {
    return this.repository.getTaskById(id);
  }

  async updateTask(id: number | string, updates: Partial<HousekeepingTask>) {
    return this.repository.updateTask(id, updates);
  }

  async assignTask(taskId: number | string, userId: number | string) {
    return this.repository.assignTask(taskId, userId);
  }

  async startTask(taskId: number | string) {
    const current = await this.repository.getTaskById(taskId);
    if (!current) throw new Error('Tarefa não encontrada');
    if (!['pending', 'assigned'].includes(current.status)) {
      throw new Error('Tarefa não pode ser iniciada');
    }

    const started = await this.repository.startTask(taskId);
    if (current.room_id) {
      await roomStatusService.updateStatus(current.room_id, 'cleaning', 'Tarefa iniciada');
    }
    return started;
  }

  async completeTask(taskId: number | string, checklistResults?: ChecklistItem[], notes?: string) {
    const current = await this.repository.getTaskById(taskId);
    if (!current) throw new Error('Tarefa não encontrada');
    if (current.status !== 'in_progress') {
      throw new Error('Tarefa não está em andamento');
    }
    return this.repository.completeTask(taskId, checklistResults, notes);
  }

  async inspectTask(taskId: number | string, rating: number, inspectorId: number | string, notes?: string) {
    const current = await this.repository.getTaskById(taskId);
    if (!current) throw new Error('Tarefa não encontrada');
    if (current.status !== 'completed') {
      throw new Error('Tarefa não pode ser inspecionada');
    }
    const minRating = Number(process.env.HK_MIN_INSPECTION_RATING || 4);
    if (current.room_id) {
      if (rating >= minRating) {
        await roomStatusService.updateStatus(current.room_id, 'clean', notes);
      } else {
        await this.repository.updateRoomStatus(current.room_id, 'dirty', notes);
      }
    }
    return this.repository.inspectTask(taskId, rating, inspectorId, notes);
  }

  async getTasksByAssignee(userId: number | string) {
    return this.repository.getTasksByAssignee(userId);
  }

  async getTaskStats(dateRange?: { from?: string; to?: string }) {
    return this.repository.getTaskStats(dateRange);
  }

  async getWorkload() {
    const tasks = await this.repository.listTasks();
    const grouped = tasks.reduce<Record<string, { assignee: number | null; count: number; inProgress: number; pending: number; completed: number }>>((acc, task) => {
      const key = String(task.assigned_to || 'unassigned');
      if (!acc[key]) {
        acc[key] = {
          assignee: task.assigned_to ?? null,
          count: 0,
          inProgress: 0,
          pending: 0,
          completed: 0,
        };
      }

      acc[key].count += 1;
      if (task.status === 'in_progress') acc[key].inProgress += 1;
      if (task.status === 'pending' || task.status === 'assigned') acc[key].pending += 1;
      if (task.status === 'completed' || task.status === 'inspected') acc[key].completed += 1;
      return acc;
    }, {});

    return Object.values(grouped);
  }

  async getTodayTasks() {
    const today = new Date().toISOString().slice(0, 10);
    return this.repository.listTasks({ date: today });
  }
}

export const tasksService = new TasksService();

module.exports = { TasksService, tasksService };
