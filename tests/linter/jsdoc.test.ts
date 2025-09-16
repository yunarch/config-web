import { describe } from 'vitest';
import { lintFile } from '../lint-utils';

describe('jsdoc linter tests', () => {
  lintFile('valid-jsdoc.ts', {
    title: 'should pass with correct JSDoc comments',
    expectedRulesIds: { eslint: [], oxlint: [] },
  });

  lintFile('invalid-jsdoc.ts', {
    title: 'should report invalid JSDoc comments',
    expectedRulesIds: {
      eslint: [
        'jsdoc/require-jsdoc',
        'jsdoc/tag-lines',
        'jsdoc/require-param',
        'jsdoc/require-returns',
      ],
      oxlint: [
        'eslint-plugin-jsdoc(require-param)',
        'eslint-plugin-jsdoc(require-returns)',
      ],
    },
  });
});
