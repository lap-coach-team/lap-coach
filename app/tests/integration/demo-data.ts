import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { GpxFile } from '../../src/model';

// Vitest запускається з папки app/, тому шлях — від неї.
const demoDir = resolve(process.cwd(), 'public/demo');

/** Читає файл із app/public/demo/. */
export function readDemo(name: string): string {
  return readFileSync(resolve(demoDir, name), 'utf8');
}

/** Дві частини запису GoPro сесії 1.10.2026 у правильному порядку. */
export const DEMO_GPX_NAMES = ['GH011616_1_GPS5.gpx', 'GH021616_1_GPS5.gpx'];

export function demoGpxFiles(): GpxFile[] {
  return DEMO_GPX_NAMES.map((name) => ({ name, text: readDemo(name) }));
}

export function demoTrackJson(): unknown {
  return JSON.parse(readDemo('track.json'));
}

/** Офіційні часи кіл AMB. */
export function demoAmbLapTimes(): number[] {
  return (JSON.parse(readDemo('amb-2026-10-01.json')) as { lapTimes: number[] }).lapTimes;
}
