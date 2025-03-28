import { FlatConfigComposer } from 'eslint-flat-config-utils';
import { base } from './configs/base';
import { disables } from './configs/disables';
import { imports } from './configs/imports';
import { jsdoc } from './configs/jsdoc';
import { perfectionist } from './configs/perfectionist';
import { tanstack } from './configs/tanstack';
import { typescript } from './configs/typescript';
import { unicorn } from './configs/unicorn';
import type {
  Awaitable,
  ConfigNames,
  OptionsConfig,
  TypedFlatConfigItem,
  UserConfig,
} from './types';
import { interopDefault } from './utils';

/**
 * ESlint configuration factory.
 *
 * @param options - Configuration options.
 * @param userConfigs - User configurations.
 * @returns A composer of ESLint configurations.
 */
export function config(
  options: OptionsConfig = {},
  ...userConfigs: UserConfig[]
) {
  const {
    gitignore = true,
    ignores,
    extraFileExtensions,
    import: enableImports = true,
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
  if (options.tanstack) {
    configs.push(tanstack(options.tanstack));
  }
  configs.push(perfectionist(), disables({ oxlint }));

  // Compose eslint configs
  let composer = new FlatConfigComposer<TypedFlatConfigItem, ConfigNames>();
  composer = composer.append(
    ...configs,
    ...(userConfigs as Awaitable<TypedFlatConfigItem>[])
  );
  composer = composer.renamePlugins({
    'import-x': 'import',
  });
  return composer;
}
