import { housekeepingRepository } from '../db/housekeeping.repository';
import { tasksService } from './tasks.service';

export class SchedulerService {
  constructor(private repository = housekeepingRepository) {}

  async runDailySchedule() {
    const bookingsTable = await this.repository.resolveBookingsTable();
    if (!bookingsTable) {
      return {
        tasksCreated: 0,
        checkoutCleans: 0,
        stayoverCleans: 0,
        mode: 'manual',
      };
    }

    return {
      tasksCreated: 0,
      checkoutCleans: 0,
      stayoverCleans: 0,
      mode: 'auto-disabled',
    };
  }

  async autoAssign(tasks: Array<{ id: number }>, staffIds: Array<number | string>) {
    if (!staffIds.length) return [];

    const assignments = [];
    for (let index = 0; index < tasks.length; index += 1) {
      const task = tasks[index];
      const staffId = Number(staffIds[index % staffIds.length]);
      if (task?.id) {
        await tasksService.assignTask(task.id, staffId);
      }
      assignments.push({ taskId: task.id, staffId });
    }
    return assignments;
  }

  async getScheduleSummary(date: string) {
    const tasks = await this.repository.listTasks({ date });
    const byType = tasks.reduce<Record<string, number>>((acc, task) => {
      acc[task.task_type] = (acc[task.task_type] || 0) + 1;
      return acc;
    }, {});

    const byAssignee = tasks.reduce<Record<string, number>>((acc, task) => {
      const key = String(task.assigned_to || 'unassigned');
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return {
      totalTasks: tasks.length,
      byType,
      byAssignee,
    };
  }
}

export const schedulerService = new SchedulerService();

module.exports = { SchedulerService, schedulerService };

