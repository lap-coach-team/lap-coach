import { describe, it, expect } from 'vitest';
import { splitLaps } from './laps';
import type { Session, TrackConfig, TrackPoint } from './model';

const track: TrackConfig = {
  id: 'test-track',
  name: 'Test Track',
  lapLengthM: 1000,
  startLine: { lat: 50.0, lon: 30.0, dirE: 0, dirN: 1, halfWidthM: 5 },
  corners: [],
};

function pt(t: number, y: number, x = 0): TrackPoint {
  return { t, x, y, speedKmh: 0 };
}

function session(points: TrackPoint[]): Session {
  return {
    id: 'test-session',
    trackId: track.id,
    startTime: '2026-10-01T00:00:00.000Z',
    sources: ['test.gpx'],
    points,
  };
}

/** Рух уздовж осі y: «назад» за лінію (y = −1) і вперед через неї (y = 1). */
function lapsAt(crossTimes: number[]): TrackPoint[] {
  const points: TrackPoint[] = [];
  for (const t of crossTimes) {
    points.push(pt(t - 1, -1), pt(t + 1, 1));
  }
  return points;
}

describe('splitLaps', () => {
  it('одне коло: два перетини → 1 коло з правильним часом', () => {
    const laps = splitLaps(session(lapsAt([10, 50])), track);

    expect(laps).toHaveLength(1);
    expect(laps[0].number).toBe(1);
    expect(laps[0].startT).toBeCloseTo(10);
    expect(laps[0].endT).toBeCloseTo(50);
    expect(laps[0].time).toBeCloseTo(40);
    expect(laps[0].valid).toBe(true);
    expect(laps[0].isBest).toBe(false);
    // Точки між перетинами: y = 1 після старту і y = −1 перед фінішем.
    expect(laps[0].points.map((p) => p.t)).toEqual([11, 49]);
  });

  it('три кола → 3 кола з номерами 1, 2, 3', () => {
    const laps = splitLaps(session(lapsAt([10, 50, 92, 133])), track);

    expect(laps.map((l) => l.number)).toEqual([1, 2, 3]);
    expect(laps[0].time).toBeCloseTo(40);
    expect(laps[1].time).toBeCloseTo(42);
    expect(laps[2].time).toBeCloseTo(41);
  });

  it('інтерполяція: y = −1 (t = 10) і y = 3 (t = 14) → перетин у t = 11', () => {
    const laps = splitLaps(
      session([pt(10, -1), pt(14, 3), pt(59, -2), pt(61, 2)]),
      track,
    );

    expect(laps).toHaveLength(1);
    expect(laps[0].startT).toBeCloseTo(11);
    expect(laps[0].endT).toBeCloseTo(60);
  });

  it('немає перетину → порожній масив', () => {
    const laps = splitLaps(session([pt(0, -10), pt(1, -5), pt(2, -1)]), track);

    expect(laps).toEqual([]);
  });

  it('рух у зворотному напрямку або перетин далі ніж halfWidthM → не рахується', () => {
    // Назад через лінію: y від 1 до −1.
    const backwards = [pt(0, 1), pt(1, -1), pt(40, 1), pt(41, -1)];
    expect(splitLaps(session(backwards), track)).toEqual([]);

    // Уперед, але за 10 м від центру лінії (halfWidthM = 5).
    const wide = [pt(0, -1, 10), pt(1, 1, 10), pt(40, -1, -10), pt(41, 1, -10)];
    expect(splitLaps(session(wide), track)).toEqual([]);

    // Змішано: зворотний і широкий перетини ігноруються, рахуються лише два валідні.
    const mixed = [
      pt(0, -1), pt(2, 1), // валідний, t = 1
      pt(10, -1), // назад через лінію — ігнор
      pt(11, -1, 10), pt(12, 1, 10), // уперед, але за 10 м від центру — ігнор
      pt(20, -1), pt(22, 1), // валідний, t = 21
    ];
    const laps = splitLaps(session(mixed), track);
    expect(laps).toHaveLength(1);
    expect(laps[0].startT).toBeCloseTo(1);
    expect(laps[0].endT).toBeCloseTo(21);
  });
});
