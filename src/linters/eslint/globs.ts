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
