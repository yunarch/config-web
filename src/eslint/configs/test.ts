import { GLOB_TESTS } from '../globs';
import { pluginVitest } from '../plugins';
import type { OptionsConfig, TypedFlatConfigItem } from '../types';

/**
 * Test ESLint configuration.
 *
 * @param options - The options for the test configuration.
 * @returns An array of ESLint configurations.
 */
export function test(
  options: Exclude<NonNullable<OptionsConfig['test']>, boolean>
): TypedFlatConfigItem[] {
  const { enableTypeTesting } = options;
  return [
    {
      name: 'yunarch/test/setup',
      plugins: {
        vitest: pluginVitest,
      },
      ...(enableTypeTesting
        ? {
            settings: {
              vitest: {
                typecheck: true,
              },
            },
            languageOptions: {
              globals: {
                ...pluginVitest.environments.env.globals,
              },
            },
          }
        : {}),
    },
    {
      name: 'yunarch/test/rules',
      files: [...GLOB_TESTS],
      rules: {
        ...pluginVitest.configs.recommended.rules,
        'vitest/consistent-test-it': [
          'error',
          { fn: 'it', withinDescribe: 'it' },
        ],
        'vitest/prefer-hooks-in-order': 'error',
        'vitest/prefer-lowercase-title': 'error',
      },
    },
  ];
}
