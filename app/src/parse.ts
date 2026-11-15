import type { Corner, GpxPoint, TrackConfig } from './model';

/** Помилка у вхідних даних. Повідомлення — українською, для пілота. */
export class InputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InputError';
  }
}

/** Повертає число з рядка координати або null, якщо рядок некоректний чи поза межами. */
function parseCoordinate(value: string | null, limit: number): number | null {
  if (value === null || value.trim() === '') return null;
  const n = Number(value);
  return Number.isFinite(n) && Math.abs(n) <= limit ? n : null;
}

/**
 * Читає GPX-файл у масив точок.
 * Кидає InputError з назвою файлу, якщо файл пошкоджений, без точок або точка без часу.
 * Номери точок у повідомленнях рахуються з 1.
 *
 * Jira: «Читання й перевірка вхідних файлів: parseGpx і parseTrack».
 */
export function parseGpx(xml: string, fileName: string): GpxPoint[] {
  const corrupt = () =>
    new InputError(`${fileName}: файл пошкоджений або це не GPX`);

  let doc: Document;
  try {
    doc = new DOMParser().parseFromString(xml, 'application/xml');
  } catch {
    throw corrupt();
  }
  if (
    doc.getElementsByTagName('parsererror').length > 0 ||
    doc.documentElement?.localName !== 'gpx'
  ) {
    throw corrupt();
  }

  // GPX має простір імен, тому беремо trkpt через getElementsByTagName, а не querySelector.
  const nodes = Array.from(doc.getElementsByTagName('trkpt'));
  if (nodes.length === 0) {
    throw new InputError(`${fileName}: немає жодної точки треку`);
  }

  const points: GpxPoint[] = [];
  for (const [index, node] of nodes.entries()) {
    const number = index + 1;

    const lat = parseCoordinate(node.getAttribute('lat'), 90);
    const lon = parseCoordinate(node.getAttribute('lon'), 180);
    if (lat === null || lon === null) {
      throw new InputError(`${fileName}: у точці ${number} некоректні координати`);
    }

    const timeText = node.getElementsByTagName('time')[0]?.textContent?.trim();
    if (!timeText) {
      throw new InputError(`${fileName}: у точці ${number} немає часу`);
    }
    const ms = Date.parse(timeText);
    if (Number.isNaN(ms)) {
      throw new InputError(`${fileName}: у точці ${number} некоректний час`);
    }

    points.push({ time: ms / 1000, lat, lon });
  }

  // Усі часи цілі секунди: GoPro дає 18 Гц, значить, мілісекунди загублено.
  if (points.every((point) => Number.isInteger(point.time))) {
    throw new InputError(
      `${fileName}: у файлі немає часу з мілісекундами — точність кіл буде низькою`,
    );
  }

  return points;
}

type JsonObject = Record<string, unknown>;

function isObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isDirection(value: unknown): value is Corner['direction'] {
  return value === 'L' || value === 'R';
}

function readString(obj: JsonObject, key: string, scope = ''): string {
  const value = obj[key];
  if (typeof value !== 'string' || value.trim() === '') {
    throw new InputError(`track.json: ${scope}поле "${key}" має бути непорожнім рядком`);
  }
  return value;
}

function readNumber(obj: JsonObject, key: string, scope = ''): number {
  const value = obj[key];
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new InputError(`track.json: ${scope}поле "${key}" має бути числом`);
  }
  return value;
}

/** Допуск для перевірки dirE² + dirN² ≈ 1. */
const UNIT_VECTOR_TOLERANCE = 0.01;

/**
 * Перевіряє конфігурацію траси (track.json) і повертає її типізованою.
 * Кидає InputError, якщо поле відсутнє або повороти задано неправильно.
 *
 * Jira: «Читання й перевірка вхідних файлів: parseGpx і parseTrack».
 */
export function parseTrack(json: unknown): TrackConfig {
  if (!isObject(json)) {
    throw new InputError('track.json: очікується JSON-об\'єкт');
  }

  const id = readString(json, 'id');
  const name = readString(json, 'name');
  const lapLengthM = readNumber(json, 'lapLengthM');
  if (lapLengthM <= 0) {
    throw new InputError('track.json: поле "lapLengthM" має бути додатним');
  }

  const rawStartLine = json.startLine;
  if (!isObject(rawStartLine)) {
    throw new InputError('track.json: поле "startLine" має бути об\'єктом');
  }
  const startLine = {
    lat: readNumber(rawStartLine, 'lat', 'startLine: '),
    lon: readNumber(rawStartLine, 'lon', 'startLine: '),
    dirE: readNumber(rawStartLine, 'dirE', 'startLine: '),
    dirN: readNumber(rawStartLine, 'dirN', 'startLine: '),
    halfWidthM: readNumber(rawStartLine, 'halfWidthM', 'startLine: '),
  };
  if (Math.abs(startLine.lat) > 90 || Math.abs(startLine.lon) > 180) {
    throw new InputError('track.json: startLine: некоректні координати центру лінії');
  }
  if (startLine.halfWidthM <= 0) {
    throw new InputError('track.json: startLine: поле "halfWidthM" має бути додатним');
  }
  const norm = startLine.dirE ** 2 + startLine.dirN ** 2;
  if (Math.abs(norm - 1) > UNIT_VECTOR_TOLERANCE) {
    throw new InputError(
      'track.json: startLine: вектор напрямку (dirE, dirN) має бути одиничним',
    );
  }

  const rawCorners = json.corners;
  if (!Array.isArray(rawCorners) || rawCorners.length === 0) {
    throw new InputError('track.json: поле "corners" має бути непорожнім масивом');
  }
  const corners = rawCorners.map((raw: unknown, index: number): Corner => {
    if (!isObject(raw)) {
      throw new InputError(`track.json: поворот №${index + 1} має бути об'єктом`);
    }
    const scope = `поворот №${index + 1}: `;
    const cornerId = readString(raw, 'id', scope);
    const direction = raw.direction;
    if (!isDirection(direction)) {
      throw new InputError(`track.json: поворот ${cornerId}: напрямок має бути "L" або "R"`);
    }
    const startM = readNumber(raw, 'startM', `поворот ${cornerId}: `);
    const apexM = readNumber(raw, 'apexM', `поворот ${cornerId}: `);
    const endM = readNumber(raw, 'endM', `поворот ${cornerId}: `);
    if (!(startM < apexM && apexM < endM)) {
      throw new InputError(
        `track.json: поворот ${cornerId}: має бути startM < apexM < endM`,
      );
    }
    return { id: cornerId, direction, startM, apexM, endM };
  });

  return { id, name, lapLengthM, startLine, corners };
}
