import type { Corner, CornerResult, Lap, TrackConfig } from './model';

/** Показники одного повороту на одному колі. */
interface CornerOnLap {
  /** Час у повороті, с. */
  time: number;
  /** Мінімальна швидкість у повороті, км/год. */
  minSpeedKmh: number;
  /** За скільки метрів до апексу почалося гальмування. */
  brakeBeforeApexM: number;
}

/**
 * Для кожного повороту рахує час, мінімальну швидкість, точку гальмування
 * і втрату проти найкращого кола. Порядок — як у track.corners.
 *
 * Беруться лише валідні кола; найкраще — валідне коло з isBest.
 * Коло без точок у межах повороту для цього повороту пропускається.
 * Якщо поворот не вдалося виміряти на найкращому колі, його немає в результаті.
 *
 * Jira: «Аналіз поворотів: analyzeCorners».
 */
export function analyzeCorners(laps: Lap[], track: TrackConfig): CornerResult[] {
  const validLaps = laps.filter((lap) => lap.valid);
  const bestLap = validLaps.find((lap) => lap.isBest);
  if (!bestLap) return [];

  const distances = new Map<Lap, number[]>();
  for (const lap of validLaps) distances.set(lap, cumulativeDistance(lap));

  const results: CornerResult[] = [];
  for (const corner of track.corners) {
    const best = measureCorner(bestLap, distances.get(bestLap)!, corner);
    if (!best) continue;

    const measured: CornerOnLap[] = [];
    for (const lap of validLaps) {
      const m = measureCorner(lap, distances.get(lap)!, corner);
      if (m) measured.push(m);
    }

    const avgTime = mean(measured.map((m) => m.time));
    results.push({
      cornerId: corner.id,
      direction: corner.direction,
      bestLapTime: best.time,
      avgTime,
      avgLoss: avgTime - best.time,
      bestMinSpeedKmh: best.minSpeedKmh,
      avgMinSpeedKmh: mean(measured.map((m) => m.minSpeedKmh)),
      bestBrakeBeforeApexM: best.brakeBeforeApexM,
      avgBrakeBeforeApexM: mean(measured.map((m) => m.brakeBeforeApexM)),
    });
  }
  return results;
}

/** Накопичена відстань від першої точки кола, м. */
function cumulativeDistance(lap: Lap): number[] {
  const dist: number[] = [];
  lap.points.forEach((p, i) => {
    if (i === 0) {
      dist.push(0);
      return;
    }
    const prev = lap.points[i - 1];
    dist.push(dist[i - 1] + Math.hypot(p.x - prev.x, p.y - prev.y));
  });
  return dist;
}

/** Час на відстані d від початку кола: лінійна інтерполяція; за межами кола — крайня точка. */
function timeAtDistance(lap: Lap, dist: number[], d: number): number {
  const pts = lap.points;
  const last = pts.length - 1;
  if (d <= dist[0]) return pts[0].t;
  if (d >= dist[last]) return pts[last].t;

  let i = 1;
  while (dist[i] < d) i++;
  const d0 = dist[i - 1];
  const d1 = dist[i];
  const f = d1 > d0 ? (d - d0) / (d1 - d0) : 0;
  return pts[i - 1].t + f * (pts[i].t - pts[i - 1].t);
}

/** Показники повороту на колі або null, якщо в межах повороту немає точок. */
function measureCorner(lap: Lap, dist: number[], corner: Corner): CornerOnLap | null {
  let minSpeed = Infinity;
  let brakeSpeed = -Infinity;
  let brakeDist = 0;

  lap.points.forEach((p, i) => {
    const d = dist[i];
    if (d >= corner.startM && d <= corner.endM) {
      minSpeed = Math.min(minSpeed, p.speedKmh);
    }
    if (d >= corner.startM && d <= corner.apexM && p.speedKmh > brakeSpeed) {
      brakeSpeed = p.speedKmh;
      brakeDist = d;
    }
  });

  if (minSpeed === Infinity || brakeSpeed === -Infinity) return null;

  return {
    time: timeAtDistance(lap, dist, corner.endM) - timeAtDistance(lap, dist, corner.startM),
    minSpeedKmh: minSpeed,
    brakeBeforeApexM: corner.apexM - brakeDist,
  };
}

function mean(values: number[]): number {
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}
