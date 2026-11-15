import type { Accuracy, Lap } from './model';

/**
 * Порівнює час кіл з офіційним хронометражем за порядком:
 * коло 1 з першим часом, коло 2 з другим і так далі.
 *
 * `laps` у результаті — кількість порівняних пар, тобто мінімум із двох довжин.
 * Якщо порівнювати нічого (одного зі списків немає), похибки — NaN, щоб перевірка
 * «≤ 0,05 с» не пройшла випадково.
 *
 * Jira: «Інтеграційні тести і тест точності проти AMB».
 */
export function compareWithReference(
  laps: Lap[],
  reference: number[],
): Accuracy {
  const count = Math.min(laps.length, reference.length);
  if (count === 0) {
    return { meanErrorS: NaN, maxErrorS: NaN, laps: 0 };
  }

  let sum = 0;
  let max = 0;
  for (let i = 0; i < count; i++) {
    const error = Math.abs(laps[i].time - reference[i]);
    sum += error;
    if (error > max) max = error;
  }

  return { meanErrorS: sum / count, maxErrorS: max, laps: count };
}
