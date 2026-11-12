import type { Accuracy, Lap } from './model';

/**
 * Порівнює час кіл з офіційним хронометражем (AMB) за порядком кіл.
 *
 * Jira: «Інтеграційні тести і тест точності проти AMB».
 */
export function compareWithReference(_laps: Lap[], _reference: number[]): Accuracy {
  throw new Error('not implemented: compareWithReference');
}
