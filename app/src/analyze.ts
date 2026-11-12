import type { GpxFile, Report } from './model';

/**
 * Увесь ланцюжок: parseGpx → buildSession → splitLaps → filterLaps →
 * analyzeCorners → sortByLoss → buildAdvice (+ compareWithReference, якщо є офіційні часи).
 *
 * Jira: «Екран розбору заїзду», підзадача «analyzeSession».
 */
export function analyzeSession(
  _files: GpxFile[],
  _trackJson: unknown,
  _referenceLapTimes?: number[],
): Report {
  throw new Error('not implemented: analyzeSession');
}
