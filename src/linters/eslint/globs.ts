export const GLOB_SRC = '**/*.?([cm])[jt]s?(x)';
export const GLOB_SRC_EXT = '?([cm])[jt]s?(x)';

export const GLOB_DTS = '**/*.d.?([cm])ts';
export const GLOB_TS = '**/*.?([cm])ts';
export const GLOB_TSX = '**/*.?([cm])tsx';
export const GLOB_ASTRO_TS = '**/*.astro/*.ts';
export const GLOB_MARKDOWN = '**/*.md';

export const GLOB_TESTS = [
  `**/__tests__/**/*.${GLOB_SRC_EXT}`,
  `**/*.spec.${GLOB_SRC_EXT}`,
  `**/*.test.${GLOB_SRC_EXT}`,
  `**/*.bench.${GLOB_SRC_EXT}`,
  `**/*.benchmark.${GLOB_SRC_EXT}`,
];

/**
 * @param patterns - The patterns to expand.
 * @returns The expanded patterns or the original patterns if no expansion is needed.
 */
export function expandExtendedGlobs(patterns: string[]) {
  const expanded = [];
  for (const pattern of patterns) {
    if (pattern.endsWith('?([cm])[jt]s?(x)')) {
      expanded.push(
        pattern.replaceAll(
          '?([cm])[jt]s?(x)',
          '{js,jsx,cjs,cjsx,mjs,mjsx,ts,tsx,cts,ctsx,mts,mtjsx}'
        )
      );
    } else if (pattern.endsWith('?([cm])ts')) {
      expanded.push(pattern.replaceAll('?([cm])ts', '{ts,cts,mts}'));
    } else if (pattern.endsWith('?([cm])tsx')) {
      expanded.push(pattern.replaceAll('?([cm])tsx', '{tsx,ctsx,mtsx}'));
    } else {
      expanded.push(pattern);
    }
  }
  return expanded;
}
