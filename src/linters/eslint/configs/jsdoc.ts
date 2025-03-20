import { pluginJsdoc } from '../plugins';
import type { OptionsConfig, TypedFlatConfigItem } from '../types';
import { getRulesFromOptionsOverrides } from '../utils';

export function jsdoc(
  options: Exclude<OptionsConfig['jsdoc'], boolean> = {}
): TypedFlatConfigItem[] {
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
          { enableRestElementFixer: false, checkDestructured: false },
        ],
        'jsdoc/require-throws': 'error',
        'jsdoc/tag-lines': ['error', 'any', { startLines: 1 }],
        // Overrides
        ...getRulesFromOptionsOverrides(options),
      },
    },
  ];
}
