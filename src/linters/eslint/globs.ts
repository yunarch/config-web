export const GLOB_SRC =
  '**/*.{js,jsx,cjs,cjsx,mjs,mjsx,ts,tsx,cts,ctsx,mts,mtjsx}';
export const GLOB_SRC_EXT =
  '{js,jsx,cjs,cjsx,mjs,mjsx,ts,tsx,cts,ctsx,mts,mtjsx}';

export const GLOB_DTS = '**/*.d.{ts,cts,mts}';
export const GLOB_TS = '**/*.{ts,cts,mts}';
export const GLOB_TSX = '**/*.{tsx,ctsx,mtsx}';
export const GLOB_ASTRO_TS = '**/*.astro/*.ts';
export const GLOB_MARKDOWN = '**/*.md';

export const GLOB_TESTS = [
  `**/__tests__/**/*.${GLOB_SRC_EXT}`,
  `**/*.spec.${GLOB_SRC_EXT}`,
  `**/*.test.${GLOB_SRC_EXT}`,
  `**/*.bench.${GLOB_SRC_EXT}`,
  `**/*.benchmark.${GLOB_SRC_EXT}`,
];
