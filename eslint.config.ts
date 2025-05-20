import { config } from './src/linters/eslint.config';

export default config({
  ignores: ['./tests/**/fixtures'],
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
