import type { ParserOptions } from '@typescript-eslint/parser';
import type { Linter } from 'eslint';
import type { FlatGitignoreOptions } from 'eslint-config-flat-gitignore';
import type { RuleOptions } from './typegen';

export type { ConfigNames } from './typegen';

export type Awaitable<T> = T | Promise<T>;

export interface Rules extends RuleOptions {}

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Any is required for compatibility.
  plugins?: Record<string, any>;
};

export interface OptionsConfig {
  /**
   * Automatic configures ignores based on `.gitignore`.
   *
   * @see https://github.com/antfu/eslint-config-flat-gitignore
   * @default true
   */
  gitignore?: boolean | FlatGitignoreOptions;
  /**
   * Custom ignores. It extends the default ignores.
   */
  ignores?: Linter.Config['ignores'];
  /**
   * Additional extensions for components.
   *
   * @example ['vue']
   */
  extraFileExtensions?: string[];
  /**
   * Base configuration options.
   */
  base?: {
    /**
     * Extends the default base linter options.
     */
    linterOptions?: Linter.LinterOptions;
  };
  /**
   * Enable TypeScript support.
   *
   * @default false
   */
  typescript?:
    | boolean
    | {
        /**
         * Path to the `tsconfig.json` file/s.
         * It will enable type-aware linting unless `disableTypeAware` is `true`.
         */
        tsconfigPath?: string | string[];
        /**
         * Additional parser options for TypeScript.
         */
        parserOptions?: Partial<ParserOptions>;
        /**
         * Whether to disable type-aware rules.
         */
        disableTypeAware?: boolean;
        /**
         * Glob patterns for files that should be type aware.
         * By default it includes any typescript file.
         *
         * Only used when `typeAware` is `true`.
         */
        filesTypeAware?: string[];
        /**
         * Glob patterns for files that should not be type aware.
         * By default it includes any markdown and astro typescript files.
         */
        ignoresTypeAware?: string[];
      };
  /**
   * Enable `eslint-plugin-import` rules.
   *
   * @default true
   */
  import?: boolean;
  /**
   * Enable `eslint-plugin-jsdoc` rules.
   *
   * @default true
   */
  jsdoc?: boolean;
  /**
   * Enable `eslint-plugin-unicorn` rules.
   *
   * @default true
   */
  unicorn?: boolean;
  /**
   * Enable react rules.
   *
   * @default false
   */
  react?: boolean;
  /**
   * Enable vitest (`@vitest/eslint-plugin`) support rules.
   *
   * @default false
   */
  test?:
    | boolean
    | {
        /**
         * Enables vitest type testing feature.
         *
         * @see https://vitest.dev/guide/testing-types
         * @default false
         */
        enableTypeTesting?: boolean;
      };
  /**
   * Enable tanstack plugins rules.
   * If `true`, it will enable all tanstack eslint plugins, otherwise you can specify which ones to enable.
   *
   * @default false
   */
  tanstack?:
    | boolean
    | {
        /**
         * Enable `@tanstack/eslint-plugin-query` plugin and its recommended rules.
         *
         * @default false
         */
        enableQuery?: boolean;
        /**
         * Enable `@tanstack/eslint-plugin-router` plugin and its recommended rules.
         *
         * @default false
         */
        enableRouter?: boolean;
      };
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
}

export type UserConfig = Awaitable<
  TypedFlatConfigItem | TypedFlatConfigItem[] | Linter.Config[]
>;
