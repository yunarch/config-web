import { GLOB_DTS, GLOB_SRC, GLOB_SRC_EXT } from '../globs';
import { pluginOxlint, pluginPrettier } from '../plugins';
import type { OptionsConfig, TypedFlatConfigItem } from '../types';

/**
 * Disables ESLint configuration.
 *
 * @param options - Configuration options.
 * @returns An array of ESLint configurations.
 */
export function disables(options: {
  oxlint?: OptionsConfig['oxlint'];
}): TypedFlatConfigItem[] {
  const { oxlint } = options;
  return [
    {
      name: 'yunarch/disables/cli',
      files: [`**/cli/${GLOB_SRC}`, `**/cli.${GLOB_SRC_EXT}`],
      rules: {
        'no-console': 'off',
        '@typescript-eslint/no-floating-promises': 'off',
        'unicorn/no-process-exit': 'off',
      },
    },
    {
      files: [GLOB_DTS],
      name: 'yunarch/disables/dts',
      rules: {
        '@typescript-eslint/consistent-indexed-object-style': 'off',
      },
    },
    {
      name: 'yunarch/disables/prettier',
      rules: {
        ...pluginPrettier.rules,
      },
    },
    ...(oxlint?.oxlintConfigPath
      ? pluginOxlint.buildFromOxlintConfigFile(oxlint.oxlintConfigPath)
      : []),
  ];
}
