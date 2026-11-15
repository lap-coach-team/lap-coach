import { describe, it, expect } from 'vitest';
import { analyzeCorners } from './corners';
import type { Corner, Lap, TrackConfig, TrackPoint } from './model';

function trackWith(corner: Corner): TrackConfig {
  return {
    id: 'test-track',
    name: 'Test Track',
    lapLengthM: 100,
    startLine: { lat: 50.0, lon: 30.0, dirE: 0, dirN: 1, halfWidthM: 5 },
    corners: [corner],
  };
}

function lap(points: TrackPoint[], opts: Partial<Lap> = {}): Lap {
  const startT = points[0].t;
  const endT = points[points.length - 1].t;
  return {
    number: 1,
    startT,
    endT,
    time: endT - startT,
    points,
    valid: true,
    isBest: false,
    ...opts,
  };
}

/** Рух уздовж осі y з рівномірною швидкістю: точка кожні stepM метрів. */
function uniformPoints(speedMps: number, stepM: number, lengthM: number): TrackPoint[] {
  const points: TrackPoint[] = [];
  for (let y = 0; y <= lengthM; y += stepM) {
    points.push({ t: y / speedMps, x: 0, y, speedKmh: speedMps * 3.6 });
  }
  return points;
}

describe('analyzeCorners', () => {
  it('час у повороті рахується інтерполяцією: 10 м/с, поворот 20–50 м → 3,0 с', () => {
    // Крок 7 м: ні 20 м, ні 50 м не потрапляють на точку, тож без інтерполяції час був би іншим.
    const corner: Corner = { id: 'T1', direction: 'L', startM: 20, apexM: 35, endM: 50 };
    const laps = [lap(uniformPoints(10, 7, 100), { isBest: true })];

    const [result] = analyzeCorners(laps, trackWith(corner));

    expect(result.cornerId).toBe('T1');
    expect(result.direction).toBe('L');
    expect(result.bestLapTime).toBeCloseTo(3.0);
    expect(result.avgTime).toBeCloseTo(3.0);
    expect(result.avgLoss).toBeCloseTo(0);
  });

  it('мінімальна швидкість — найменша серед точок у межах повороту, точки поза межами не враховуються', () => {
    const corner: Corner = { id: 'T1', direction: 'R', startM: 20, apexM: 40, endM: 50 };
    // Точки кожні 10 м; поза поворотом (0, 10, 60, 70 м) швидкість нижча, ніж усередині.
    const speeds = [5, 8, 40, 30, 35, 45, 6, 4];
    const points = speeds.map((speedKmh, i) => ({ t: i, x: 0, y: i * 10, speedKmh }));
    const laps = [lap(points, { isBest: true })];

    const [result] = analyzeCorners(laps, trackWith(corner));

    expect(result.bestMinSpeedKmh).toBe(30);
    expect(result.avgMinSpeedKmh).toBe(30);
    // Гальмування: максимум швидкості між 20 і 40 м — точка на 20 м (40 км/год) → 40 − 20 = 20 м до апексу.
    expect(result.bestBrakeBeforeApexM).toBe(20);
  });

  it('avgLoss: найкраще коло 5,0 с, інше 5,4 с → avgLoss = 0,2 с', () => {
    const corner: Corner = { id: 'T1', direction: 'L', startM: 20, apexM: 45, endM: 70 };
    const laps = [
      lap(uniformPoints(10, 5, 100), { number: 1, isBest: true }), // 50 м за 5,0 с
      lap(uniformPoints(50 / 5.4, 5, 100), { number: 2 }), // 50 м за 5,4 с
      lap(uniformPoints(1, 5, 100), { number: 3, valid: false }), // невалідне — не враховується
    ];

    const [result] = analyzeCorners(laps, trackWith(corner));

    expect(result.bestLapTime).toBeCloseTo(5.0);
    expect(result.avgTime).toBeCloseTo(5.2);
    expect(result.avgLoss).toBeCloseTo(0.2);
  });

  it('коло без точок у межах повороту не падає, а пропускається', () => {
    const corner: Corner = { id: 'T1', direction: 'R', startM: 20, apexM: 30, endM: 40 };
    const best = lap(uniformPoints(10, 5, 100), { number: 1, isBest: true });
    // Точки лише на 0, 10 і 80 м — у межах 20–40 м жодної.
    const gap = lap(
      [
        { t: 0, x: 0, y: 0, speedKmh: 20 },
        { t: 1, x: 0, y: 10, speedKmh: 20 },
        { t: 9, x: 0, y: 80, speedKmh: 20 },
      ],
      { number: 2 },
    );

    let results: ReturnType<typeof analyzeCorners> = [];
    expect(() => {
      results = analyzeCorners([best, gap], trackWith(corner));
    }).not.toThrow();

    expect(results).toHaveLength(1);
    // Середні — лише по найкращому колу: коло без точок пропущено.
    expect(results[0].avgTime).toBeCloseTo(results[0].bestLapTime);
    expect(results[0].avgLoss).toBeCloseTo(0);
    expect(results[0].avgMinSpeedKmh).toBeCloseTo(36);
  });
});
