import type { GpxPoint, TrackConfig } from './model';

/** Помилка у вхідних даних. Повідомлення — українською, для пілота. */
export class InputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InputError';
  }
}

/**
 * Читає GPX-файл у масив точок.
 * Кидає InputError з назвою файлу, якщо файл пошкоджений, без точок або точка без часу.
 *
 * Jira: «Читання й перевірка вхідних файлів: parseGpx і parseTrack».
 */
export function parseGpx(_xml: string, _fileName: string): GpxPoint[] {
  throw new Error('not implemented: parseGpx');
}

/**
 * Перевіряє конфігурацію траси (track.json) і повертає її типізованою.
 * Кидає InputError, якщо поле відсутнє або повороти задано неправильно.
 *
 * Jira: «Читання й перевірка вхідних файлів: parseGpx і parseTrack».
 */
export function parseTrack(_json: unknown): TrackConfig {
  throw new Error('not implemented: parseTrack');
}
