/** Число з комою: 41.5012 → «41,501» при digits = 3. */
export function fmt(value: number, digits: number): string {
  return value.toFixed(digits).replace('.', ',');
}

/** Різниця зі знаком: 0.27 → «+0,27», −0.07 → «−0,07». */
export function fmtDelta(value: number, digits: number): string {
  const sign = value > 0 ? '+' : value < 0 ? '−' : '';
  return sign + fmt(Math.abs(value), digits);
}

/** Дата й час старту сесії: «1.10.2026, 13:05». */
export function fmtStart(iso: string): string {
  return new Date(iso).toLocaleString('uk-UA', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Що можна передати дитиною в h(): вузол, текст або нічого. */
export type Child = Node | string | null | undefined | false;

/** Створює елемент. Текст іде через textContent, тому імена файлів не можуть вставити HTML. */
export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, string> = {},
  ...children: Child[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value);
  for (const child of children) {
    if (child === null || child === undefined || child === false) continue;
    el.append(child);
  }
  return el;
}
