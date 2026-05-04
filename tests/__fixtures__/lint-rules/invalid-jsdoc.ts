export function missingJsdoc(a: number, b: number) {
  return a + b;
}

/**
 * Add two numbers.
 * @param a - first parameter to check.
 * @param b - second parameter to check.
 * @returns The sum of a and b.
 */
export function missingJsdocLineAfterDescription(a: number, b: number) {
  return a + b;
}

/**
 * Add two numbers.
 *
 * @param a - first parameter to check.
 * @returns The sum of a and b.
 */
export function missingJsdocParam(a: number, b: number) {
  return a + b;
}

/**
 * Add two numbers.
 *
 * @param a - first parameter to check.
 * @param b - second parameter to check.
 */
export function missingJsdocReturn(a: number, b: number) {
  return a + b;
}
