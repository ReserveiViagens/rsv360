import { portalRepository } from '../db/portal.repository';

const allowedTypes = new Set([
  'towels',
  'cleaning',
  'maintenance',
  'late_checkout',
  'room_service',
  'transport',
  'amenities',
  'other',
]);

export class RequestsService {
  constructor(private repository = portalRepository) {}

  async submitRequest(bookingId: string, data: Record<string, any>) {
    if (!allowedTypes.has(data.type)) {
      throw new Error('Tipo de solicitação inválido');
    }

    return this.repository.insertRequest({
      booking_id: bookingId,
      type: data.type,
      description: data.description || null,
      priority: data.priority || 'medium',
      status: 'pending',
      staff_notes: null,
      assigned_to: null,
      completed_at: null,
      created_at: new Date(),
      updated_at: new Date(),
    });
  }

  async listRequests(bookingId: string) {
    return this.repository.listRequests(bookingId);
  }

  async listAllRequests() {
    return this.repository.listRequests();
  }

  async updateRequestStatus(requestId: string, data: Record<string, any>) {
    return this.repository.updateRequest(requestId, {
      status: data.status,
      staff_notes: data.staff_notes || null,
      assigned_to: data.assigned_to || null,
      completed_at: data.status === 'completed' ? new Date() : null,
      updated_at: new Date(),
    });
  }

  async cancelRequest(requestId: string, bookingId: string) {
    const request = await this.repository.getRequestById(requestId);
    if (!request) {
      throw new Error('Solicitação não encontrada');
    }

    if (String(request.booking_id) !== String(bookingId)) {
      throw new Error('Solicitação não pertence a esta reserva');
    }

    return this.repository.updateRequest(requestId, {
      status: 'cancelled',
      updated_at: new Date(),
    });
  }
}

export const requestsService = new RequestsService();

module.exports = { RequestsService, requestsService };

