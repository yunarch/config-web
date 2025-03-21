import { getOverridesFromOptionsConfig, interopDefault } from './eslint/utils';
import { base } from './eslint/configs/base';
import type {
  Awaitable,
  ConfigNames,
  OptionsConfig,
  TypedFlatConfigItem,
} from './eslint/types';
import { FlatConfigComposer } from 'eslint-flat-config-utils';
import { jsdoc } from './eslint/configs/jsdoc';
import { imports } from './eslint/configs/imports';
import { unicorn } from './eslint/configs/unicorn';
import { disables } from './eslint/configs/disables';

export function factoryEslintConfig(options: OptionsConfig = {}) {
  const {
    gitignore = true,
    imports: enableImports = true,
    jsdoc: enableJsdoc = true,
    unicorn: enableUnicorn = true,
    oxlint,
  } = options;
  const willUseOtherLinters = !!oxlint;
  const configs: Awaitable<TypedFlatConfigItem[]>[] = [];
  if (gitignore) {
    if (typeof gitignore !== 'boolean') {
      configs.push(
        interopDefault(import('eslint-config-flat-gitignore')).then((r) => [
          r({
            name: 'yunarch/gitignore',
            ...gitignore,
          }),
        ])
      );
    } else {
      configs.push(
        interopDefault(import('eslint-config-flat-gitignore')).then((r) => [
          r({
            name: 'yunarch/gitignore',
            strict: false,
          }),
        ])
      );
    }
  }
  configs.push(base(options.base, options.ignores, willUseOtherLinters));
  if (enableImports) {
    configs.push(imports(getOverridesFromOptionsConfig(options, 'imports')));
  }
  if (enableJsdoc) {
    configs.push(jsdoc(getOverridesFromOptionsConfig(options, 'jsdoc')));
  }
  if (enableUnicorn) {
    configs.push(unicorn(getOverridesFromOptionsConfig(options, 'unicorn')));
  }

  // Add disables, this should be always the last one
  configs.push(disables({ oxlint }));

  // Compose eslint configs
  const composer = new FlatConfigComposer<TypedFlatConfigItem, ConfigNames>();
  composer.append(...configs);
  return composer;
}
