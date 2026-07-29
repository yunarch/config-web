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
        'unicorn/no-non-function-verb-prefix': 'off', // To strict, users should decide depending on their needs.
        'unicorn/no-declarations-before-early-exit': 'off', // To strict, users should decide depending on their needs.
        'unicorn/no-top-level-side-effects': 'off',
        'unicorn/no-useless-undefined': ['error', { checkArguments: false }],
        'unicorn/no-break-in-nested-loop': 'off', // Users should be in control of their code structure.

        'unicorn/prefer-top-level-await': 'warn',
        'unicorn/prefer-iterator-to-array': 'off',
        'unicorn/prefer-number-properties': [
          'error',
          { checkInfinity: true, checkNaN: true },
        ],
        'unicorn/prefer-global-number-constants': 'off', // We use `checkInfinity` and `checkNaN` in `unicorn/prefer-number-properties` instead.
        'unicorn/prefer-number-coercion': 'off',
        'unicorn/prefer-math-constants': 'off',
        'unicorn/prefer-includes-over-repeated-comparisons': 'off', // Users should be in control of their code structure.
        'unicorn/prefer-else-if': 'off', // Users should be in control of their code structure.
        'unicorn/prefer-simple-condition-first': 'off', // Users should be in control of their code structure.
        'unicorn/prefer-early-return': 'off', // Users should be in control of their code structure.

        'unicorn/name-replacements': 'off',

        'unicorn/consistent-compound-words': 'off', // To strict, users should decide depending on their needs.
        'unicorn/consistent-boolean-name': 'off', // To strict, users should decide depending on their needs.

        'unicorn/max-nested-calls': 'off', // Will make libraries like zod always complaining about this rule.
      },
    },
  ];
}
