import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import { createNodeResolver } from 'eslint-plugin-import-x';
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
      name: 'yunarch/import/setup',
      settings: {
        'import-x/resolver-next': [createNodeResolver()],
      },
    },
    {
      name: 'yunarch/import/rules',
      plugins: {
        import: pluginImport,
      },
      rules: {
        ...pluginImport.flatConfigs.recommended.rules,
        'import/first': 'error',
        'import/newline-after-import': ['error', { count: 1 }],
        'import/no-absolute-path': 'error',
        'import/no-amd': 'error',
        'import/no-cycle': ['error', { ignoreExternal: false, maxDepth: 3 }],
        'import/no-duplicates': ['error', { 'prefer-inline': true }],
        'import/no-dynamic-require': 'error',
        'import/no-mutable-exports': 'error',
        'import/no-relative-packages': 'error',
        'import/no-self-import': 'error',
        'import/no-useless-path-segments': 'error',
      },
    },
    {
      name: 'yunarch/import/typescript/rules',
      files: [GLOB_TS, GLOB_TSX],
      rules: {
        ...pluginImport.flatConfigs.typescript.rules,
      },
      settings: {
        'import-x/resolver-next': [createTypeScriptImportResolver()],
      },
    },
  ];
}
