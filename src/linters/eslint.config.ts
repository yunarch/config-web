import { FlatConfigComposer } from 'eslint-flat-config-utils';
import { base } from './eslint/configs/base';
import { disables } from './eslint/configs/disables';
import { imports } from './eslint/configs/imports';
import { jsdoc } from './eslint/configs/jsdoc';
import { typescript } from './eslint/configs/typescript';
import { unicorn } from './eslint/configs/unicorn';
import type {
  Awaitable,
  ConfigNames,
  OptionsConfig,
  TypedFlatConfigItem,
} from './eslint/types';
import { interopDefault } from './eslint/utils';

/**
 * Eslint configuration factory.
 *
 * @param options - Configuration options.
 * @returns A composer of ESLint configurations.
 */
export function factoryEslintConfig(options: OptionsConfig = {}) {
  const {
    gitignore = true,
    ignores,
    extraFileExtensions,
    imports: enableImports = true,
    jsdoc: enableJsdoc = true,
    unicorn: enableUnicorn = true,
    oxlint,
  } = options;
  const willUseOtherLinters = !!oxlint;
  const configs: Awaitable<TypedFlatConfigItem[]>[] = [];
  if (gitignore) {
    if (typeof gitignore === 'boolean') {
      configs.push(
        interopDefault(import('eslint-config-flat-gitignore')).then((r) => [
          r({
            name: 'yunarch/gitignore',
            strict: false,
          }),
        ])
      );
    } else {
      configs.push(
        interopDefault(import('eslint-config-flat-gitignore')).then((r) => [
          r({
            name: 'yunarch/gitignore',
            ...gitignore,
          }),
        ])
      );
    }
  }
  configs.push(base(options.base, ignores, willUseOtherLinters));
  if (options.typescript) {
    configs.push(
      typescript(
        options.typescript === true ? {} : options.typescript,
        extraFileExtensions
      )
    );
  }
  if (enableImports) {
    configs.push(imports());
  }
  if (enableJsdoc) {
    configs.push(jsdoc());
  }
  if (enableUnicorn) {
    configs.push(unicorn());
  }

  // Add disables, this should be always the last one
  configs.push(disables({ oxlint }));

  // Compose eslint configs
  let composer = new FlatConfigComposer<TypedFlatConfigItem, ConfigNames>();
  composer = composer.append(...configs);
  return composer;
}
