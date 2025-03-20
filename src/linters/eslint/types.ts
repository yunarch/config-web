import type { Linter } from 'eslint';
import type { RuleList, RuleOptions } from './typegen';
import type { FlatGitignoreOptions } from 'eslint-config-flat-gitignore';

export type Awaitable<T> = T | Promise<T>;

export type RulesRecord<K extends keyof RuleList> = RuleList[K];

export type TypedFlatConfigItem = Omit<
  Linter.Config<Linter.RulesRecord & RuleOptions>,
  'plugins'
> & {
  /**
   * An object containing a name-value mapping of plugin names to plugin objects.
   * When `files` is specified, these plugins are only available to the matching files.
   *
   * @see https://eslint.org/docs/latest/user-guide/configuring/configuration-files-new#using-plugins-in-your-configuration
   */
  plugins?: Record<string, any>;
};

export type OptionsOverrides<K extends keyof RuleList> = {
  overrides?: {
    rules?: RulesRecord<K>;
  };
  extends?: {
    rules?: RuleOptions;
  };
};

export type OptionsConfig = {
  /**
   * Automatic configures ignores based on `.gitignore`.
   *
   * @see https://github.com/antfu/eslint-config-flat-gitignore
   * @default true
   */
  gitignore?: boolean | FlatGitignoreOptions;
  /**
   * Custom ignores.
   */
  ignores?: Linter.Config['ignores'];
  /**
   * Base configuration options.
   */
  base?: OptionsOverrides<'yunarch/base/rules'> & {
    overrides?: {
      languageOptions?: Linter.LanguageOptions;
      linterOptions?: Linter.LinterOptions;
    };
  };
  // /**
  //  * Enable TypeScript support.
  //  */
  // typescript?: boolean;
  /**
   * Enable `eslint-plugin-import` rules.
   *
   * @default true
   */
  imports?: boolean | OptionsOverrides<'yunarch/unicorn/rules'>;
  /**
   * Enable `eslint-plugin-jsdoc` rules.
   *
   * @default true
   */
  jsdoc?: boolean | OptionsOverrides<'yunarch/jsdoc/rules'>;
  /**
   * Enable `eslint-plugin-unicorn` rules.
   *
   * @default true
   */
  unicorn?: boolean | OptionsOverrides<'yunarch/import/rules'>;
  /**
   * Whether oxlint is enabled, so it will disable the rules that oxlint handles.
   * It will try to auto-detect if oxlint.json exists.
   */
  oxlint?: boolean;
};
