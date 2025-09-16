import type { Awaitable, TypedFlatConfigItem } from './types';

/**
 * Interop default export from module.
 *
 * @param module - Module to import.
 * @returns Default export from module.
 */
export async function interopDefault<T>(
  module: Awaitable<T>
): Promise<T extends { default: infer U } ? U : T> {
  const resolved = await module;
  return (
    typeof resolved === 'object' && resolved && 'default' in resolved
      ? resolved.default
      : resolved
  ) as T extends { default: infer D } ? D : T;
}

/**
 * Combine array and non-array configs into a single array.
 *
 * @param configs - Configs to combine.
 * @returns A promise that resolves to a single array of configs.
 */
export async function combine(
  ...configs: Awaitable<TypedFlatConfigItem | TypedFlatConfigItem[]>[]
): Promise<TypedFlatConfigItem[]> {
  const resolved = await Promise.all(configs.map((c) => Promise.resolve(c)));
  return resolved.flat();
}
