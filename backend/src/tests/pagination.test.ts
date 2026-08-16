import { describe, expect, it } from 'vitest';
import { buildMeta, paginated, paginationQuery } from '../core/pagination';

describe('pagination helper', () => {
  it('builds a complete meta envelope', () => {
    expect(buildMeta(42, 2, 10)).toEqual({
      page: 2,
      limit: 10,
      total: 42,
      totalPages: 5,
      hasNext: true,
      hasPrev: true,
    });
  });

  it('returns the standard list envelope', () => {
    const result = paginated([{ id: 1 }], 1, 1, 10);
    expect(result).toEqual({
      data: [{ id: 1 }],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    });
  });

  it('rejects page < 1 and caps limit at 100', () => {
    expect(paginationQuery.safeParse({ page: 0 }).success).toBe(false);
    expect(paginationQuery.parse({ limit: '100' }).limit).toBe(100);
    expect(paginationQuery.safeParse({ limit: 101 }).success).toBe(false);
  });
});
