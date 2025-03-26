import { pluginUnicorn } from '../plugins';
import type { TypedFlatConfigItem } from '../types';

/**
 * Unicorn ESLint configuration. The configuration for `eslint-plugin-unicorn`.
 *
 * @returns An array of ESLint configurations.
 */
export function unicorn(): TypedFlatConfigItem[] {
  return [
    {
      name: 'yunarch/unicorn/rules',
      plugins: {
        unicorn: pluginUnicorn,
      },
      rules: {
        ...pluginUnicorn.configs.recommended.rules,
        'unicorn/filename-case': [
          'error',
          { cases: { camelCase: true, kebabCase: true, pascalCase: true } },
        ],
        // 'unicorn/no-array-for-each': 'off',
        // 'unicorn/no-array-reduce': 'off',
        // 'unicorn/no-object-as-default-parameter': 'off',
        'unicorn/prefer-number-properties': [
          'error',
          { checkInfinity: true, checkNaN: true },
        ],
        // 'unicorn/prefer-top-level-await': 'off',
        'unicorn/prevent-abbreviations': 'off',
      },
    },
  ];
}
