/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
export const config = {
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  arrowParens: 'always',
  trailingComma: 'es5',
  bracketSpacing: true,
  bracketSameLine: false,
  proseWrap: 'preserve',
  endOfLine: 'lf',
  quoteProps: 'as-needed',
  singleAttributePerLine: false,
  requirePragma: false,
  insertPragma: false,
  jsxSingleQuote: false,
  htmlWhitespaceSensitivity: 'css',
  embeddedLanguageFormatting: 'auto',
  overrides: [
    {
      files: '**/*.jsonc',
      options: {
        trailingComma: 'none',
      },
    },
    // Use a html parse for handlebars files
    {
      files: '**/*.hbs',
      options: {
        parser: 'html',
      },
    },
    // formatting the package.json with anything other than spaces will cause issues when running install.
    {
      files: ['**/package.json'],
      options: {
        useTabs: false,
      },
    },
    {
      files: ['**/*.mdx'],
      options: {
        // This stinks, if you don't do this, then an inline component on the
        // end of the line will end up wrapping, then the next save Prettier
        // will add an extra line break. Super annoying and probably a bug in
        // Prettier, but until it's fixed, this is the best we can do.
        proseWrap: 'preserve',
        htmlWhitespaceSensitivity: 'ignore',
      },
    },
  ],
};

export default config;
