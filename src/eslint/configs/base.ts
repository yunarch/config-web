import globals from 'globals';
import { pluginESlint, pluginUnusedImports } from '../plugins';
import type { OptionsConfig, TypedFlatConfigItem } from '../types';

export const BASE_IGNORES = [
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
  '**/package-lock.json',
  '**/yarn.lock',
  '**/.yarn/',
  '**/.yarnrc.yml',
  '**/.pnp.*',
  '**/.pnp',
  '**/.pnp.js',
  '**/.pnp.cjs',
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
  '**/CHANGELOG*',
  '**/LICENSE*',
];

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
  const linterOptions = options.linterOptions ?? {};
  return [
    {
      name: 'yunarch/base/ignores',
      ignores: [...BASE_IGNORES, ...(ignores ?? [])],
    },
    {
      name: 'yunarch/base/setup',
      languageOptions: {
        ecmaVersion: 2022,
        globals: {
          ...globals.browser,
          ...globals.es2021,
          ...globals.node,
          document: 'readonly',
          navigator: 'readonly',
          window: 'readonly',
        },
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
          ecmaVersion: 2022,
          sourceType: 'module',
        },
        sourceType: 'module',
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
      plugins: {
        'unused-imports': pluginUnusedImports,
      },
      rules: {
        ...pluginESlint.configs.recommended.rules,
        'array-callback-return': ['error', { allowImplicit: true }],
        'block-scoped-var': 'error',
        camelcase: [
          'error',
          {
            allow: ['^UNSAFE_'],
            ignoreDestructuring: false,
            properties: 'never',
          },
        ],
        curly: ['error', 'multi-line', 'consistent'],
        'default-case-last': 'error',
        eqeqeq: 'error',
        'func-names': ['error', 'as-needed'],
        'grouped-accessor-pairs': 'error',
        'max-lines': ['warn', 300],
        'max-params': ['warn', 4],
        'new-cap': ['error', { capIsNew: false }],
        'no-alert': 'error',
        /** @deprecated */
        // 'new-parens': 'warn',
        'no-array-constructor': 'error',
        'no-bitwise': 'error',
        'no-caller': 'error',
        'no-console': 'error',
        'no-constant-binary-expression': 'error',
        'no-constructor-return': 'error',
        'no-else-return': 'warn',
        'no-eval': 'error',
        'no-extend-native': 'error',
        'no-extra-bind': 'error',
        'no-extra-label': 'error',
        /** @deprecated */
        // 'no-floating-decimal': 'error',
        'no-implicit-coercion': ['error', { allow: ['!!', '+'] }],
        'no-implied-eval': 'error',
        'no-iterator': 'error',
        'no-label-var': 'error',
        'no-labels': 'error',
        'no-lone-blocks': 'error',
        'no-lonely-if': 'warn',
        'no-multi-assign': 'error',
        'no-nested-ternary': 'error',
        'no-new': 'error',
        'no-new-func': 'error',
        'no-new-wrappers': 'error',
        'no-octal-escape': 'error',
        'no-param-reassign': 'error',
        'no-promise-executor-return': 'error',
        'no-proto': 'error',
        'no-return-assign': 'error',
        'no-script-url': 'error',
        'no-self-compare': 'error',
        'no-sequences': 'error',
        'no-template-curly-in-string': 'error',
        'no-undef-init': 'warn',
        'no-unneeded-ternary': 'error',
        'no-unreachable-loop': 'error',
        'no-unused-expressions': 'error',
        'no-unused-vars': [
          'error',
          {
            args: 'none',
            caughtErrors: 'none',
            ignoreRestSiblings: true,
            vars: 'all',
          },
        ],
        'no-useless-call': 'error',
        'no-useless-computed-key': 'warn',
        'no-useless-concat': 'error',
        'no-useless-rename': 'warn',
        'no-useless-return': 'warn',
        'no-var': 'error',
        'no-void': ['error', { allowAsStatement: true }],
        'object-shorthand': 'warn',
        'prefer-const': 'warn',
        'prefer-named-capture-group': 'error',
        'prefer-numeric-literals': 'error',
        'prefer-object-has-own': 'error',
        'prefer-object-spread': 'warn',
        'prefer-promise-reject-errors': ['error', { allowEmptyReject: true }],
        'prefer-regex-literals': 'error',
        'prefer-rest-params': 'error',
        'prefer-spread': 'error',
        'prefer-template': 'warn',
        'symbol-description': 'error',
        'unused-imports/no-unused-imports': 'error',
        'unused-imports/no-unused-vars': [
          'error',
          {
            args: 'after-used',
            argsIgnorePattern: '^_',
            ignoreRestSiblings: true,
            vars: 'all',
            varsIgnorePattern: '^_',
          },
        ],
        yoda: 'warn',
      },
    },
  ];
}
