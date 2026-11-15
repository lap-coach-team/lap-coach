import type { Advice, CornerResult } from './model';

/** Повороти з меншою середньою втратою пропускаємо: це шум, с. */
export const MIN_LOSS_S = 0.05;
/** Менша різниця точки гальмування — шум, м. */
export const BRAKE_DIFF_M = 3;
/** Менша різниця мінімальної швидкості — шум, км/год. */
export const SPEED_DIFF_KMH = 1.5;
/** Скільки порад показуємо щонайбільше. */
export const MAX_ADVICE = 3;

/**
 * Будує до 3 порад українською за правилами brake-later, brake-earlier, carry-speed.
 * Різниці в межах шуму не дають порад.
 *
 * Jira: «Поради українською: buildAdvice».
 */
export function buildAdvice(corners: CornerResult[]): Advice[] {
  const advice: Advice[] = [];
  for (const corner of corners) {
    if (!(corner.avgLoss >= MIN_LOSS_S)) continue;
    const item = adviceFor(corner);
    if (item) advice.push(item);
  }
  return advice.sort((a, b) => b.lossS - a.lossS).slice(0, MAX_ADVICE);
}

/** Одна порада для повороту — перше правило, що спрацювало, або null. */
function adviceFor(c: CornerResult): Advice | null {
  const loss = `Втрата: ${fmt(c.avgLoss, 2)} с на колі.`;

  if (c.avgBrakeBeforeApexM - c.bestBrakeBeforeApexM > BRAKE_DIFF_M) {
    return {
      cornerId: c.cornerId,
      kind: 'brake-later',
      text:
        `${c.cornerId}: гальмуєш зарано — у середньому за ${fmt(c.avgBrakeBeforeApexM, 1)} м до апексу, ` +
        `на найкращому колі — за ${fmt(c.bestBrakeBeforeApexM, 1)} м. Спробуй гальмувати пізніше. ${loss}`,
      current: c.avgBrakeBeforeApexM,
      target: c.bestBrakeBeforeApexM,
      unit: 'м',
      lossS: c.avgLoss,
    };
  }

  if (c.bestBrakeBeforeApexM - c.avgBrakeBeforeApexM > BRAKE_DIFF_M) {
    return {
      cornerId: c.cornerId,
      kind: 'brake-earlier',
      text:
        `${c.cornerId}: гальмуєш запізно — у середньому за ${fmt(c.avgBrakeBeforeApexM, 1)} м до апексу, ` +
        `на найкращому колі — за ${fmt(c.bestBrakeBeforeApexM, 1)} м. ` +
        `Почни гальмувати раніше, щоб пройти поворот швидше. ${loss}`,
      current: c.avgBrakeBeforeApexM,
      target: c.bestBrakeBeforeApexM,
      unit: 'м',
      lossS: c.avgLoss,
    };
  }

  if (c.bestMinSpeedKmh - c.avgMinSpeedKmh > SPEED_DIFF_KMH) {
    return {
      cornerId: c.cornerId,
      kind: 'carry-speed',
      text:
        `${c.cornerId}: неси більше швидкості в апекс. Зараз мінімальна швидкість у середньому ` +
        `${fmt(c.avgMinSpeedKmh, 1)} км/год, на найкращому колі — ${fmt(c.bestMinSpeedKmh, 1)}. ` +
        `Гальмуй трохи слабше. ${loss}`,
      current: c.avgMinSpeedKmh,
      target: c.bestMinSpeedKmh,
      unit: 'км/год',
      lossS: c.avgLoss,
    };
  }

  return null;
}

/** Число з комою: 19.04 → «19,0». */
function fmt(value: number, digits: number): string {
  return value.toFixed(digits).replace('.', ',');
}
