import type { GpxPoint, Session, TrackConfig } from './model';

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
  throw new Error('not implemented: buildSession');
}
