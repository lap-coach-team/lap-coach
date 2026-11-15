import { beforeAll, describe, expect, it } from 'vitest';
import type { DataSource } from '../../src/ui/app';
import { mountApp } from '../../src/ui/app';
import { demoAmbLapTimes, demoGpxFiles, demoTrackJson } from './demo-data';

// Замість fetch екран читає демо-файли з диска.
const diskData: DataSource = {
  loadTrack: async () => demoTrackJson(),
  loadDemoGpx: async () => demoGpxFiles(),
  loadDemoReference: async () => demoAmbLapTimes(),
};

function waitForAnalysis(root: HTMLElement): Promise<void> {
  return new Promise((resolve) => root.addEventListener('analysis-done', () => resolve(), { once: true }));
}

describe('Екран розбору: сценарій «Демо-сесія»', () => {
  const root = document.createElement('div');

  beforeAll(async () => {
    document.body.append(root);
    mountApp(root, diskData);
    const done = waitForAnalysis(root);
    root.querySelector<HTMLButtonElement>('[data-testid="demo-button"]')!.click();
    await done;
  }, 30_000);

  it('демо-сесія → 14 кіл, найкраще 11-те, 7 поворотів, 1–3 картки порад; клік на пораду підсвічує поворот', () => {
    expect(root.querySelector('[data-testid="status"]')!.textContent).toBe('');

    const laps = root.querySelectorAll<HTMLElement>('[data-testid="lap-row"]');
    expect(laps).toHaveLength(14);
    const best = root.querySelectorAll<HTMLElement>('[data-testid="lap-row"].is-best');
    expect(best).toHaveLength(1);
    expect(best[0].dataset.lap).toBe('11');

    const corners = root.querySelectorAll<HTMLElement>('[data-testid="corner-row"]');
    expect(corners).toHaveLength(7);
    expect(corners[0].dataset.corner).toBe('T6');

    const cards = root.querySelectorAll<HTMLElement>('[data-testid="advice-card"]');
    expect(cards.length).toBeGreaterThanOrEqual(1);
    expect(cards.length).toBeLessThanOrEqual(3);
    expect(cards[0].textContent).toContain('T6');

    // Клік на другу пораду (T3) підсвічує рядок T3 і знімає підсвітку з інших.
    cards[1].click();
    const highlighted = root.querySelectorAll<HTMLElement>('tr.is-highlighted');
    expect(highlighted).toHaveLength(1);
    expect(highlighted[0].dataset.corner).toBe(cards[1].dataset.corner);
  });
});
