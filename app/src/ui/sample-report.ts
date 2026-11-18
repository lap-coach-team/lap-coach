import type { Advice, CornerResult, Lap, Report, Session, TrackPoint } from '../model';

/**
 * Вручну складений звіт для верстки екрана, поки ланцюжок модулів не готовий.
 * 3 кола (третє найкраще), 3 повороти, 2 поради. Числа правдоподібні, але вигадані.
 *
 * Jira: «Екран розбору заїзду», підзадача «analyzeSession».
 */

/** Довжина кола «Жаги швидкості», м. */
const LAP_LENGTH_M = 480.1;
/** Скільки точок малюємо на одне коло. */
const POINTS_PER_LAP = 48;

/**
 * Точки одного кола: коло-«бублик», що починається і закінчується на лінії старту (0, 0).
 * Швидкість гойдається між ~38 і ~62 км/год, щоб на графіку були «повороти».
 */
function lapPoints(startT: number, time: number): TrackPoint[] {
  const radius = LAP_LENGTH_M / (2 * Math.PI);
  const points: TrackPoint[] = [];
  for (let i = 0; i <= POINTS_PER_LAP; i++) {
    const share = i / POINTS_PER_LAP;
    const angle = share * 2 * Math.PI;
    points.push({
      t: round(startT + share * time, 2),
      x: round(radius * Math.sin(angle), 1),
      y: round(radius * (1 - Math.cos(angle)), 1),
      speedKmh: round(50 + 12 * Math.cos(3 * angle), 1),
    });
  }
  return points;
}

function round(value: number, digits: number): number {
  const k = 10 ** digits;
  return Math.round(value * k) / k;
}

const lap1: Lap = {
  number: 1,
  startT: 12.4,
  endT: 55.91,
  time: 43.51,
  points: lapPoints(12.4, 43.51),
  valid: true,
  isBest: false,
};

const lap2: Lap = {
  number: 2,
  startT: 55.91,
  endT: 98.1,
  time: 42.19,
  points: lapPoints(55.91, 42.19),
  valid: true,
  isBest: false,
};

const lap3: Lap = {
  number: 3,
  startT: 98.1,
  endT: 139.82,
  time: 41.72,
  points: lapPoints(98.1, 41.72),
  valid: true,
  isBest: true,
};

const laps: Lap[] = [lap1, lap2, lap3];

const session: Session = {
  id: '2026-10-01-zhaha-shvydkosti',
  trackId: 'zhaha-shvydkosti',
  startTime: '2026-10-01T10:15:00.000Z',
  sources: ['GH011616_1_GPS5.gpx', 'GH021616_1_GPS5.gpx'],
  points: laps.flatMap((lap) => lap.points),
};

/** Відсортовано за avgLoss: найбільша втрата першою. */
const corners: CornerResult[] = [
  {
    cornerId: 'T2',
    direction: 'R',
    bestLapTime: 5.42,
    avgTime: 5.73,
    avgLoss: 0.31,
    bestMinSpeedKmh: 37.8,
    avgMinSpeedKmh: 37.1,
    bestBrakeBeforeApexM: 18.0,
    avgBrakeBeforeApexM: 24.5,
  },
  {
    cornerId: 'T5',
    direction: 'R',
    bestLapTime: 4.06,
    avgTime: 4.24,
    avgLoss: 0.18,
    bestMinSpeedKmh: 41.2,
    avgMinSpeedKmh: 38.6,
    bestBrakeBeforeApexM: 20.1,
    avgBrakeBeforeApexM: 21.0,
  },
  {
    cornerId: 'T1',
    direction: 'L',
    bestLapTime: 6.11,
    avgTime: 6.14,
    avgLoss: 0.03,
    bestMinSpeedKmh: 44.5,
    avgMinSpeedKmh: 44.1,
    bestBrakeBeforeApexM: 22.3,
    avgBrakeBeforeApexM: 23.0,
  },
];

/** Тексти — у тому ж форматі, що дає buildAdvice. Для T1 поради немає: втрата 0,03 с — шум. */
const advice: Advice[] = [
  {
    cornerId: 'T2',
    kind: 'brake-later',
    text:
      'T2: гальмуєш зарано — у середньому за 24,5 м до апексу, на найкращому колі — за 18,0 м. ' +
      'Спробуй гальмувати пізніше. Втрата: 0,31 с на колі.',
    current: 24.5,
    target: 18.0,
    unit: 'м',
    lossS: 0.31,
  },
  {
    cornerId: 'T5',
    kind: 'carry-speed',
    text:
      'T5: неси більше швидкості в апекс. Зараз мінімальна швидкість у середньому 38,6 км/год, ' +
      'на найкращому колі — 41,2. Гальмуй трохи слабше. Втрата: 0,18 с на колі.',
    current: 38.6,
    target: 41.2,
    unit: 'км/год',
    lossS: 0.18,
  },
];

export const SAMPLE_REPORT: Report = {
  session,
  laps,
  bestLap: lap3,
  corners,
  advice,
  accuracy: { meanErrorS: 0.021, maxErrorS: 0.043, laps: 3 },
};