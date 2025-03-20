import { Linter } from 'eslint';
import { Awaitable, OptionsOverrides, TypedFlatConfigItem } from './types';
import type { RuleList } from './typegen';

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
  return (resolved as any).default ?? resolved;
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
  const resolved = await Promise.all(configs);
  return resolved.flat();
}

/**
 * Utility function to get the override rules object from options.
 *
 * @param overrideRules - Override rules object.
 * @returns Override rules object with the correct type.
 */
export function getOptionsOverridesRules<T extends keyof RuleList>(
  options?: OptionsOverrides<T>
): Linter.RulesRecord {
  return options?.overrides?.rules ?? {};
}
