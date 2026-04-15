import { housekeepingRepository } from '../db/housekeeping.repository';
import { roomStatusService } from './room-status.service';
import type { MaintenanceOrder } from '../db/schema';

export class MaintenanceService {
  constructor(private repository = housekeepingRepository) {}

  async createOrder(data: Partial<MaintenanceOrder> & { room_id: number; title: string; description: string }) {
    return this.repository.createMaintenanceOrder(data);
  }

  async listMaintenanceOrders(filters?: Record<string, any>) {
    return this.repository.listMaintenanceOrders(filters);
  }

  async getMaintenanceOrderById(id: number | string) {
    return this.repository.getMaintenanceOrderById(id);
  }

  async updateMaintenanceOrder(id: number | string, updates: Partial<MaintenanceOrder>) {
    return this.repository.updateMaintenanceOrder(id, updates);
  }

  async assignOrder(orderId: number | string, userId: number | string) {
    return this.repository.assignMaintenanceOrder(orderId, userId);
  }

  async startOrder(orderId: number | string) {
    return this.repository.updateMaintenanceOrder(orderId, {
      status: 'in_progress',
      started_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as Partial<MaintenanceOrder>);
  }

  async markWaitingParts(orderId: number | string, partsList: string[]) {
    return this.repository.updateMaintenanceOrder(orderId, {
      status: 'waiting_parts',
      notes: partsList.join(', ') as any,
      updated_at: new Date().toISOString(),
    } as Partial<MaintenanceOrder>);
  }

  async completeOrder(orderId: number | string, resolution: string, actualCost?: number) {
    const order = await this.repository.getMaintenanceOrderById(orderId);
    if (!order) {
      throw new Error('Ordem de manutenção não encontrada');
    }

    await roomStatusService.updateStatus(order.room_id, 'dirty', resolution);
    return this.repository.completeMaintenanceOrder(orderId, resolution, actualCost);
  }

  async cancelOrder(orderId: number | string, reason: string) {
    return this.repository.updateMaintenanceOrder(orderId, {
      status: 'cancelled',
      resolution: reason,
      updated_at: new Date().toISOString(),
    } as Partial<MaintenanceOrder>);
  }

  async getStats() {
    return this.repository.getMaintenanceStats();
  }
}

export const maintenanceService = new MaintenanceService();

module.exports = { MaintenanceService, maintenanceService };
