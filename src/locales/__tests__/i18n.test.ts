import { describe, it, expect } from 'vitest';
import en from '../en.json';
import fr from '../fr.json';

function getKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  const keys: string[] = [];
  for (const key of Object.keys(obj)) {
    const full = prefix ? `${prefix}.${key}` : key;
    const val = obj[key];
    if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      keys.push(...getKeys(val as Record<string, unknown>, full));
    } else {
      keys.push(full);
    }
  }
  return keys.sort();
}

describe('i18n translations', () => {
  const enKeys = getKeys(en);
  const frKeys = getKeys(fr);

  it('EN and FR have the same number of keys', () => {
    expect(frKeys.length).toBe(enKeys.length);
  });

  it('no key is missing in FR', () => {
    const missing = enKeys.filter((k) => !frKeys.includes(k));
    expect(missing).toEqual([]);
  });

  it('no extra key in FR', () => {
    const extra = frKeys.filter((k) => !enKeys.includes(k));
    expect(extra).toEqual([]);
  });

  it('no empty values in EN', () => {
    const empty = enKeys.filter((k) => {
      const val = k.split('.').reduce((o: any, p) => o?.[p], en);
      return val === '' || val === null || val === undefined;
    });
    expect(empty).toEqual([]);
  });

  it('no empty values in FR', () => {
    const empty = frKeys.filter((k) => {
      const val = k.split('.').reduce((o: any, p) => o?.[p], fr);
      return val === '' || val === null || val === undefined;
    });
    expect(empty).toEqual([]);
  });
});
