const mockExecute = jest.fn();

jest.mock('../../../../server/lib/db', () => ({
  db: {
    execute: (...args: unknown[]) => mockExecute(...args),
  },
}));

jest.mock('drizzle-orm', () => ({
  sql: Object.assign(
    (strings: TemplateStringsArray, ...values: unknown[]) => ({ strings, values }),
    { raw: (x: string) => x },
  ),
}));

import { cmsService } from '../../../../server/modules/cms/service';

describe('cmsService.remove', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('soft delete marca inactive', async () => {
    mockExecute
      .mockResolvedValueOnce({
        rows: [
          {
            id: 13,
            page_type: 'hotels',
            content_id: 'atrium-thermas',
            title: 'Atrium',
            description: null,
            images: '[]',
            metadata: '{}',
            seo_data: '{}',
            status: 'active',
            order_index: 10,
            video_url: null,
            amenidades: '[]',
            created_at: null,
            updated_at: null,
            created_by: null,
            updated_by: null,
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            id: 13,
            page_type: 'hotels',
            content_id: 'atrium-thermas',
            title: 'Atrium',
            description: null,
            images: '[]',
            metadata: '{}',
            seo_data: '{}',
            status: 'inactive',
            order_index: 10,
            video_url: null,
            amenidades: '[]',
            created_at: null,
            updated_at: null,
            created_by: null,
            updated_by: 1,
          },
        ],
      });

    const result = await cmsService.remove(13, { userId: 1 });
    expect(result.deleted).toBe(true);
    if (result.deleted) {
      expect(result.mode).toBe('soft');
      expect(result.row.status).toBe('inactive');
    }
  });

  it('hard delete bloqueia Etapa A', async () => {
    mockExecute.mockResolvedValueOnce({
      rows: [
        {
          id: 13,
          page_type: 'hotels',
          content_id: 'atrium-thermas',
          title: 'Atrium',
          description: null,
          images: '[]',
          metadata: '{}',
          seo_data: '{}',
          status: 'active',
          order_index: 10,
          video_url: null,
          amenidades: '[]',
          created_at: null,
          updated_at: null,
          created_by: null,
          updated_by: null,
        },
      ],
    });

    const result = await cmsService.remove(13, { hard: true });
    expect(result).toEqual(
      expect.objectContaining({ deleted: false, reason: 'etapa_a_protected' }),
    );
    expect(mockExecute).toHaveBeenCalledTimes(1);
  });
});
