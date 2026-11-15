import type { Lap, Session, TrackConfig } from './model';

/** Перетин лінії старту між точками index − 1 та index. */
interface Crossing {
  /** Індекс першої точки після лінії. */
  index: number;
  /** Інтерпольований час перетину, с. */
  t: number;
}

/**
 * Ділить сесію на кола за перетином лінії старту/фінішу з інтерполяцією часу перетину.
 * Точки до першого і після останнього перетину — не коло.
 *
 * Jira: «Поділ сесії на кола: splitLaps».
 */
export function splitLaps(session: Session, track: TrackConfig): Lap[] {
  const { dirE, dirN, halfWidthM } = track.startLine;
  const points = session.points;

  const crossings: Crossing[] = [];
  for (let i = 1; i < points.length; i++) {
    const p0 = points[i - 1];
    const p1 = points[i];
    // Знакова відстань до лінії вздовж напрямку руху.
    const d0 = p0.x * dirE + p0.y * dirN;
    const d1 = p1.x * dirE + p1.y * dirN;
    if (!(d0 < 0 && d1 >= 0)) continue;

    const f = -d0 / (d1 - d0);
    const x = p0.x + f * (p1.x - p0.x);
    const y = p0.y + f * (p1.y - p0.y);
    // Бічне відхилення точки перетину від центру лінії.
    const lateral = -x * dirN + y * dirE;
    if (Math.abs(lateral) > halfWidthM) continue;

    crossings.push({ index: i, t: p0.t + f * (p1.t - p0.t) });
  }

  const laps: Lap[] = [];
  for (let k = 1; k < crossings.length; k++) {
    const start = crossings[k - 1];
    const end = crossings[k];
    laps.push({
      number: k,
      startT: start.t,
      endT: end.t,
      time: end.t - start.t,
      points: points.slice(start.index, end.index),
      valid: true,
      isBest: false,
    });
  }
  return laps;
}
