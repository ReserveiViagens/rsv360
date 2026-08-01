import {
  HkTaskCreateSchema,
  HkTaskUpdateSchema,
  parsePositiveIntId,
} from '../../../../server/modules/housekeeping/schemas/housekeeping-write.schema';
import {
  CampaignCreateSchema,
  GuestProfileCreateSchema,
  GuestProfileUpdateSchema,
  SegmentPreviewBodySchema,
  parsePositiveIntId as parseCrmId,
} from '../../../../server/modules/crm/schemas/crm-write.schema';

describe('PR-07c1 Zod.strict + anti mass-assignment (housekeeping + CRM)', () => {
  it('rejects extra isAdmin on housekeeping task create (.strict)', () => {
    const parsed = HkTaskCreateSchema.safeParse({
      room_id: 1,
      task_type: 'checkout_clean',
      isAdmin: true,
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects nested operator-shaped field with wrong type on HK update', () => {
    const parsed = HkTaskUpdateSchema.safeParse({ notes: { $ne: null } });
    expect(parsed.success).toBe(false);
  });

  it('rejects invalid housekeeping id param (I2)', () => {
    expect(() => parsePositiveIntId('abc')).toThrow();
    expect(() => parsePositiveIntId('12.5')).toThrow();
    expect(() => parsePositiveIntId('-1')).toThrow();
  });

  it('accepts positive int housekeeping id', () => {
    expect(parsePositiveIntId('42')).toBe(42);
  });

  it('rejects extra isAdmin on CRM guest create (.strict)', () => {
    const parsed = GuestProfileCreateSchema.safeParse({
      first_name: 'Ana',
      last_name: 'Silva',
      isAdmin: true,
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects operator-shaped email on guest update', () => {
    const parsed = GuestProfileUpdateSchema.safeParse({ email: { $ne: null } });
    expect(parsed.success).toBe(false);
  });

  it('rejects extras on campaign create', () => {
    const parsed = CampaignCreateSchema.safeParse({
      name: 'Promo',
      role: 'admin',
      password: 'x',
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects privileged keys on segment preview body', () => {
    const parsed = SegmentPreviewBodySchema.safeParse({ isAdmin: true, lifecycle_stage: 'loyal' });
    expect(parsed.success).toBe(false);
  });

  it('rejects invalid CRM id param (I2)', () => {
    expect(() => parseCrmId('not-a-number')).toThrow();
    expect(parseCrmId('7')).toBe(7);
  });
});
