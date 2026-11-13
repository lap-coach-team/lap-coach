import type { GpxPoint, Session, TrackConfig, TrackPoint } from './model';

/**
 * Склеює частини запису (GH01, GH02…) в одну сесію: сортує за часом, відкидає дублікати,
 * переводить у метри від центру лінії старту і рахує швидкість із координат.
 *
 * Jira: «Склеювання частин запису і локальні координати: buildSession».
 */
export function buildSession(
  _chapters: GpxPoint[][],
  _track: TrackConfig,
  _sources: string[],
): Session {
  const parts = _chapters
    .map((points, idx) => ({ points, source: _sources[idx] }))
    .filter(part => part.points.length > 0)
    .sort((a, b) => a.points[0].time - b.points[0].time);

  const sortedSources = parts.map(p => p.source);

  const flatPoints: GpxPoint[] = [];
  let lastTime = -Infinity;
  for (const part of parts) {
    for (const pt of part.points) {
      if (pt.time > lastTime) {
        flatPoints.push(pt);
        lastTime = pt.time;
      }
    }
  }

  if (flatPoints.length === 0) {
    throw new Error('No valid points in the provided GPX chapters.');
  }

  const R = 6371000; 
  const lat0 = _track.startLine.lat;
  const lon0 = _track.startLine.lon;
  const lat0Rad = (lat0 * Math.PI) / 180;
  const cosLat0 = Math.cos(lat0Rad);

  const firstTime = flatPoints[0].time;
  const startTimeIso = new Date(firstTime * 1000).toISOString();
  const dateStr = startTimeIso.split('T')[0];
  const sessionId = `${dateStr}-${_track.id}`;

  const localCoords = flatPoints.map(pt => {
    const x = (pt.lon - lon0) * (Math.PI / 180) * R * cosLat0;
    const y = (pt.lat - lat0) * (Math.PI / 180) * R;
    return {
      t: pt.time - firstTime, 
      x,
      y,
      time: pt.time
    };
  });

  const trackPoints: TrackPoint[] = localCoords.map((pt, i, arr) => {
    const startIdx = Math.max(0, i - 3);
    const endIdx = Math.min(arr.length - 1, i + 3);

    let distM = 0;
    for (let j = startIdx; j < endIdx; j++) {
      const dx = arr[j + 1].x - arr[j].x;
      const dy = arr[j + 1].y - arr[j].y;
      distM += Math.sqrt(dx * dx + dy * dy);
    }

    const dtS = arr[endIdx].time - arr[startIdx].time;
    const speedKmh = dtS > 0 ? (distM / dtS) * 3.6 : 0;

    return {
      t: pt.t,
      x: pt.x,
      y: pt.y,
      speedKmh
    };
  });

  return {
    id: sessionId,
    trackId: _track.id,
    startTime: startTimeIso,
    sources: sortedSources,
    points: trackPoints
  };
}
