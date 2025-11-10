import { config } from './src/config.eslint';

export default config({
  ignores: ['./tests/__mocks__', './tests/__fixtures__'],
  typescript: {
    tsconfigPath: './tsconfig.json',
  },
  react: true,
  test: {
    enableTypeTesting: true,
  },
  oxlint: {
    oxlintConfigPath: './.oxlintrc.json',
  },
});
