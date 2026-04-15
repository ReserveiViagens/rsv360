import { housekeepingRepository } from '../db/housekeeping.repository';
import type { Room } from '../db/schema';

const validTransitions: Record<Room['status'], Room['status'][]> = {
  clean: ['dirty', 'maintenance', 'out_of_order'],
  dirty: ['cleaning', 'maintenance', 'out_of_order'],
  cleaning: ['clean', 'inspected'],
  inspected: ['clean', 'dirty'],
  maintenance: ['clean', 'dirty', 'out_of_order'],
  out_of_order: ['maintenance', 'dirty'],
};

export class RoomStatusService {
  constructor(private repository = housekeepingRepository) {}

  async listRooms(filters?: Record<string, any>) {
    return this.repository.listRooms(filters);
  }

  async getRoomById(roomId: number | string) {
    return this.repository.getRoomById(roomId);
  }

  async updateStatus(roomId: number | string, status: Room['status'], notes?: string) {
    const current = await this.repository.getRoomById(roomId);
    if (current) {
      const allowed = validTransitions[current.status] || [];
      if (!allowed.includes(status) && current.status !== status) {
        throw new Error(`Transição inválida: ${current.status} → ${status}`);
      }
    }
    return this.repository.updateRoomStatus(roomId, status, notes);
  }

  async bulkUpdate(roomIds: Array<number | string>, status: Room['status']) {
    let updated = 0;
    for (const roomId of roomIds) {
      await this.updateStatus(roomId, status);
      updated += 1;
    }
    return updated;
  }

  async getFloorMap() {
    return this.repository.getRoomsByFloor();
  }

  async getDashboard() {
    return this.repository.getDashboardStats();
  }

  async autoMarkDirtyAfterCheckout(bookingId: string | number) {
    const roomId = await this.repository.findRoomIdByBookingId(bookingId);
    if (!roomId) {
      console.log('[HOUSEKEEPING] Booking sem room vinculado, fallback manual', bookingId);
      return { success: false, reason: 'room_not_found' };
    }

    await this.repository.markDirtyAfterCheckout(roomId);
    console.log('[HOUSEKEEPING] Room marcado como dirty após checkout', { bookingId, roomId });
    return { success: true, roomId };
  }
}

export const roomStatusService = new RoomStatusService();

module.exports = { RoomStatusService, roomStatusService };
