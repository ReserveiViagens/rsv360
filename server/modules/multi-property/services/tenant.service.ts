import { PropertyRepository } from '../db/property.repository';

export class TenantService {
  constructor(private repo: PropertyRepository) {}

  async resolvePropertyId(userId?: number, requestedPropertyId?: number) {
    if (requestedPropertyId) {
      if (userId) {
        const access = await this.repo.validateUserAccess(requestedPropertyId, userId);
        if (!access) {
          return 1;
        }
      }
      return requestedPropertyId;
    }

    if (userId) {
      return this.repo.getDefaultPropertyForUser(userId);
    }

    return 1;
  }
}
