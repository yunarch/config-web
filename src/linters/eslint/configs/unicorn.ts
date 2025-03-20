import { pluginUnicorn } from '../plugins';
import type { OptionsConfig, TypedFlatConfigItem } from '../types';
import { getRulesFromOptionsOverrides } from '../utils';

export function unicorn(
  options: Exclude<OptionsConfig['unicorn'], boolean> = {}
): TypedFlatConfigItem[] {
  return [
    {
      name: 'yunarch/unicorn/rules',
      plugins: {
        unicorn: pluginUnicorn,
      },
      rules: {
        ...pluginUnicorn.configs.recommended.rules,
        'unicorn/no-array-callback-reference': 'off',
        'unicorn/no-array-for-each': 'off',
        'unicorn/no-array-reduce': 'off',
        'unicorn/no-negated-condition': 'off',
        'unicorn/no-null': 'off',
        'unicorn/no-object-as-default-parameter': 'off',
        'unicorn/prefer-default-parameters': 'off',
        'unicorn/prefer-top-level-await': 'off',
        'unicorn/prevent-abbreviations': 'off',
        'unicorn/filename-case': [
          'error',
          { cases: { camelCase: true, pascalCase: true, kebabCase: true } },
        ],
        'unicorn/prefer-node-protocol': 'warn',
        'unicorn/prefer-number-properties': [
          'warn',
          { checkInfinity: true, checkNaN: true },
        ],
        // Overrides
        ...getRulesFromOptionsOverrides(options),
      },
    },
  ];
}
