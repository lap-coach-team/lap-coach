import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { InputError, parseGpx, parseTrack } from './parse';

const NS = 'xmlns="http://www.topografix.com/GPX/1/1"';
const FILE = 'GH011616_1_GPS5.gpx';

/** Обгортає точки в мінімальний валідний GPX з простором імен. */
function gpx(points: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?><gpx version="1.1" creator="test" ${NS}><trk><trkseg>${points}</trkseg></trk></gpx>`;
}

/** Одна точка треку; без аргументу time елемента <time> немає. */
function pt(lat: string, lon: string, time?: string): string {
  const timeTag = time === undefined ? '' : `<time>${time}</time>`;
  return `<trkpt lat="${lat}" lon="${lon}"><ele>100</ele>${timeTag}</trkpt>`;
}

/** Виконує fn, перевіряє, що вона кинула InputError, і повертає його. */
function catchInputError(fn: () => unknown): InputError {
  try {
    fn();
  } catch (error) {
    expect(error).toBeInstanceOf(InputError);
    return error as InputError;
  }
  throw new Error('Очікувалась InputError, але виклик завершився без помилки');
}

/** Правильна конфігурація траси; тести ламають з неї окремі поля. */
function validTrack() {
  return {
    id: 'zhaha-shvydkosti',
    name: 'Жага швидкості',
    lapLengthM: 800,
    startLine: { lat: 50.45, lon: 30.52, dirE: 0.6, dirN: 0.8, halfWidthM: 8 },
    corners: [
      { id: 'T1', direction: 'L', startM: 40, apexM: 55, endM: 75 },
      { id: 'T2', direction: 'R', startM: 120, apexM: 140, endM: 160 },
    ],
  };
}

describe('parseGpx', () => {
  it('правильний GPX дає правильні lat, lon і час з мілісекундами', () => {
    const xml = gpx(
      pt('50.4501', '30.5234', '2026-10-01T13:05:01.375Z') +
        pt('50.4502', '30.5235', '2026-10-01T13:05:01.425Z') +
        pt('50.4503', '30.5236', '2026-10-01T13:05:01.475Z'),
    );

    const points = parseGpx(xml, FILE);

    expect(points).toHaveLength(3);
    expect(points[0].lat).toBe(50.4501);
    expect(points[0].lon).toBe(30.5234);
    const expectedTime = Date.UTC(2026, 9, 1, 13, 5, 1, 375) / 1000;
    expect(points[0].time).toBeCloseTo(expectedTime, 3);
    expect(Math.round((points[0].time % 1) * 1000)).toBe(375);
    expect(points[1].time - points[0].time).toBeCloseTo(0.05, 3);
  });

  it('пошкоджений XML кидає InputError з назвою файлу', () => {
    const error = catchInputError(() => parseGpx('<gpx><trk>', FILE));

    expect(error.message).toBe(`${FILE}: файл пошкоджений або це не GPX`);
  });

  it('GPX без trkpt кидає InputError', () => {
    const error = catchInputError(() => parseGpx(gpx(''), FILE));

    expect(error.message).toBe(`${FILE}: немає жодної точки треку`);
  });

  it('точка без time кидає InputError з номером точки', () => {
    const xml = gpx(
      pt('50.4501', '30.5234', '2026-10-01T13:05:01.375Z') +
        pt('50.4502', '30.5235', '2026-10-01T13:05:01.425Z') +
        pt('50.4503', '30.5236'),
    );

    const error = catchInputError(() => parseGpx(xml, FILE));

    expect(error.message).toBe(`${FILE}: у точці 3 немає часу`);
  });

  it('коректний XML, який не є GPX, кидає InputError', () => {
    const error = catchInputError(() => parseGpx('<kml></kml>', FILE));

    expect(error.message).toBe(`${FILE}: файл пошкоджений або це не GPX`);
  });

  it('некоректні координати кидають InputError з номером точки', () => {
    const notNumber = gpx(
      pt('50.4501', '30.5234', '2026-10-01T13:05:01.375Z') +
        pt('abc', '30.5235', '2026-10-01T13:05:01.425Z'),
    );
    const outOfRange = gpx(pt('95', '30.5234', '2026-10-01T13:05:01.375Z'));

    expect(catchInputError(() => parseGpx(notNumber, FILE)).message).toBe(
      `${FILE}: у точці 2 некоректні координати`,
    );
    expect(catchInputError(() => parseGpx(outOfRange, FILE)).message).toBe(
      `${FILE}: у точці 1 некоректні координати`,
    );
  });

  it('усі часи цілі секунди — InputError про відсутні мілісекунди', () => {
    const xml = gpx(
      pt('50.4501', '30.5234', '2026-10-01T13:05:01Z') +
        pt('50.4502', '30.5235', '2026-10-01T13:05:02Z'),
    );

    const error = catchInputError(() => parseGpx(xml, FILE));

    expect(error.message).toBe(
      `${FILE}: у файлі немає часу з мілісекундами — точність кіл буде низькою`,
    );
  });
});

describe('parseTrack', () => {
  it('правильна конфігурація повертається з тими самими полями', () => {
    const track = parseTrack(validTrack());

    expect(track).toEqual(validTrack());
  });

  it('поворот зі startM > endM кидає InputError', () => {
    const json = validTrack();
    json.corners[1].startM = 170;

    const error = catchInputError(() => parseTrack(json));

    expect(error.message).toContain('T2');
    expect(error.message).toContain('startM < apexM < endM');
  });

  it('вектор напрямку не одиничний — InputError', () => {
    const json = validTrack();
    json.startLine.dirE = 1;
    json.startLine.dirN = 1;

    const error = catchInputError(() => parseTrack(json));

    expect(error.message).toContain('startLine');
  });

  it('порожній масив corners кидає InputError', () => {
    const json = { ...validTrack(), corners: [] };

    const error = catchInputError(() => parseTrack(json));

    expect(error.message).toContain('corners');
  });

  it('не об\'єкт кидає InputError', () => {
    expect(() => parseTrack(null)).toThrow(InputError);
    expect(() => parseTrack('track')).toThrow(InputError);
  });
});

/** Демо-файли сесії 1.10.2026 і кількість точок, яку очікує Jira-задача. */
const DEMO_FILES = [
  { name: 'GH011616_1_GPS5.gpx', points: 9377 },
  { name: 'GH021616_1_GPS5.gpx', points: 9564 },
];

/** Шлях до файлу в app/public/demo. Тести запускаємо з папки app (npm test, CI). */
function demoPath(name: string): string {
  return resolve(process.cwd(), 'public', 'demo', name);
}

describe('parseGpx на демо-даних', () => {
  for (const { name, points } of DEMO_FILES) {
    it(`${name} дає ${points} точок`, { timeout: 20000 }, () => {
      const result = parseGpx(readFileSync(demoPath(name), 'utf8'), name);

      expect(result).toHaveLength(points);
    });
  }
});

describe('parseTrack на демо-даних', () => {
  it('track.json «Жаги швидкості» проходить перевірку', () => {
    const json: unknown = JSON.parse(readFileSync(demoPath('track.json'), 'utf8'));

    const track = parseTrack(json);

    expect(track.id).toBe('zhaha-shvydkosti');
    expect(track.corners).toHaveLength(7);
    expect(track.corners[0].id).toBe('T1');
    expect(track.corners[6].endM).toBe(track.lapLengthM);
  });
});
