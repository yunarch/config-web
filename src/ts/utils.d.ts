/**
 * Utility type that takes an object type and makes the hover overlay more readable.
 *
 * @see https://www.totaltypescript.com/concepts/the-prettify-helper
 */
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

// Utility types for entries in various data structures
type ObjectEntry<Base> = [keyof Base, Base[keyof Base]];
type ArrayEntry<Base extends readonly unknown[]> = [number, Base[number]];
type SetEntry<Base> = Base extends Set<infer V> ? [V, V] : never;
type MapEntry<Base> = Base extends Map<infer K, infer V> ? [K, V] : never;
type Entry<BaseType> =
  BaseType extends Map<unknown, unknown>
    ? MapEntry<BaseType>
    : BaseType extends Set<unknown>
      ? SetEntry<BaseType>
      : BaseType extends readonly unknown[]
        ? ArrayEntry<BaseType>
        : BaseType extends object
          ? ObjectEntry<BaseType>
          : never;

/**
 * Utility type to make `Object.entries` type-safe.
 *
 * @example
 * ```ts
 * const typedObjectEntries: ObjectEntries = Object.entries;
 * ```
 */
export type ObjectEntries = <T extends object>(obj: T) => Entry<T>[];

// Utilities for handling unions and intersections in TypeScript
type IsUnion<T, U extends T = T> = T extends unknown
  ? [U] extends [T]
    ? false
    : true
  : false;
type IfUnion<T, Yes, No> = true extends IsUnion<T> ? Yes : No;
type UnionToIntersection<U> = (
  U extends unknown ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;
type InferKeyOptionalityFromTupleType<
  T extends readonly [PropertyKey, unknown],
> = UnionToIntersection<
  T extends [unknown, unknown]
    ? { [K in T[0]]?: unknown }
    : IfUnion<T[0], { [K in T[0]]?: unknown }, { [K in T[0]]: unknown }>
>;

/**
 * Utility type to make `Object.fromEntries` type-safe.
 *
 * @example
 * ```ts
 * const typedObjectFromEntries: ObjectFromEntries = Object.fromEntries;
 * ```
 */
export type ObjectFromEntries = <
  T extends readonly [...(readonly (readonly [PropertyKey, unknown])[])],
>(
  entries: T
) => T extends [...T[number][]]
  ? {
      [K in T[number][0]]?: (readonly [K, T[number][1]] & T[number])[1];
    }
  : {
      [K in keyof InferKeyOptionalityFromTupleType<T[number]>]: (readonly [
        K,
        T[number][1],
      ] &
        T[number])[1];
    };
