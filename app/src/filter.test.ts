import { describe, expect, it } from 'vitest';
import { filterLaps, sortByLoss } from './filter';
import type { CornerResult, Lap } from './model';

/** Штучне коло: лише номер і час мають значення для фільтра. */
function makeLap(number: number, time: number): Lap {
  return {
    number,
    startT: 0,
    endT: time,
    time,
    points: [],
    valid: true,
    isBest: false,
  };
}

/** Штучний поворот: лише avgLoss має значення для сортування. */
function makeCorner(cornerId: string, avgLoss: number): CornerResult {
  return {
    cornerId,
    direction: 'L',
    bestLapTime: 5,
    avgTime: 5 + avgLoss,
    avgLoss,
    bestMinSpeedKmh: 40,
    avgMinSpeedKmh: 38,
    bestBrakeBeforeApexM: 20,
    avgBrakeBeforeApexM: 18,
  };
}

describe('filterLaps', () => {
  it('коло в 2 рази довше за медіану — невалідне', () => {
    // Медіана 42,5 с; 84 с — це понад 1,3 × медіана.
    const laps = [
      makeLap(1, 42),
      makeLap(2, 43),
      makeLap(3, 41.5),
      makeLap(4, 42.5),
      makeLap(5, 84),
    ];

    const result = filterLaps(laps);

    expect(result[4].valid).toBe(false);
    expect(result.slice(0, 4).every((lap) => lap.valid)).toBe(true);
  });

  it('найкраще — найшвидше серед валідних, а не найкоротше невалідне', () => {
    // Медіана 42 с; 20 с менше за 0,7 × медіана (помилка GPS), тому невалідне.
    const laps = [
      makeLap(1, 42),
      makeLap(2, 43),
      makeLap(3, 41.5),
      makeLap(4, 20),
      makeLap(5, 42.5),
    ];

    const result = filterLaps(laps);

    expect(result[3].valid).toBe(false);
    expect(result[3].isBest).toBe(false);
    expect(result[2].isBest).toBe(true);
    expect(result.filter((lap) => lap.isBest)).toHaveLength(1);
  });

  it('одне коло — валідне і найкраще', () => {
    const result = filterLaps([makeLap(1, 42)]);

    expect(result).toHaveLength(1);
    expect(result[0].valid).toBe(true);
    expect(result[0].isBest).toBe(true);
  });

  it('повертає нові об\'єкти і не змінює вхідні кола', () => {
    const laps = [makeLap(1, 42), makeLap(2, 84), makeLap(3, 41)];

    const result = filterLaps(laps);

    expect(result[0]).not.toBe(laps[0]);
    expect(laps.every((lap) => lap.valid && !lap.isBest)).toBe(true);
  });
});

describe('sortByLoss', () => {
  it('від більшої втрати до меншої, від\'ємна втрата в кінці', () => {
    const corners = [
      makeCorner('T1', 0.1),
      makeCorner('T2', 0.5),
      makeCorner('T3', -0.2),
      makeCorner('T4', 0.3),
    ];

    const result = sortByLoss(corners);

    expect(result.map((c) => c.cornerId)).toEqual(['T2', 'T4', 'T1', 'T3']);
  });

  it('вхідний масив не змінюється', () => {
    const corners = [
      makeCorner('T1', 0.1),
      makeCorner('T2', 0.5),
      makeCorner('T3', -0.2),
    ];
    const idsBefore = corners.map((c) => c.cornerId);

    const result = sortByLoss(corners);

    expect(result).not.toBe(corners);
    expect(corners.map((c) => c.cornerId)).toEqual(idsBefore);
  });

  it('при рівних втратах зберігає порядок із входу', () => {
    const corners = [
      makeCorner('T1', 0.3),
      makeCorner('T2', 0.3),
      makeCorner('T3', 0.3),
    ];

    const result = sortByLoss(corners);

    expect(result.map((c) => c.cornerId)).toEqual(['T1', 'T2', 'T3']);
  });
});
