import type { Awaitable } from './types';

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
