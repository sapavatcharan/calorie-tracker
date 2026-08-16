import { z } from 'zod';

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

export function parseRangeStart(value: unknown): Date | undefined {
  if (value == null || value === '') return undefined;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? undefined : value;
  const s = String(value);
  if (DATE_ONLY.test(s)) return new Date(`${s}T00:00:00.000Z`);
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export function parseRangeEnd(value: unknown): Date | undefined {
  if (value == null || value === '') return undefined;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? undefined : value;
  const s = String(value);
  if (DATE_ONLY.test(s)) return new Date(`${s}T23:59:59.999Z`);
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function preprocessRange(end: boolean) {
  return (value: unknown) => {
    if (value === undefined || value === null || value === '') return undefined;
    if (typeof value === 'string' && DATE_ONLY.test(value)) {
      return end ? new Date(`${value}T23:59:59.999Z`) : new Date(`${value}T00:00:00.000Z`);
    }
    if (value instanceof Date) return Number.isNaN(value.getTime()) ? value : value;
    const d = new Date(String(value));
    return d;
  };
}

export const rangeStartDate = z.preprocess(preprocessRange(false), z.date().optional());
export const rangeEndDate = z.preprocess(preprocessRange(true), z.date().optional());
