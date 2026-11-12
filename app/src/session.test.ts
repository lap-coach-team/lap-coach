import { describe, it, expect } from 'vitest';
import { buildSession } from './session';
import type { GpxPoint, TrackConfig } from './model';

const mockTrack: TrackConfig = {
  id: 'test-track',
  name: 'Test Track',
  lapLengthM: 1000,
  startLine: { lat: 50.0, lon: 30.0, dirE: 1, dirN: 0, halfWidthM: 5 },
  corners: []
};

describe('buildSession', () => {
  it('merges chapters in the correct order, even if they are passed in reverse', () => {
    const chapter1: GpxPoint[] = [{ time: 1000.0, lat: 50.0, lon: 30.0 }];
    const chapter2: GpxPoint[] = [{ time: 2000.0, lat: 50.0, lon: 30.0 }];

    const session = buildSession([chapter2, chapter1], mockTrack, ['file2.gpx', 'file1.gpx']);

    expect(session.sources).toEqual(['file1.gpx', 'file2.gpx']);
    expect(session.points.length).toBe(2);
    expect(session.points[0].t).toBe(0); 
    expect(session.points[1].t).toBe(1000.0); 
  });

  it('discards duplicate timestamps at chapter junctions', () => {
    const chapter1: GpxPoint[] = [
      { time: 1000.0, lat: 50.0, lon: 30.0 },
      { time: 1000.5, lat: 50.0, lon: 30.0 }
    ];
    const chapter2: GpxPoint[] = [
      { time: 1000.5, lat: 50.0, lon: 30.0 },
      { time: 1001.0, lat: 50.0, lon: 30.0 }
    ];

    const session = buildSession([chapter1, chapter2], mockTrack, ['1.gpx', '2.gpx']);

    expect(session.points.length).toBe(3);
    expect(session.points.map(p => p.t)).toEqual([0, 0.5, 1.0]);
  });

  it('correctly converts coordinates: a point 0.001° north of the center has y ≈ 111.2 m, x ≈ 0', () => {
    const pts: GpxPoint[][] = [[{ time: 1000.0, lat: 50.001, lon: 30.0 }]];

    const session = buildSession(pts, mockTrack, ['1.gpx']);
    const pt = session.points[0];

    expect(pt.x).toBeCloseTo(0, 1);
    expect(pt.y).toBeCloseTo(111.2, 1);
  });

  it('correctly calculates speed: straight line movement at 10 m/s -> 36 km/h', () => {
    const pts: GpxPoint[] = [];
    const latFactor = (Math.PI / 180) * 6371000;

    for (let i = 0; i < 10; i++) {
      const y = i * 1; 
      const time = 1000.0 + i * 0.1;
      const lat = 50.0 + (y / latFactor);
      pts.push({ time, lat, lon: 30.0 });
    }

    const session = buildSession([pts], mockTrack, ['1.gpx']);

    const midPt = session.points[5];
    expect(midPt.speedKmh).toBeCloseTo(36.0, 1);
  });
});