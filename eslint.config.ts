import { config } from './src/linters/config.eslint';

export default config({
  ignores: ['./tests/__mocks__', './tests/__fixtures__'],
  typescript: {
    tsconfigPath: './tsconfig.json',
  },
  test: {
    enableTypeTesting: true,
  },
  oxlint: {
    oxlintConfigPath: './.oxlintrc.json',
  },
});
