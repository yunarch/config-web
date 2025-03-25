import { GLOB_TS, GLOB_TSX } from '../globs';
import { pluginImport } from '../plugins';
import type { TypedFlatConfigItem } from '../types';

/**
 * Imports ESLint configuration. The configuration for `eslint-plugin-import`.
 *
 * @returns An array of ESLint configurations.
 */
export function imports(): TypedFlatConfigItem[] {
  return [
    {
      name: 'yunarch/import/rules',
      plugins: {
        'import-x': pluginImport,
      },
      rules: {
        ...pluginImport.flatConfigs.recommended.rules,
        'import-x/first': 'error',
        'import-x/consistent-type-specifier-style': [
          'error',
          'prefer-top-level',
        ],
        'import-x/newline-after-import': 'warn',
        'import-x/no-absolute-path': 'warn',
        'import-x/no-cycle': ['error', { ignoreExternal: false, maxDepth: 3 }],
        'import-x/no-amd': 'error',
        'import-x/no-mutable-exports': 'error',
        'import-x/no-relative-packages': 'warn',
        'import-x/no-self-import': 'error',
        'import-x/no-useless-path-segments': 'warn',
        'import-x/no-duplicates': ['error', { 'prefer-inline': true }],
        'import-x/no-dynamic-require': 'error',
        'import-x/order': [
          'warn',
          {
            groups: [
              'builtin', // Node.js built-in modules
              'external', // Packages
              'internal', // Aliased modules
              'parent', // Relative parent
              'sibling', // Relative sibling
              'index', // Relative index
            ],
            pathGroups: [
              {
                pattern: '@/**',
                group: 'internal',
              },
              {
                pattern: '~/**',
                group: 'internal',
              },
            ],
            alphabetize: { order: 'asc' },
            'newlines-between': 'never',
          },
        ],
      },
    },
    {
      name: 'yunarch/import/typescript/rules',
      files: [GLOB_TS, GLOB_TSX],
      settings: {
        'import-x/resolver': {
          typescript: true,
        },
      },
      rules: {
        ...pluginImport.flatConfigs.typescript.rules,
      },
    },
  ];
}
