/**
 * @type {import('lint-staged').Configuration}
 */
export default {
  '*': (stagedFiles) => [
    'bun run gen',
    `oxlint ${stagedFiles.join(' ')}`,
    `eslint ${stagedFiles.join(' ')}`,
    `oxfmt --write ${stagedFiles.join(' ')} ./src/cli/__docs__/`,
  ],
};
