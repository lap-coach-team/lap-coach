import type { Lap, Session, TrackConfig } from './model';

/**
 * Ділить сесію на кола за перетином лінії старту/фінішу з інтерполяцією часу перетину.
 * Точки до першого і після останнього перетину — не коло.
 *
 * Jira: «Поділ сесії на кола: splitLaps».
 */
export function splitLaps(_session: Session, _track: TrackConfig): Lap[] {
  throw new Error('not implemented: splitLaps');
}
