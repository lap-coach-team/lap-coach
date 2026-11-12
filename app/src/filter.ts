import type { CornerResult, Lap } from './model';

/**
 * Позначає невалідні кола (довші за 1,3 × медіану або коротші за 0,7 × медіану)
 * і найкраще коло серед валідних. Вхід не змінює.
 *
 * Jira: «Фільтр невалідних кіл і сортування втрат».
 */
export function filterLaps(_laps: Lap[]): Lap[] {
  throw new Error('not implemented: filterLaps');
}

/**
 * Сортує повороти за avgLoss від більшої втрати до меншої. Вхід не змінює.
 *
 * Jira: «Фільтр невалідних кіл і сортування втрат».
 */
export function sortByLoss(_corners: CornerResult[]): CornerResult[] {
  throw new Error('not implemented: sortByLoss');
}
