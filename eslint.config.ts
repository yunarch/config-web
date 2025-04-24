import { config } from './src/configs/linters/eslint.config';

export default config({
  ignores: ['./tests/**/fixtures'],
  typescript: {
    tsconfigPath: './tsconfig.json',
  },
  test: {
    enableTypeTesting: true,
  },
});
