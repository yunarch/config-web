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
  const [pluginReact, pluginReactRefresh] = await Promise.all([
    interopDefault(import('@eslint-react/eslint-plugin')),
    interopDefault(import('eslint-plugin-react-refresh')),
  ] as const);
  const pluginReactAll = pluginReact.configs.all.plugins as Record<
    string,
    unknown
  >;
  return [
    {
      name: 'yunarch/react/setup',
      plugins: {
        react: pluginReactAll['@eslint-react'],
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
        ...pluginReactRefresh.configs.recommended.rules,
        'react/use-state': ['warn', { enforceAssignment: false }],
        // Disable experimental rules by default as they may cause false positives and are not stable yet.
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
              // Disable experimental rules by default as they may cause false positives and are not stable yet.
              ...pluginReact.configs['disable-experimental'].rules,
            },
          } as TypedFlatConfigItem,
        ]
      : []),
  ];
}
