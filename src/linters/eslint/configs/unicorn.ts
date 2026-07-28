import pluginUnicorn from 'eslint-plugin-unicorn';
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
          {
            cases: { camelCase: true, kebabCase: true, pascalCase: true },
            checkDirectories: false,
          },
        ],
        'unicorn/no-array-reduce': 'off',
        'unicorn/no-null': 'off',
        'unicorn/prefer-number-properties': [
          'error',
          { checkInfinity: true, checkNaN: true },
        ],
        'unicorn/prefer-top-level-await': 'warn',
        'unicorn/prefer-await': 'off',
        'unicorn/name-replacements': 'off',
        'unicorn/consistent-boolean-name': 'off', // To strict, users should decide depending on their needs.
        'unicorn/no-non-function-verb-prefix': 'off', // To strict, users should decide depending on their needs.
        'unicorn/no-declarations-before-early-exit': 'off', // Users should be in control of their code structure.
        'unicorn/no-top-level-side-effects': 'off',
        'unicorn/no-useless-undefined': ['error', { checkArguments: false }],
      },
    },
  ];
}
