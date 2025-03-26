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
        'import-x/newline-after-import': ['error', { count: 1 }],
        'import-x/no-absolute-path': 'error',
        'import-x/no-amd': 'error',
        'import-x/no-cycle': ['error', { ignoreExternal: false, maxDepth: 3 }],
        'import-x/no-duplicates': ['error', { 'prefer-inline': true }],
        'import-x/no-dynamic-require': 'error',
        'import-x/no-mutable-exports': 'error',
        'import-x/no-relative-packages': 'error',
        'import-x/no-self-import': 'error',
        'import-x/no-useless-path-segments': 'error',
      },
    },
    {
      name: 'yunarch/import/typescript/rules',
      files: [GLOB_TS, GLOB_TSX],
      rules: {
        ...pluginImport.flatConfigs.typescript.rules,
      },
      settings: {
        'import-x/resolver': {
          typescript: true,
        },
      },
    },
  ];
}
