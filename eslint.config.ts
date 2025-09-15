import { config } from './src/config.eslint';

export default config({
  ignores: ['./tests/__mocks__'],
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
