import { config } from './src/configs/linters/eslint.config';

export default config({
  typescript: {
    tsconfigPath: './tsconfig.json',
  },
  test: {
    enableTypeTesting: true,
  },
});
