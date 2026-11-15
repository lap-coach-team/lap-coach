import { compareWithReference } from './accuracy';
import { buildAdvice } from './advice';
import { analyzeCorners } from './corners';
import { filterLaps, sortByLoss } from './filter';
import { splitLaps } from './laps';
import type { GpxFile, Report } from './model';
import { InputError, parseGpx, parseTrack } from './parse';
import { buildSession } from './session';

/**
 * Увесь ланцюжок: parseGpx → buildSession → splitLaps → filterLaps →
 * analyzeCorners → sortByLoss → buildAdvice (+ compareWithReference, якщо є офіційні часи).
 *
 * Кидає InputError з повідомленням українською, якщо файлів немає
 * або в записі не знайшлося жодного валідного кола.
 *
 * Jira: «Екран розбору заїзду», підзадача «analyzeSession».
 */
export function analyzeSession(
  files: GpxFile[],
  trackJson: unknown,
  referenceLapTimes?: number[],
): Report {
  if (files.length === 0) {
    throw new InputError('Оберіть хоча б один GPX-файл заїзду.');
  }

  // 1. Вхідні дані
  const track = parseTrack(trackJson);
  const chapters = files.map((file) => parseGpx(file.text, file.name));
  const names = files.map((file) => file.name);

  // 2. Сесія
  const session = buildSession(chapters, track, names);

  // 3. Кола
  const laps = filterLaps(splitLaps(session, track));
  const bestLap = laps.find((lap) => lap.isBest);
  if (!bestLap) {
    throw new InputError(
      laps.length === 0
        ? 'У записі не знайдено жодного повного кола. Перевірте, що запис зроблено на цій трасі.'
        : 'У записі немає жодного валідного кола: усі кола задовгі або закороткі.',
    );
  }

  // 4. Повороти і поради
  const corners = sortByLoss(analyzeCorners(laps, track));
  const advice = buildAdvice(corners);

  const report: Report = { session, laps, bestLap, corners, advice };

  // 5. Точність проти офіційного хронометражу
  if (referenceLapTimes !== undefined) {
    report.accuracy = compareWithReference(laps, referenceLapTimes);
  }

  // 6. Готовий звіт
  return report;
}