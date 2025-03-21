import { pluginPrettier } from '../plugins';
import { TypedFlatConfigItem } from '../types';

/**
 * Disables ESLint rules.
 */
export function disables(): TypedFlatConfigItem[] {
  return [
    {
      name: 'yunarch/disables/prettier',
      files: [],
      rules: {
        ...pluginPrettier.rules,
      },
    },
  ];
}
