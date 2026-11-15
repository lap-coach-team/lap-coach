import { describe, expect, it } from 'vitest';
import { compareWithReference } from './accuracy';
import type { Lap } from './model';

/** Штучне коло: для порівняння з хронометражем важливий лише час. */
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

describe('compareWithReference', () => {
  it('рахує середню і максимальну абсолютну похибку', () => {
    const laps = [makeLap(1, 40.0), makeLap(2, 41.0)];

    const result = compareWithReference(laps, [40.1, 40.9]);

    expect(result.meanErrorS).toBeCloseTo(0.1, 6);
    expect(result.maxErrorS).toBeCloseTo(0.1, 6);
    expect(result.laps).toBe(2);
  });

  it('порівнює мінімум із двох довжин', () => {
    const laps = [makeLap(1, 40.0), makeLap(2, 41.0), makeLap(3, 99.0)];

    const result = compareWithReference(laps, [40.2, 41.0]);

    expect(result.laps).toBe(2);
    expect(result.meanErrorS).toBeCloseTo(0.1, 6);
    expect(result.maxErrorS).toBeCloseTo(0.2, 6);
  });

  it('без жодної пари повертає NaN, а не нуль', () => {
    const result = compareWithReference([], [40.0]);

    expect(result.laps).toBe(0);
    expect(result.meanErrorS).toBeNaN();
    expect(result.maxErrorS).toBeNaN();
  });
});
