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
      files: [
        `**/scripts/${GLOB_SRC}`,
        `**/tasks/${GLOB_SRC}`,
        `**/bin/${GLOB_SRC}`,
        `**/bin.${GLOB_SRC_EXT}`,
        `**/cli/${GLOB_SRC}`,
        `**/cli.${GLOB_SRC_EXT}`,
      ],
      rules: {
        '@typescript-eslint/no-floating-promises': 'off',
        'no-console': 'off',
        'unicorn/no-process-exit': 'off',
      },
    },
    {
      name: 'yunarch/disables/dts',
      files: [GLOB_DTS],
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
