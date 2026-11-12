import type { Advice, CornerResult } from './model';

/**
 * Будує до 3 порад українською за правилами brake-later, brake-earlier, carry-speed.
 * Різниці в межах шуму не дають порад.
 *
 * Jira: «Поради українською: buildAdvice».
 */
export function buildAdvice(_corners: CornerResult[]): Advice[] {
  throw new Error('not implemented: buildAdvice');
}
