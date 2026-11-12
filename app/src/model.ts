/**
 * Контракт даних Lap Coach — спільна мова всіх модулів.
 *
 * Домовленості:
 * - Вхід — GPX: широта, довгота, час. Швидкості в GPX немає, її рахуємо з координат.
 * - Аналітика працює в локальних координатах у метрах: початок — центр лінії
 *   старту/фінішу, x — на схід, y — на північ. Лінія старту завжди в точці (0, 0).
 * - Повороти задаються відстанню від лінії старту вздовж кола, у метрах.
 * - Час — у секундах, швидкість — у км/год.
 *
 * Типи змінюємо лише після повідомлення в треді команди.
 */

/** Точка з GPX як є. */
export interface GpxPoint {
  /** Unix-час, секунди з мілісекундами. */
  time: number;
  /** Широта, градуси. */
  lat: number;
  /** Довгота, градуси. */
  lon: number;
}

/** GPX-файл, який обрав пілот. */
export interface GpxFile {
  /** Ім'я файлу, напр. "GH011616_1_GPS5.gpx". */
  name: string;
  /** Вміст файлу (XML). */
  text: string;
}

/** Точка треку в локальній системі траси. */
export interface TrackPoint {
  /** Секунди від першої точки сесії. */
  t: number;
  /** Метри на схід від центру лінії старту. */
  x: number;
  /** Метри на північ від центру лінії старту. */
  y: number;
  /** Швидкість, км/год, пораховано з координат. */
  speedKmh: number;
}

/** Один заїзд, склеєний з усіх частин запису. */
export interface Session {
  /** Напр. "2026-10-01-zhaha-shvydkosti". */
  id: string;
  trackId: string;
  /** ISO-час першої точки. */
  startTime: string;
  /** Імена GPX-файлів у порядку часу. */
  sources: string[];
  /** Відсортовані за t, без дублікатів часу. */
  points: TrackPoint[];
}

/** Лінія старту/фінішу. Її центр — початок локальних координат. */
export interface StartLine {
  /** Широта центру лінії, градуси. */
  lat: number;
  /** Довгота центру лінії, градуси. */
  lon: number;
  /** Напрямок руху через лінію: східна складова одиничного вектора. */
  dirE: number;
  /** Напрямок руху через лінію: північна складова одиничного вектора. */
  dirN: number;
  /** Піврозмах лінії, м: перетини далі від центру не рахуються. */
  halfWidthM: number;
}

export interface Corner {
  /** "T1"…"T7". */
  id: string;
  direction: 'L' | 'R';
  /** Початок повороту: відстань від лінії старту вздовж кола, м. */
  startM: number;
  /** Апекс, м від лінії старту. */
  apexM: number;
  /** Кінець повороту, м від лінії старту. */
  endM: number;
}

export interface TrackConfig {
  /** Напр. "zhaha-shvydkosti". */
  id: string;
  name: string;
  /** Довжина кола, м. */
  lapLengthM: number;
  startLine: StartLine;
  corners: Corner[];
}

export interface Lap {
  /** 1, 2, … */
  number: number;
  /** Інтерпольований час перетину лінії на старті кола, с. */
  startT: number;
  /** Інтерпольований час перетину лінії на фініші кола, с. */
  endT: number;
  /** endT − startT, с. */
  time: number;
  /** Точки між двома перетинами. */
  points: TrackPoint[];
  /** Заповнює filterLaps. */
  valid: boolean;
  /** Заповнює filterLaps: рівно одне найкраще коло серед валідних. */
  isBest: boolean;
}

export interface CornerResult {
  cornerId: string;
  direction: 'L' | 'R';
  /** Час у повороті на найкращому колі, с. */
  bestLapTime: number;
  /** Середній час у повороті по валідних колах, с. */
  avgTime: number;
  /** avgTime − bestLapTime, с. Може бути від'ємною. */
  avgLoss: number;
  /** Мінімальна швидкість на найкращому колі, км/год. */
  bestMinSpeedKmh: number;
  /** Середня мінімальна швидкість по валідних колах, км/год. */
  avgMinSpeedKmh: number;
  /** Де почалось гальмування на найкращому колі: метрів до апексу. */
  bestBrakeBeforeApexM: number;
  /** Де в середньому починалось гальмування: метрів до апексу. */
  avgBrakeBeforeApexM: number;
}

export type AdviceKind = 'carry-speed' | 'brake-later' | 'brake-earlier';

export interface Advice {
  cornerId: string;
  kind: AdviceKind;
  /** Українською, з цифрами «зараз» і «ціль». */
  text: string;
  /** Значення зараз (середнє по валідних колах). */
  current: number;
  /** Значення на найкращому колі. */
  target: number;
  unit: 'км/год' | 'м';
  /** Середня втрата в повороті, с. */
  lossS: number;
}

/** Порівняння часу кіл з офіційним хронометражем. */
export interface Accuracy {
  /** Середня абсолютна похибка, с. */
  meanErrorS: number;
  /** Максимальна абсолютна похибка, с. */
  maxErrorS: number;
  /** Кількість порівняних кіл. */
  laps: number;
}

/** Повний розбір заїзду для екрана. */
export interface Report {
  session: Session;
  laps: Lap[];
  bestLap: Lap;
  /** Відсортовані за avgLoss, найбільша втрата першою. */
  corners: CornerResult[];
  /** 0–3 поради. */
  advice: Advice[];
  /** Є, якщо передано офіційні часи кіл. */
  accuracy?: Accuracy;
}
