import { GLOB_TS, GLOB_TSX } from '../globs';
import { pluginJsdoc } from '../plugins';
import type { TypedFlatConfigItem } from '../types';

/**
 * Jsdoc ESLint configuration. The configuration for `eslint-plugin-jsdoc`.
 *
 * @returns An array of ESLint configurations.
 */
export function jsdoc(): TypedFlatConfigItem[] {
  return [
    {
      name: 'yunarch/jsdoc/rules',
      plugins: {
        jsdoc: pluginJsdoc,
      },
      rules: {
        ...pluginJsdoc.configs['flat/recommended-error'].rules,
        'jsdoc/check-param-names': ['error', { checkDestructured: false }],
        'jsdoc/lines-before-block': ['error', { lines: 0 }],
        'jsdoc/require-hyphen-before-param-description': ['error', 'always'],
        'jsdoc/require-param': [
          'error',
          { checkDestructured: false, enableRestElementFixer: false },
        ],
        'jsdoc/require-throws': 'error',
        'jsdoc/tag-lines': ['error', 'any', { startLines: 1 }],
      },
    },
    {
      name: 'yunarch/jsdoc/typescript/rules',
      files: [GLOB_TS, GLOB_TSX],
      rules: {
        ...pluginJsdoc.configs['flat/recommended-typescript-error'].rules,
        ...pluginJsdoc.configs['flat/contents-typescript-error'].rules,
        ...pluginJsdoc.configs['flat/logical-typescript-error'].rules,
        ...pluginJsdoc.configs['flat/stylistic-typescript-error'].rules,
        'jsdoc/require-hyphen-before-param-description': ['error', 'always'],
        'jsdoc/require-throws': 'error',
      },
    },
  ];
}
