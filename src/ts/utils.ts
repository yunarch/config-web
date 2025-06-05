export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

// Types
type ObjectEntry<Base> = [keyof Base, Base[keyof Base]];
type ArrayEntry<Base extends readonly unknown[]> = [number, Base[number]];
type SetEntry<Base> = Base extends Set<infer V> ? [V, V] : never;
type MapEntry<Base> = Base extends Map<infer K, infer V> ? [K, V] : never;
type Entry<BaseType> = BaseType extends Map<unknown, unknown>
  ? MapEntry<BaseType>
  : BaseType extends Set<unknown>
    ? SetEntry<BaseType>
    : BaseType extends readonly unknown[]
      ? ArrayEntry<BaseType>
      : BaseType extends object
        ? ObjectEntry<BaseType>
        : never;

/**
 * Utility function to have a type-safety alternative to Object.entries.
 *
 * @param obj - The object to create entries from.
 * @returns Object entries with typed keys and values.
 */
export function typedObjectEntries<T extends object>(obj: T) {
  return Object.entries(obj) as Entry<T>[];
}

// Types
type IsUnion<T, U extends T = T> = T extends unknown
  ? [U] extends [T]
    ? false
    : true
  : false;
type IfUnion<T, Yes, No> = true extends IsUnion<T> ? Yes : No;
type UnionToIntersection<U> = (
  U extends unknown
    ? (k: U) => void
    : never
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
 * Utility function to have a type-safe alternative to Object.fromEntries.
 *
 * @param entries - The entries to create an object from.
 * @returns An object with typed keys and values based on the provided entries.
 */
export function typedObjectFromEntries<
  T extends readonly [...(readonly (readonly [PropertyKey, unknown])[])],
>(entries: T) {
  return Object.fromEntries(entries) as T extends [...T[number][]]
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
}
