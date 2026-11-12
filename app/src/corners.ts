import type { CornerResult, Lap, TrackConfig } from './model';

/**
 * Для кожного повороту рахує час, мінімальну швидкість, точку гальмування
 * і втрату проти найкращого кола. Порядок — як у track.corners.
 *
 * Jira: «Аналіз поворотів: analyzeCorners».
 */
export function analyzeCorners(_laps: Lap[], _track: TrackConfig): CornerResult[] {
  throw new Error('not implemented: analyzeCorners');
}
