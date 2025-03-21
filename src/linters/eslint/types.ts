import type { Linter } from 'eslint';
import type { RuleList, RuleOptions } from './typegen';
import type { FlatGitignoreOptions } from 'eslint-config-flat-gitignore';

export type Awaitable<T> = T | Promise<T>;

export type Rules = RuleOptions;

export type ConfigNames = keyof RuleList;

export type RuleListRecord<K extends ConfigNames> = RuleList[K];

export type TypedFlatConfigItem = Omit<
  Linter.Config<Linter.RulesRecord & Rules>,
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

export type OptionsOverrides<K extends ConfigNames> = {
  /**
   * Overrides the rules used in the specified configuration.
   */
  overrides?: RuleListRecord<K>;
  /**
   * Adds additional rules to the specified configuration.
   */
  extends?: TypedFlatConfigItem['rules'];
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
    /**
     * Extends the default base linter options.
     */
    linterOptions?: Linter.LinterOptions;
  };
  /**
   * Enable TypeScript support.
   */
  typescript?: boolean;
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
   * Whether oxlint is enabled and therefore eslint rules that are covered by oxlint should be disabled.
   *
   * @default undefined
   */
  oxlint?: {
    /**
     * The path to the oxlint configuration file (e.g. `./.oxlintrc.json`) to read and disable the rules that covers.
     */
    oxlintConfigPath: string;
  };
};
