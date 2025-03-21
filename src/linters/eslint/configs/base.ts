import globals from 'globals';
import eslint from '@eslint/js';
import type { OptionsConfig, TypedFlatConfigItem } from '../types';
import { getRulesFromOptionsOverrides } from '../utils';

/**
 * Base ESLint configuration.
 *
 * @param options - Configuration options.
 * @param ignores - Custom ignores.
 * @param hasOtherLintersEnabled - Whether other linters are enabled.
 * @returns An array of ESLint configurations.
 */
export function base(
  options: OptionsConfig['base'] = {},
  ignores?: OptionsConfig['ignores'],
  hasOtherLintersEnabled?: boolean
): TypedFlatConfigItem[] {
  const languageOptions = options.languageOptions ?? {};
  const linterOptions = options.linterOptions ?? {};
  return [
    {
      name: 'yunarch/base/ignores',
      ignores: [
        // Node modules
        '**/node_modules/',
        // Build artifacts
        '**/dist/',
        '**/out/',
        '**/output',
        '**/.output',
        '**/build/',
        '**/*.min.*',
        // Dependencies
        '**/.yarn/',
        '**/.yarnrc.yml',
        '**/package-lock.json',
        '**/yarn.lock',
        '**/bun.lock',
        '**/bun.lockb',
        '**/pnpm-lock.yaml',
        '**/.vite-inspect',
        '**/.vitepress/cache',
        '**/vite.config.*.timestamp-*',
        // Logs
        '**/*.log',
        '**/npm-debug.log*',
        '**/yarn-debug.log*',
        '**/yarn-error.log*',
        '.pnp.*',
        '**/.pnp',
        '**/.pnp.js',
        '**/.pnp.cjs',
        // Tests
        '**/coverage/',
        '**/.nyc_output/',
        '**/__snapshots__',
        // Editor/IDE/frameworks/tools configurations
        '**/.vscode/',
        '**/.idea/',
        '**/.cache',
        '**/.nuxt',
        '**/.next',
        '**/.svelte-kit',
        '**/.vercel',
        '**/.changeset',
        '**/.turbo/',
        // Misc
        '**/.DS_Store',
        '**/Thumbs.db',
        '**/temp',
        '**/.temp',
        '**/tmp',
        '**/.tmp',
        '**/.history',
        '**/mockServiceWorker.js',
        '**/CHANGELOG*.md',
        '**/LICENSE*',
        ...(ignores ?? []),
      ],
    },
    {
      name: 'yunarch/base/setup',
      languageOptions: {
        ecmaVersion: languageOptions.ecmaVersion ?? 2022,
        globals: {
          ...globals.browser,
          ...globals.es2021,
          ...globals.node,
          document: 'readonly',
          navigator: 'readonly',
          window: 'readonly',
          ...languageOptions.globals,
        },
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
            ...languageOptions.parserOptions?.ecmaFeatures,
          },
          ecmaVersion: languageOptions.parserOptions?.ecmaVersion ?? 2022,
          sourceType: languageOptions.parserOptions?.sourceType ?? 'module',
        },
        sourceType: languageOptions.sourceType ?? 'module',
      },
      linterOptions: {
        ...linterOptions,
        reportUnusedDisableDirectives: hasOtherLintersEnabled
          ? false
          : (linterOptions.reportUnusedDisableDirectives ?? true),
      },
    },
    {
      name: 'yunarch/base/rules',
      rules: {
        ...eslint.configs.recommended.rules,
        'array-callback-return': ['error', { allowImplicit: true }],
        'block-scoped-var': 'error',
        curly: ['error', 'multi-line', 'consistent'],
        'default-case-last': 'error',
        eqeqeq: 'error',
        'max-lines': ['warn', 300],
        'max-params': ['warn', 4],
        'grouped-accessor-pairs': 'error',
        'no-alert': 'error',
        'no-caller': 'error',
        'no-constructor-return': 'error',
        'no-else-return': 'warn',
        'no-eval': 'error',
        'no-implied-eval': 'error',
        'no-extend-native': 'error',
        'no-extra-bind': 'error',
        'no-floating-decimal': 'error',
        'no-implicit-coercion': ['error', { allow: ['!!', '+'] }],
        'no-iterator': 'error',
        'no-labels': 'error',
        'no-extra-label': 'error',
        'no-lone-blocks': 'error',
        'no-new': 'error',
        'no-new-func': 'error',
        'no-new-wrappers': 'error',
        'no-octal-escape': 'error',
        'no-param-reassign': 'error',
        'no-proto': 'error',
        'no-return-assign': 'error',
        'no-script-url': 'error',
        'no-self-compare': 'error',
        'no-sequences': 'error',
        'no-useless-call': 'error',
        'no-useless-concat': 'error',
        'no-useless-return': 'warn',
        'no-unused-expressions': 'error',
        'no-void': ['error', { allowAsStatement: true }],
        'prefer-named-capture-group': 'error',
        'prefer-promise-reject-errors': ['error', { allowEmptyReject: true }],
        'prefer-regex-literals': 'error',
        yoda: 'warn',
        'no-useless-computed-key': 'warn',
        'no-useless-rename': 'warn',
        'no-var': 'error',
        'object-shorthand': 'warn',
        'prefer-const': 'warn',
        'prefer-numeric-literals': 'error',
        'prefer-rest-params': 'error',
        'prefer-object-has-own': 'error',
        'prefer-spread': 'error',
        'prefer-template': 'warn',
        'symbol-description': 'error',
        'no-console': 'error',
        'no-constant-binary-expression': 'error',
        'no-promise-executor-return': 'error',
        'no-template-curly-in-string': 'error',
        'no-unreachable-loop': 'error',
        camelcase: [
          'error',
          {
            allow: ['^UNSAFE_'],
            ignoreDestructuring: false,
            properties: 'never',
          },
        ],
        'func-names': ['error', 'as-needed'],
        'new-cap': ['error', { capIsNew: false }],
        'new-parens': 'warn',
        'no-array-constructor': 'error',
        'no-bitwise': 'error',
        'no-lonely-if': 'warn',
        'no-multi-assign': 'error',
        'no-nested-ternary': 'error',
        'no-unneeded-ternary': 'error',
        'prefer-object-spread': 'warn',
        'no-label-var': 'error',
        'no-undef-init': 'warn',
        'no-unused-vars': [
          'error',
          {
            args: 'after-used',
            argsIgnorePattern: '^_',
            ignoreRestSiblings: false,
            vars: 'all',
            varsIgnorePattern: '^_',
          },
        ],
        // Overrides
        ...getRulesFromOptionsOverrides(options),
      },
    },
  ];
}
