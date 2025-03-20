import { getOverridesFromOptionsConfig, interopDefault } from './eslint/utils';
import { base } from './eslint/configs/base';
import type {
  Awaitable,
  OptionsConfig,
  TypedFlatConfigItem,
} from './eslint/types';
import { FlatConfigComposer } from 'eslint-flat-config-utils';
import { jsdoc } from './eslint/configs/jsdoc';
import { imports } from './eslint/configs/imports';
import { unicorn } from './eslint/configs/unicorn';

export function factoryEslintConfig(options: OptionsConfig = {}) {
  const {
    gitignore = true,
    imports: enableImports = true,
    jsdoc: enableJsdoc = true,
    unicorn: enableUnicorn = true,
  } = options;
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
  configs.push(base(options.base, options.ignores, options.oxlint));
  if (enableImports) {
    configs.push(imports(getOverridesFromOptionsConfig(options, 'imports')));
  }
  if (enableJsdoc) {
    configs.push(jsdoc(getOverridesFromOptionsConfig(options, 'jsdoc')));
  }
  if (enableUnicorn) {
    configs.push(unicorn(getOverridesFromOptionsConfig(options, 'unicorn')));
  }

  // Compose eslint configs
  const composer = new FlatConfigComposer<TypedFlatConfigItem>();
  composer.append(...configs);
  return composer;
}
