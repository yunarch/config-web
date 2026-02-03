import {
  GLOB_ASTRO_TS,
  GLOB_MARKDOWN,
  GLOB_SRC,
  GLOB_TS,
  GLOB_TSX,
} from '../globs';
import type { OptionsConfig, TypedFlatConfigItem } from '../types';
import { interopDefault } from '../utils';

/**
 * React ESlint configuration.
 *
 * @param options - Configuration options.
 * @param tsOptions - TypeScript related options.
 * @returns An array of ESLint configurations.
 */
export async function react(
  options: true | Exclude<NonNullable<OptionsConfig['react']>, boolean>,
  tsOptions: {
    isTypescriptEnabled: boolean;
    isTypeAware: boolean;
  }
): Promise<TypedFlatConfigItem[]> {
  const isTypescriptEnabled = tsOptions.isTypescriptEnabled;
  const isTypeAware = isTypescriptEnabled && tsOptions.isTypeAware;
  const enableStrictRules = options === true || options.enableStrictRules;
  const [pluginReact, pluginReactHooks, pluginReactRefresh] = await Promise.all(
    [
      interopDefault(import('@eslint-react/eslint-plugin')),
      interopDefault(import('eslint-plugin-react-hooks')),
      interopDefault(import('eslint-plugin-react-refresh')),
    ] as const
  );
  const pluginReactAll =
    // ! TODO: using `as` here as a temporary workaround as `@eslint-react/eslint-plugin` types does not export plugins in configs, but they exist at runtime.
    (
      pluginReact.configs.all as typeof pluginReact.configs.all & {
        plugins: Record<string, unknown>;
      }
    ).plugins;
  return [
    {
      name: 'yunarch/react/setup',
      plugins: {
        '@eslint-react': pluginReactAll['@eslint-react'],
        '@eslint-react/dom': pluginReactAll['@eslint-react/dom'],
        '@eslint-react/hooks-extra':
          pluginReactAll['@eslint-react/hooks-extra'],
        '@eslint-react/naming-convention':
          pluginReactAll['@eslint-react/naming-convention'],
        '@eslint-react/web-api': pluginReactAll['@eslint-react/web-api'],
        'react-hooks': pluginReactHooks,
        'react-refresh': pluginReactRefresh,
      },
    },
    {
      name: 'yunarch/react/rules',
      files: [GLOB_SRC],
      languageOptions: {
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
        },
        sourceType: 'module',
      },
      rules: {
        ...pluginReact.configs.recommended.rules,
        ...(enableStrictRules ? pluginReact.configs.strict.rules : {}),
        ...pluginReactHooks.configs.recommended.rules,
        ...pluginReactRefresh.configs.recommended.rules,
        ...pluginReact.configs['disable-experimental'].rules,
      },
    },
    ...(isTypescriptEnabled
      ? [
          {
            name: 'yunarch/react/typescript/rules',
            files: [GLOB_TS, GLOB_TSX],
            ignores: [`${GLOB_MARKDOWN}/**`, GLOB_ASTRO_TS],
            languageOptions: {
              parserOptions: {
                projectService: true,
              },
            },
            rules: {
              ...pluginReact.configs['recommended-typescript'].rules,
              ...(enableStrictRules
                ? pluginReact.configs['strict-typescript'].rules
                : {}),
              ...(isTypeAware
                ? {
                    ...pluginReact.configs['recommended-type-checked'].rules,
                    ...(enableStrictRules
                      ? pluginReact.configs['strict-type-checked'].rules
                      : {}),
                  }
                : {}),
              ...pluginReact.configs['disable-experimental'].rules,
            },
          } as TypedFlatConfigItem,
        ]
      : []),
  ];
}
