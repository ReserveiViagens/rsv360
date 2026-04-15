import { crmRepository } from '../db/crm.repository';

export class GuestProfileService {
  async create(data: any) { return crmRepository.createProfile(data); }
  async get(id: number) { return crmRepository.getProfile(id); }
  async update(id: number, data: any) { return crmRepository.updateProfile(id, data); }
  async delete(id: number) { return crmRepository.deleteProfile(id); }
  async list(filters: any, page?: number, limit?: number) { return crmRepository.listProfiles(filters, page, limit); }
  async search(query: string, limit = 20) { return crmRepository.searchProfiles(query, limit); }
  async mergeProfiles(keepId: number, mergeId: number) { return crmRepository.mergeProfiles(keepId, mergeId); }
  async getTimeline(guestId: number) { return crmRepository.getGuestTimeline(guestId); }
  async updateLifecycle(guestId: number) { return crmRepository.updateLifecycleStage(guestId); }
  async refreshAllLifecycles() {
    const profiles = await crmRepository.listProfiles({}, 1, 9999);
    let updated = 0;
    for (const profile of profiles.data) {
      const before = profile.lifecycle_stage;
      const after = await crmRepository.updateLifecycleStage(profile.id);
      if (before !== after) updated += 1;
    }
    return { total: profiles.total, updated };
  }
}

export const guestProfileService = new GuestProfileService();
