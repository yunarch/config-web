import {
  GLOB_ASTRO_TS,
  GLOB_MARKDOWN,
  GLOB_SRC,
  GLOB_TS,
  GLOB_TSX,
} from '../globs';
import type { TypedFlatConfigItem } from '../types';
import { interopDefault } from '../utils';

/**
 * React ESlint configuration.
 *
 * @param options - Configuration options.
 * @returns An array of ESLint configurations.
 */
export async function react(options: {
  isTypescriptEnabled: boolean;
  isTypeAware: boolean;
}): Promise<TypedFlatConfigItem[]> {
  const [pluginReact, pluginReactHooks, pluginReactRefresh] = await Promise.all(
    [
      interopDefault(import('@eslint-react/eslint-plugin')),
      interopDefault(import('eslint-plugin-react-hooks')),
      interopDefault(import('eslint-plugin-react-refresh')),
    ] as const
  );
  const pluginReactAll = pluginReact.configs.all.plugins;
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
        ...pluginReactHooks.configs.recommended.rules,
        ...pluginReactRefresh.configs.recommended.rules,
      },
    },
    ...(options.isTypescriptEnabled
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
              ...(options.isTypeAware
                ? pluginReact.configs['recommended-type-checked'].rules
                : {}),
            },
          },
        ]
      : []),
  ];
}
