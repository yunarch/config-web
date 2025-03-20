import { pluginImport } from '../plugins';
import type { OptionsConfig, TypedFlatConfigItem } from '../types';
import { getRulesFromOptionsOverrides } from '../utils';

export function imports(
  options: Exclude<OptionsConfig['imports'], boolean> = {}
): TypedFlatConfigItem[] {
  return [
    {
      name: 'yunarch/import/rules',
      plugins: {
        import: pluginImport,
      },
      rules: {
        ...pluginImport.flatConfigs.recommended.rules,
        'import/first': 'error',
        'import/newline-after-import': 'warn',
        'import/no-absolute-path': 'warn',
        'import/no-cycle': ['error', { ignoreExternal: false, maxDepth: 3 }],
        'import/no-amd': 'error',
        'import/no-mutable-exports': 'error',
        'import/no-relative-packages': 'warn',
        'import/no-self-import': 'error',
        'import/no-useless-path-segments': 'warn',
        'import/no-duplicates': ['error', { 'prefer-inline': true }],
        'import/no-dynamic-require': 'error',
        'import/order': [
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
        // Overrides
        ...getRulesFromOptionsOverrides(options),
      },
    },
  ];
}
