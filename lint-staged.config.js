/**
 * @type {import('lint-staged').Configuration}
 */
export default {
  '*.{js,jsx,ts,tsx}': ['bun run format:all', () => 'bun run lint'],
  '!(*.{js,jsx,ts,tsx})': ['bun run format:all'],
};
