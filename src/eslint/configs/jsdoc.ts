import pluginJsdoc, { jsdoc as proceduralJsdoc } from 'eslint-plugin-jsdoc';
import { GLOB_TS, GLOB_TSX } from '../globs';
import type { TypedFlatConfigItem } from '../types';

/**
 * Jsdoc ESLint configuration. The configuration for `eslint-plugin-jsdoc`.
 *
 * @returns An array of ESLint configurations.
 */
export function jsdoc(): TypedFlatConfigItem[] {
  return [
    proceduralJsdoc({
      name: 'yunarch/jsdoc/rules',
      config: 'flat/recommended-error',
      rules: {
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
    }),
    proceduralJsdoc({
      name: 'yunarch/jsdoc/typescript/rules',
      files: [GLOB_TS, GLOB_TSX],
      config: 'flat/recommended-typescript-error',
      rules: {
        // eslint-pluging-jsdoc does not allow array of configs
        ...pluginJsdoc.configs['flat/contents-typescript-error'].rules,
        ...pluginJsdoc.configs['flat/logical-typescript-error'].rules,
        ...pluginJsdoc.configs['flat/stylistic-typescript-error'].rules,
        // Overrides
        'jsdoc/require-hyphen-before-param-description': ['error', 'always'],
        'jsdoc/require-param': [
          'error',
          { checkDestructured: false, enableRestElementFixer: false },
        ],
        'jsdoc/require-throws': 'error',
      },
    }),
  ];
}
