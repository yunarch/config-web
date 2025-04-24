/**
 * @type {import('lint-staged').Configuration}
 */
export default {
  '*.{html,md,yaml,yml}': ['prettier --write'],
  '*': [() => 'bun run format:all', () => 'bun run lint'],
};
