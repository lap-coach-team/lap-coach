import { beforeAll, describe, expect, it } from 'vitest';
import { analyzeSession } from '../../src/analyze';
import type { Report } from '../../src/model';
import { InputError } from '../../src/parse';
import { demoAmbLapTimes, demoGpxFiles, demoTrackJson } from './demo-data';

// Справжні GPX із GoPro: дві частини запису, 18 941 точка. Розбір займає ~0,5 с.
const TIMEOUT = 30_000;

describe('Повний ланцюжок на демо-сесії 1.10.2026', () => {
  let report: Report;

  beforeAll(() => {
    report = analyzeSession(demoGpxFiles(), demoTrackJson(), demoAmbLapTimes());
  }, TIMEOUT);

  it('демо-GPX → Report: 14 кіл, найкраще — 11-те, 41,50 ± 0,02 с, перший за втратою — T6', () => {
    expect(report.session.points).toHaveLength(18_941);
    expect(report.laps).toHaveLength(14);
    expect(report.laps.every((lap) => lap.valid)).toBe(true);
    expect(report.bestLap.number).toBe(11);
    expect(Math.abs(report.bestLap.time - 41.5)).toBeLessThanOrEqual(0.02);

    expect(report.corners.map((c) => c.cornerId)).toHaveLength(7);
    expect(report.corners[0].cornerId).toBe('T6');
    expect(report.advice.map((a) => `${a.cornerId}:${a.kind}`)).toEqual([
      'T6:brake-later',
      'T3:carry-speed',
      'T2:carry-speed',
    ]);
  });

  it('точність (B-21): середня похибка часу кіл проти AMB ≤ 0,05 с', () => {
    expect(report.accuracy).toBeDefined();
    const accuracy = report.accuracy!;
    expect(accuracy.laps).toBe(14);
    expect(accuracy.meanErrorS).toBeLessThanOrEqual(0.05);
    // Прототип: середня 0,037 с, максимальна 0,14 с.
    expect(accuracy.maxErrorS).toBeLessThan(0.2);
  });

  it('ті самі GPX у зворотному порядку → той самий результат', () => {
    const reversed = analyzeSession(
      [...demoGpxFiles()].reverse(),
      demoTrackJson(),
      demoAmbLapTimes(),
    );

    expect(reversed.session.sources).toEqual(report.session.sources);
    expect(reversed.laps.map((lap) => lap.time)).toEqual(report.laps.map((lap) => lap.time));
    expect(reversed.corners).toEqual(report.corners);
    expect(reversed.advice).toEqual(report.advice);
  }, TIMEOUT);
});

describe('Пошкоджений вхід', () => {
  it('обрізаний GPX → InputError з назвою файлу, а не падіння', () => {
    const [first, second] = demoGpxFiles();
    const broken = { name: second.name, text: second.text.slice(0, second.text.length / 2) };

    const run = () => analyzeSession([first, broken], demoTrackJson());

    expect(run).toThrow(InputError);
    expect(run).toThrow(second.name);
  }, TIMEOUT);
});
