import type {
  Awaitable,
  ConfigNames,
  OptionsConfig,
  OptionsOverrides,
  TypedFlatConfigItem,
} from './types';

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
 * Utility function to get the overrides object from the options config object.
 *
 * @param options - The options object.
 * @param key - The key to extract from the options object.
 * @returns The overrides object from the options object, undefined if not present.
 */
export function getOverridesFromOptionsConfig<K extends keyof OptionsConfig>(
  options: OptionsConfig,
  key: K
): Exclude<OptionsConfig[K] | undefined, boolean> {
  return !options[key] || typeof options[key] === 'boolean'
    ? undefined
    : (options[key] as any);
}

/**
 * Utility function to get the rules object from an options object.
 *
 * @param options - Options object.
 * @returns extracted rules object from options object.
 */
export function getRulesFromOptionsOverrides<K extends ConfigNames>(
  options?: OptionsOverrides<K>
) {
  return {
    ...(options?.overrides ?? {}),
    ...(options?.extends ?? {}),
  };
}
