import { interopDefault } from './eslint/utils';
import { base } from './eslint/configs/base';
import type {
  Awaitable,
  OptionsConfig,
  TypedFlatConfigItem,
} from './eslint/types';
import { FlatConfigComposer } from 'eslint-flat-config-utils';

export function factoryEslintConfig(options: OptionsConfig = {}) {
  const { gitignore = true } = options;
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
  const composer = new FlatConfigComposer<TypedFlatConfigItem>();
  composer.append(...configs);
  return composer;
}
