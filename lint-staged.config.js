/**
 * @type {import('lint-staged').Configuration}
 */
export default {
  '*': (stagedFiles) => [
    `oxlint ${stagedFiles.join(' ')}`,
    `eslint ${stagedFiles.join(' ')}`,
    'bun run lint:ts',
    'bun run gen',
    `bun run format:all`,
  ],
};
