import { describe, expectTypeOf, it } from 'vitest';
import { typedObjectEntries } from '../../src/ts/utils';

describe('typedObjectEntries', () => {
  it('returns correctly typed entries from a regular object', () => {
    const entries = typedObjectEntries({ a: 1, b: 'two', c: true });
    expectTypeOf(entries).toEqualTypeOf<
      ['a' | 'b' | 'c', number | string | boolean][]
    >();
  });

  it('returns correctly typed entries from a const object', () => {
    const entries = typedObjectEntries({ a: 1, b: 'two', c: true } as const);
    expectTypeOf(entries).toEqualTypeOf<
      ['a' | 'b' | 'c', 1 | 'two' | true][]
    >();
  });

  it('returns correctly typed entries from a number array', () => {
    const entries = typedObjectEntries([1, 2]);
    expectTypeOf(entries).toEqualTypeOf<[number, number][]>();
  });

  it('returns correctly typed entries from a const number array', () => {
    const entries = typedObjectEntries([1, 2] as const);
    expectTypeOf(entries).toEqualTypeOf<[number, 1 | 2][]>();
  });

  it('returns correctly typed entries from a mixed-type array', () => {
    const entries = typedObjectEntries([1, 'two', true]);
    expectTypeOf(entries).toEqualTypeOf<
      [number, number | string | boolean][]
    >();
  });

  it('returns correctly typed entries from a const mixed-type array', () => {
    const entries = typedObjectEntries([1, 'two', true] as const);
    expectTypeOf(entries).toEqualTypeOf<[number, 1 | 'two' | true][]>();
  });

  it('returns correctly typed entries from a Map with primitive key and value types', () => {
    const entries = typedObjectEntries(
      new Map<string, number | string | boolean>([
        ['a', 1],
        ['b', 'two'],
        ['c', true],
      ])
    );
    expectTypeOf(entries).toEqualTypeOf<
      [string, string | number | boolean][]
    >();
  });

  it('returns correctly typed entries from a Map with mixed key types', () => {
    const entries = typedObjectEntries(
      new Map<string | number, number | string | boolean>([
        ['a', 1],
        [2, 'two'],
        ['c', true],
      ])
    );
    expectTypeOf(entries).toEqualTypeOf<
      [string | number, string | number | boolean][]
    >();
  });

  it('returns correctly typed entries from a const Map with literal key and value types', () => {
    const entries = typedObjectEntries(
      new Map<'a' | 'b' | 'c', 1 | 'two' | true>([
        ['a', 1],
        ['b', 'two'],
        ['c', true],
      ] as const)
    );
    expectTypeOf(entries).toEqualTypeOf<
      ['a' | 'b' | 'c', true | 1 | 'two'][]
    >();
  });

  it('returns correctly typed entries from a Set of strings', () => {
    const entries = typedObjectEntries(new Set<string>(['a', 'b', 'c']));
    expectTypeOf(entries).toEqualTypeOf<[string, string][]>();
  });

  it('returns correctly typed entries from a const Set of string literals', () => {
    const entries = typedObjectEntries(
      new Set<'a' | 'b' | 'c'>(['a', 'b', 'c'] as const)
    );
    expectTypeOf(entries).toEqualTypeOf<['a' | 'b' | 'c', 'a' | 'b' | 'c'][]>();
  });
});
