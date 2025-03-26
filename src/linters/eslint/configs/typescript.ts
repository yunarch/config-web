import { GLOB_ASTRO_TS, GLOB_MARKDOWN, GLOB_TS, GLOB_TSX } from '../globs';
import { pluginTsEslint } from '../plugins';
import type { OptionsConfig, TypedFlatConfigItem } from '../types';

/**
 * Typescript eslint configuration.
 *
 * @param options - Configuration options.
 * @param extraFileExtensions - Additional file extensions to lint.
 * @returns An array of ESLint configurations.
 */
export function typescript(
  options: Exclude<NonNullable<OptionsConfig['typescript']>, boolean>,
  extraFileExtensions: OptionsConfig['extraFileExtensions'] = []
): TypedFlatConfigItem[] {
  const hasTypeAware = !!options.tsconfigPath && !options.disableTypeAware;
  const filesGlob = [GLOB_TS, GLOB_TSX];
  const filesTypeAwareGlob = options.filesTypeAware ?? [GLOB_TS, GLOB_TSX];
  const ignoresTypeAwareGlob = options.ignoresTypeAware ?? [
    `${GLOB_MARKDOWN}/**`,
    GLOB_ASTRO_TS,
  ];
  return [
    {
      name: 'yunarch/typescript/setup',
      plugins: {
        '@typescript-eslint': pluginTsEslint.plugin,
      },
    },
    makeParserConfig('yunarch/typescript/parser', filesGlob, {
      ignores: undefined,
      extraFileExtensions,
      parserOptions: options.parserOptions,
    }),
    ...(hasTypeAware
      ? [
          makeParserConfig(
            'yunarch/typescript/parser/type-aware',
            filesTypeAwareGlob,
            {
              ignores: ignoresTypeAwareGlob,
              extraFileExtensions,
              parserOptions: options.parserOptions,
              tsconfigPath: options.tsconfigPath,
            }
          ),
        ]
      : []),
    {
      name: 'yunarch/typescript/rules',
      files: filesGlob,
      rules: {
        ...pluginTsEslint.configs.strict.at(-1)?.rules,
        ...pluginTsEslint.configs.stylistic.at(-1)?.rules,
        '@typescript-eslint/ban-ts-comment': [
          'error',
          { 'ts-expect-error': 'allow-with-description' },
        ],
        '@typescript-eslint/consistent-type-definitions': 'off',
        '@typescript-eslint/consistent-type-imports': [
          'error',
          {
            disallowTypeAnnotations: false,
            fixStyle: 'separate-type-imports',
            prefer: 'type-imports',
          },
        ],
        '@typescript-eslint/default-param-last': 'error',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/method-signature-style': ['error', 'property'], // https://www.totaltypescript.com/method-shorthand-syntax-considered-harmful
        '@typescript-eslint/naming-convention': [
          'error',
          // Anything type-like should be written in PascalCase.
          {
            format: ['PascalCase'],
            selector: ['typeLike'],
          },
          // Enum values should be written in upper snake case
          {
            format: ['UPPER_CASE'],
            selector: ['enumMember'],
          },
          // Interfaces cannot be prefixed with `I`, or have restricted names.
          {
            custom: {
              match: false,
              regex: '^I[A-Z]|^(Interface|Props|State)$',
            },
            format: ['PascalCase'],
            selector: 'interface',
          },
        ],
        '@typescript-eslint/no-dupe-class-members': 'error',
        '@typescript-eslint/no-empty-object-type': [
          'error',
          { allowInterfaces: 'always' },
        ],
        '@typescript-eslint/no-import-type-side-effects': 'error',
        '@typescript-eslint/no-loop-func': 'error',
        '@typescript-eslint/no-redeclare': ['error', { builtinGlobals: false }],
        '@typescript-eslint/no-shadow': 'error',
        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            args: 'after-used',
            argsIgnorePattern: '^_',
            ignoreRestSiblings: false,
            vars: 'all',
            varsIgnorePattern: '^_',
          },
        ],
        '@typescript-eslint/no-use-before-define': [
          'error',
          { classes: false, functions: false, variables: true },
        ],
        '@typescript-eslint/no-useless-empty-export': 'warn',
        '@typescript-eslint/unified-signatures': [
          'error',
          {
            ignoreDifferentlyNamedParameters: true,
            ignoreOverloadsWithDifferentJSDoc: true,
          },
        ],
      },
    },
    ...(hasTypeAware
      ? ([
          {
            name: 'yunarch/typescript/rules/type-aware',
            files: filesTypeAwareGlob,
            ignores: ignoresTypeAwareGlob,
            rules: {
              ...pluginTsEslint.configs.strictTypeCheckedOnly.at(-1)?.rules,
              ...pluginTsEslint.configs.stylisticTypeCheckedOnly.at(-1)?.rules,
              '@typescript-eslint/no-misused-promises': [
                'error',
                { checksVoidReturn: { attributes: false } },
              ],
              '@typescript-eslint/require-array-sort-compare': [
                'error',
                { ignoreStringArrays: true },
              ],
              '@typescript-eslint/switch-exhaustiveness-check': 'warn',
            },
          },
        ] as TypedFlatConfigItem[])
      : []),
  ];
}

/**
 * Make a parser configuration.
 *
 * @param name - The name of the parser configuration.
 * @param files - The files that this parser configuration should apply to.
 * @param options - The parser configuration options.
 * @returns A parser configuration.
 */
function makeParserConfig(
  name: string,
  files: string[],
  options: {
    ignores: string[] | undefined;
    extraFileExtensions: OptionsConfig['extraFileExtensions'];
    parserOptions: Exclude<
      NonNullable<OptionsConfig['typescript']>,
      boolean
    >['parserOptions'];
    tsconfigPath?: string | string[];
  }
): TypedFlatConfigItem {
  return {
    name,
    files,
    ...(options.ignores ? { ignores: options.ignores } : {}),
    languageOptions: {
      parser: pluginTsEslint.parser as never,
      parserOptions: {
        extraFileExtensions: options.extraFileExtensions?.map(
          (extension) => `.${extension}`
        ),
        sourceType: 'module',
        ...(options.tsconfigPath
          ? {
              projectService: {
                allowDefaultProject: ['./*.js'],
                defaultProject: options.tsconfigPath,
              },
              tsconfigRootDir: process.cwd(),
            }
          : {}),
        ...options.parserOptions,
      },
    },
  };
}
