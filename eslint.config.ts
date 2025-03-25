import { factoryEslintConfig } from './src/linters/eslint.config';

export default factoryEslintConfig({
  typescript: {
    tsconfigPath: './tsconfig.json',
  },
});
