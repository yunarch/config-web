import { config } from './src/linters/eslint.config';

export default config({
  typescript: {
    tsconfigPath: './tsconfig.json',
  },
});
