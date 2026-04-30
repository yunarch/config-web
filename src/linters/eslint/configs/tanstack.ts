import { GLOB_ASTRO_TS, GLOB_MARKDOWN, GLOB_TS, GLOB_TSX } from '../globs';
import type { OptionsConfig, TypedFlatConfigItem } from '../types';
import { interopDefault } from '../utils';

/**
 * Tanstack ESLint configuration. The configuration for tanstack eslint plugins.
 *
 * @param options - The options for the tanstack configuration.
 * @param tsOptions - TypeScript related options.
 * @returns An array of ESLint configurations.
 */
export async function tanstack(
  options: true | Exclude<NonNullable<OptionsConfig['tanstack']>, boolean>,
  tsOptions: {
    typescriptEnabled: boolean;
  }
): Promise<TypedFlatConfigItem[]> {
  const typescriptEnabled = tsOptions.typescriptEnabled;
  const enableQuery = options === true || options.enableQuery;
  const enableRouter = options === true || options.enableRouter;
  const configs: TypedFlatConfigItem[] = [];
  if (enableQuery) {
    const pluginTanstackQuery = await interopDefault(
      import('@tanstack/eslint-plugin-query')
    );
    configs.push({
      name: 'yunarch/tanstack/query/rules',
      plugins: {
        '@tanstack/query': pluginTanstackQuery,
      },
      rules: {
        ...pluginTanstackQuery.configs['flat/recommended'].at(0)?.rules,
      },
    });
  }
  if (enableRouter) {
    const pluginTanstackRouter = await interopDefault(
      import('@tanstack/eslint-plugin-router')
    );
    configs.push(
      {
        name: 'yunarch/tanstack/router/rules',
        plugins: {
          '@tanstack/router': pluginTanstackRouter,
        },
        rules: {
          ...pluginTanstackRouter.configs['flat/recommended'].at(0)?.rules,
        },
      },
      ...(typescriptEnabled
        ? [
            {
              name: 'yunarch/tanstack/router/typescript/rules',
              files: [GLOB_TS, GLOB_TSX],
              ignores: [`${GLOB_MARKDOWN}/**`, GLOB_ASTRO_TS],
              rules: {
                '@typescript-eslint/only-throw-error': [
                  'error',
                  { allow: ['Redirect', 'NotFoundError'] },
                ],
              },
            } as TypedFlatConfigItem,
          ]
        : [])
    );
  }
  return configs;
}
