import { pluginOxlint, pluginPrettier } from '../plugins';
import { OptionsConfig, TypedFlatConfigItem } from '../types';

/**
 * Disables ESLint rules.
 */
export function disables(options: {
  oxlint?: OptionsConfig['oxlint'];
}): TypedFlatConfigItem[] {
  const { oxlint } = options;
  return [
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
