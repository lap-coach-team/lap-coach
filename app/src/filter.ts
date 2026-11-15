import type { CornerResult, Lap } from './model';

/** Довше за 1,3 × медіана — трафік, розворот, зупинка. */
const MAX_RATIO = 1.3;
/** Коротше за 0,7 × медіана — помилка GPS. */
const MIN_RATIO = 0.7;

/** Медіана числового масиву. Вхідний масив не змінює. */
function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

/**
 * Позначає невалідні кола і одне найкраще.
 *
 * - Медіану рахуємо за часом усіх кіл.
 * - Коло невалідне, якщо його час більший за 1,3 × медіана або менший за 0,7 × медіана.
 * - Найкраще коло — валідне з найменшим часом; при рівних часах — перше.
 *
 * Повертає нові об'єкти кіл, вхідні не змінює.
 */
export function filterLaps(laps: Lap[]): Lap[] {
  if (laps.length === 0) return [];

  const med = median(laps.map((lap) => lap.time));
  const result = laps.map((lap) => ({
    ...lap,
    valid: lap.time <= MAX_RATIO * med && lap.time >= MIN_RATIO * med,
    isBest: false,
  }));

  let best: Lap | undefined;
  for (const lap of result) {
    if (lap.valid && (best === undefined || lap.time < best.time)) {
      best = lap;
    }
  }
  if (best !== undefined) best.isBest = true;

  return result;
}

/**
 * Сортує повороти за середньою втратою часу: найбільша втрата першою.
 * Від'ємна втрата опиняється в кінці. При рівних значеннях зберігається
 * порядок із входу (стабільне сортування). Повертає нову копію масиву.
 */
export function sortByLoss(corners: CornerResult[]): CornerResult[] {
  return [...corners].sort((a, b) => b.avgLoss - a.avgLoss);
}
