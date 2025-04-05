import { GLOB_TESTS } from '../globs';
import type { OptionsConfig, TypedFlatConfigItem } from '../types';
import { interopDefault } from '../utils';

/**
 * Test ESLint configuration.
 *
 * @param options - The options for the test configuration.
 * @returns An array of ESLint configurations.
 */
export async function test(
  options: Exclude<NonNullable<OptionsConfig['test']>, boolean>
): Promise<TypedFlatConfigItem[]> {
  const { enableTypeTesting } = options;
  const pluginVitest = await interopDefault(import('@vitest/eslint-plugin'));
  return [
    {
      name: 'yunarch/test/setup',
      plugins: {
        vitest: pluginVitest,
      },
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
  ];
}
