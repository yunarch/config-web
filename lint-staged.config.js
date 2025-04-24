/**
 * @type {import('lint-staged').Configuration}
 */
export default {
  '*': [() => 'bun run format:all', () => 'bun run lint'],
};
