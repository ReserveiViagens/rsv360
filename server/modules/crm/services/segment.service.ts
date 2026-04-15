import { crmRepository } from '../db/crm.repository';

export class SegmentService {
  async create(userId: number, data: any) {
    const segment = await crmRepository.createSegment({ user_id: userId, ...data });
    const count = await crmRepository.calculateSegmentCount(typeof data.filter_criteria === 'string' ? JSON.parse(data.filter_criteria) : data.filter_criteria);
    return crmRepository.updateSegment(segment.id, { guest_count: count, last_calculated_at: new Date().toISOString() });
  }
  async get(id: number) { return crmRepository.getSegment(id); }
  async update(id: number, data: any) { return crmRepository.updateSegment(id, data); }
  async delete(id: number) { return crmRepository.deleteSegment(id); }
  async list(userId: number) { return crmRepository.listSegments(userId); }

  async preview(filter: any) {
    const count = await crmRepository.calculateSegmentCount(filter);
    const sample = await crmRepository.getProfilesBySegment(filter);
    return { count, sample: sample.data.slice(0, 5) };
  }

  async refreshDynamicSegments() {
    const segments = await crmRepository.listSegments(0);
    let refreshed = 0;
    for (const seg of segments) {
      if (!seg.is_dynamic) continue;
      const filter = typeof seg.filter_criteria === 'string' ? JSON.parse(seg.filter_criteria) : seg.filter_criteria;
      const count = await crmRepository.calculateSegmentCount(filter);
      await crmRepository.updateSegment(seg.id, { guest_count: count, last_calculated_at: new Date().toISOString() });
      refreshed += 1;
    }
    return { refreshed };
  }
}

export const segmentService = new SegmentService();
