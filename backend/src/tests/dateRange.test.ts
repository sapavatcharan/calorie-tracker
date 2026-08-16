import { describe, expect, it } from 'vitest';
import { parseRangeEnd, parseRangeStart, rangeEndDate, rangeStartDate } from '../core/dateRange';

describe('date-only range parsing', () => {
  it('treats YYYY-MM-DD start as UTC midnight and end as end of that UTC day', () => {
    expect(parseRangeStart('2026-08-16')?.toISOString()).toBe('2026-08-16T00:00:00.000Z');
    expect(parseRangeEnd('2026-08-16')?.toISOString()).toBe('2026-08-16T23:59:59.999Z');
  });

  it('leaves full ISO timestamps unchanged', () => {
    expect(parseRangeEnd('2026-08-16T12:00:00.000Z')?.toISOString()).toBe('2026-08-16T12:00:00.000Z');
  });

  it('zod query helpers expand date-only endDate', () => {
    expect(rangeStartDate.parse('2026-08-16')?.toISOString()).toBe('2026-08-16T00:00:00.000Z');
    expect(rangeEndDate.parse('2026-08-16')?.toISOString()).toBe('2026-08-16T23:59:59.999Z');
    expect(rangeEndDate.parse(undefined)).toBeUndefined();
  });
});
