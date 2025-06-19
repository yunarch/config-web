import { describe, expectTypeOf, it } from 'vitest';
import type { ObjectFromEntries } from '../../src/ts/utils.d';

// Type-safe version of `Object.fromEntries`
const typedObjectFromEntries: ObjectFromEntries = Object.fromEntries;

describe('typedObjectFromEntries', () => {
  it('returns generic object with possibly undefined values from non-const entries', () => {
    const obj = typedObjectFromEntries([
      ['key1', 1],
      ['key2', 2],
    ]);
    expectTypeOf(obj).toEqualTypeOf<{ [x: string]: number | undefined }>();
  });

  it('returns correctly typed object from const entries with number values', () => {
    const obj = typedObjectFromEntries([
      ['key1', 1],
      ['key2', 2],
    ] as const);
    expectTypeOf(obj).toEqualTypeOf<{ key1: 1; key2: 2 }>();
  });

  it('returns correctly typed object from const entries with mixed value types', () => {
    const obj = typedObjectFromEntries([
      ['key1', 1],
      ['key2string', '2'],
    ] as const);
    expectTypeOf(obj).toEqualTypeOf<{ key1: 1; key2string: '2' }>();
  });

  it('infers optional keys when entries are not fully const', () => {
    const obj = typedObjectFromEntries([
      ['key1', 1] as const,
      ['key2', 2] as const,
    ]);
    expectTypeOf(obj).toEqualTypeOf<{ key1?: 1; key2?: 2 }>();
  });

  it('infers optional keys with string and number values when entries are const', () => {
    const obj = typedObjectFromEntries([
      ['key1', 1] as const,
      ['key2string', '2'] as const,
    ]);
    expectTypeOf(obj).toEqualTypeOf<{ key1?: 1; key2string?: '2' }>();
  });

  it('returns generic Record type when value types are not fully const', () => {
    const obj = typedObjectFromEntries([
      ['key1', 1] as const,
      ['key2string', '2'],
    ]);
    expectTypeOf(obj).toEqualTypeOf<Record<string, string | 1 | undefined>>();
  });
});
