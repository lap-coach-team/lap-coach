import { describe, it, expect } from 'vitest';
import { buildAdvice } from './advice';
import type { CornerResult } from './model';

/** Поворот без жодної помітної різниці; поля, які важливі для тесту, задаються явно. */
function corner(overrides: Partial<CornerResult>): CornerResult {
  return {
    cornerId: 'T1',
    direction: 'L',
    bestLapTime: 5.0,
    avgTime: 5.2,
    avgLoss: 0.2,
    bestMinSpeedKmh: 30.0,
    avgMinSpeedKmh: 30.0,
    bestBrakeBeforeApexM: 10.0,
    avgBrakeBeforeApexM: 10.0,
    ...overrides,
  };
}

describe('buildAdvice', () => {
  it('carry-speed спрацьовує, коли різниця швидкостей > 1,5 км/год', () => {
    const advice = buildAdvice([
      corner({ cornerId: 'T3', avgLoss: 0.18, bestMinSpeedKmh: 32.0, avgMinSpeedKmh: 29.5 }),
    ]);

    expect(advice).toHaveLength(1);
    expect(advice[0]).toEqual({
      cornerId: 'T3',
      kind: 'carry-speed',
      text:
        'T3: неси більше швидкості в апекс. Зараз мінімальна швидкість у середньому 29,5 км/год, ' +
        'на найкращому колі — 32,0. Гальмуй трохи слабше. Втрата: 0,18 с на колі.',
      current: 29.5,
      target: 32.0,
      unit: 'км/год',
      lossS: 0.18,
    });
  });

  it('carry-speed не спрацьовує, коли різниця ≤ 1,5 км/год', () => {
    expect(buildAdvice([corner({ bestMinSpeedKmh: 31.5, avgMinSpeedKmh: 30.0 })])).toEqual([]);
    expect(buildAdvice([corner({ bestMinSpeedKmh: 31.0, avgMinSpeedKmh: 30.0 })])).toEqual([]);
  });

  it('brake-later і brake-earlier спрацьовують у свій бік', () => {
    const [later] = buildAdvice([
      corner({ cornerId: 'T6', avgLoss: 0.27, bestBrakeBeforeApexM: 12.6, avgBrakeBeforeApexM: 19.0 }),
    ]);
    expect(later.kind).toBe('brake-later');
    expect(later.unit).toBe('м');
    expect(later.text).toBe(
      'T6: гальмуєш зарано — у середньому за 19,0 м до апексу, на найкращому колі — за 12,6 м. ' +
        'Спробуй гальмувати пізніше. Втрата: 0,27 с на колі.',
    );

    const [earlier] = buildAdvice([
      corner({ cornerId: 'T4', avgLoss: 0.07, bestBrakeBeforeApexM: 11.6, avgBrakeBeforeApexM: 6.0 }),
    ]);
    expect(earlier.kind).toBe('brake-earlier');
    expect(earlier.text).toBe(
      'T4: гальмуєш запізно — у середньому за 6,0 м до апексу, на найкращому колі — за 11,6 м. ' +
        'Почни гальмувати раніше, щоб пройти поворот швидше. Втрата: 0,07 с на колі.',
    );
  });

  it('поворот з avgLoss < 0,05 с порад не дає', () => {
    const advice = buildAdvice([
      corner({ avgLoss: 0.04, bestMinSpeedKmh: 35.0, avgMinSpeedKmh: 30.0, avgBrakeBeforeApexM: 20.0 }),
      corner({ avgLoss: -0.07, bestMinSpeedKmh: 35.0, avgMinSpeedKmh: 30.0 }),
    ]);

    expect(advice).toEqual([]);
  });

  it('не більше 3 порад, відсортованих за втратою, навіть якщо підходять 5 поворотів', () => {
    const losses = [0.1, 0.3, 0.05, 0.25, 0.15];
    const corners = losses.map((avgLoss, i) =>
      corner({ cornerId: `T${i + 1}`, avgLoss, bestMinSpeedKmh: 33.0, avgMinSpeedKmh: 30.0 }),
    );

    const advice = buildAdvice(corners);

    expect(advice.map((a) => a.cornerId)).toEqual(['T2', 'T4', 'T5']);
    expect(advice.map((a) => a.lossS)).toEqual([0.3, 0.25, 0.15]);
  });

  it('нічого не спрацювало → порожній масив', () => {
    expect(buildAdvice([])).toEqual([]);
    expect(
      buildAdvice([
        corner({ cornerId: 'T1' }),
        corner({ cornerId: 'T2', bestBrakeBeforeApexM: 12.0, avgBrakeBeforeApexM: 10.0 }),
        corner({ cornerId: 'T3', bestMinSpeedKmh: 31.0, avgMinSpeedKmh: 30.0 }),
      ]),
    ).toEqual([]);
  });
});
