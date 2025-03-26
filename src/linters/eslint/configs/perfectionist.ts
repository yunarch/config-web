import { pluginPerfectionist } from '../plugins';
import type { TypedFlatConfigItem } from '../types';

/**
 * Perfectionist ESLint configuration. The configuration for `eslint-plugin-perfectionist`.
 *
 * @returns An array of ESLint configurations.
 */
export function perfectionist(): TypedFlatConfigItem[] {
  return [
    {
      name: 'yunarch/perfectionist/rules',
      plugins: {
        perfectionist: pluginPerfectionist,
      },
      rules: {
        'perfectionist/sort-exports': [
          'error',
          { order: 'asc', type: 'natural' },
        ],
        'perfectionist/sort-imports': [
          'error',
          {
            groups: [
              'builtin',
              'external',
              'internal',
              ['parent', 'sibling', 'index'],
              'side-effect',
              'object',
              'unknown',
            ],
            newlinesBetween: 'ignore',
            order: 'asc',
            type: 'natural',
          },
        ],
        'perfectionist/sort-named-exports': [
          'error',
          { order: 'asc', type: 'natural' },
        ],
        'perfectionist/sort-named-imports': [
          'error',
          { groupKind: 'values-first', order: 'asc', type: 'natural' },
        ],
        // Disable conflicting rules
        'import/order': 'off',
        'import-x/order': 'off',
        'sort-imports': 'off',
      },
    },
  ];
}
