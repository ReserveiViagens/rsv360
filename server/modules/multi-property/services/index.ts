import { propertyRepository } from '../db/property.repository';
import { PropertyService } from './property.service';
import { TenantService } from './tenant.service';

export const propertyService = new PropertyService(propertyRepository);
export const tenantService = new TenantService(propertyRepository);

export * from './property.service';
export * from './tenant.service';
