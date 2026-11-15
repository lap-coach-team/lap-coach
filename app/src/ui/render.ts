import type { Advice, CornerResult, Lap, Report } from '../model';
import { fmt, fmtDelta, fmtStart, h } from './format';

const DIRECTION: Record<CornerResult['direction'], string> = { L: 'лівий', R: 'правий' };

const ADVICE_TITLE: Record<Advice['kind'], string> = {
  'brake-later': 'Гальмуй пізніше',
  'brake-earlier': 'Гальмуй раніше',
  'carry-speed': 'Неси швидкість в апекс',
};

/** Малює розбір заїзду: підсумок, поради, повороти, кола. Повертає кореневий елемент. */
export function renderReport(report: Report): HTMLElement {
  const root = h('div', { class: 'report', 'data-testid': 'report' });
  root.append(
    renderSummary(report),
    renderAdvice(report.advice),
    renderCorners(report.corners),
    renderLaps(report.laps, report.bestLap),
  );

  // Клік на пораду підсвічує її поворот у таблиці.
  root.addEventListener('click', (event) => {
    const card = (event.target as HTMLElement).closest<HTMLElement>('[data-corner]');
    if (!card || !root.contains(card)) return;
    highlightCorner(root, card.dataset.corner!);
  });
  return root;
}

function highlightCorner(root: HTMLElement, cornerId: string): void {
  for (const el of root.querySelectorAll('.is-highlighted')) el.classList.remove('is-highlighted');
  for (const el of root.querySelectorAll<HTMLElement>(`[data-corner="${cornerId}"]`)) {
    el.classList.add('is-highlighted');
  }
  const row = root.querySelector<HTMLElement>(`tr[data-corner="${cornerId}"]`);
  row?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
}

function renderSummary(report: Report): HTMLElement {
  const valid = report.laps.filter((lap) => lap.valid).length;
  const stats = [
    stat('Найкраще коло', `${fmt(report.bestLap.time, 3)} с`, `коло ${report.bestLap.number}`),
    stat('Кіл', String(report.laps.length), valid === report.laps.length ? 'усі валідні' : `валідних ${valid}`),
    stat('Старт сесії', fmtStart(report.session.startTime), report.session.sources.join(' + ')),
  ];
  if (report.accuracy) {
    stats.push(
      stat(
        'Похибка проти AMB',
        `${fmt(report.accuracy.meanErrorS, 3)} с`,
        `середня по ${report.accuracy.laps} колах, макс. ${fmt(report.accuracy.maxErrorS, 2)} с`,
      ),
    );
  }
  return h('section', { class: 'summary', 'aria-label': 'Підсумок' }, ...stats);
}

function stat(label: string, value: string, note: string): HTMLElement {
  return h(
    'div',
    { class: 'stat' },
    h('div', { class: 'stat-label' }, label),
    h('div', { class: 'stat-value' }, value),
    h('div', { class: 'stat-note' }, note),
  );
}

function renderAdvice(advice: Advice[]): HTMLElement {
  const section = h('section', { 'aria-labelledby': 'advice-title' }, h('h2', { id: 'advice-title' }, 'Поради'));
  if (advice.length === 0) {
    section.append(
      h('p', { class: 'empty', 'data-testid': 'no-advice' }, 'Надійної поради немає: різниця з найкращим колом у межах шуму.'),
    );
    return section;
  }
  const list = h('div', { class: 'advice-list' });
  for (const item of advice) {
    list.append(
      h(
        'button',
        { type: 'button', class: 'advice-card', 'data-corner': item.cornerId, 'data-testid': 'advice-card' },
        h(
          'div',
          { class: 'advice-head' },
          h('span', { class: 'corner-badge' }, item.cornerId),
          h('span', { class: 'advice-title' }, ADVICE_TITLE[item.kind]),
          h('span', { class: 'advice-loss' }, `−${fmt(item.lossS, 2)} с`),
        ),
        h('p', { class: 'advice-text' }, item.text),
        h(
          'div',
          { class: 'advice-numbers' },
          h('span', {}, `Зараз: ${fmt(item.current, 1)} ${item.unit}`),
          h('span', {}, `Ціль: ${fmt(item.target, 1)} ${item.unit}`),
        ),
      ),
    );
  }
  section.append(list);
  return section;
}

function renderCorners(corners: CornerResult[]): HTMLElement {
  const rows = corners.map((c) =>
    h(
      'tr',
      { 'data-corner': c.cornerId, 'data-testid': 'corner-row' },
      h('th', { scope: 'row' }, c.cornerId),
      h('td', {}, DIRECTION[c.direction]),
      h('td', { class: c.avgLoss > 0 ? 'num loss' : 'num' }, fmtDelta(c.avgLoss, 2)),
      h('td', { class: 'num' }, fmt(c.bestLapTime, 2)),
      h('td', { class: 'num' }, `${fmt(c.avgMinSpeedKmh, 1)} / ${fmt(c.bestMinSpeedKmh, 1)}`),
      h('td', { class: 'num' }, `${fmt(c.avgBrakeBeforeApexM, 1)} / ${fmt(c.bestBrakeBeforeApexM, 1)}`),
    ),
  );
  return h(
    'section',
    { 'aria-labelledby': 'corners-title' },
    h('h2', { id: 'corners-title' }, 'Повороти за втраченим часом'),
    h(
      'div',
      { class: 'table-wrap' },
      h(
        'table',
        {},
        h(
          'thead',
          {},
          h(
            'tr',
            {},
            h('th', { scope: 'col' }, 'Поворот'),
            h('th', { scope: 'col' }, 'Напрямок'),
            h('th', { scope: 'col', class: 'num' }, 'Втрата, с'),
            h('th', { scope: 'col', class: 'num' }, 'Час на найкращому, с'),
            h('th', { scope: 'col', class: 'num' }, 'Мін. швидкість, км/год (зараз / найкраще)'),
            h('th', { scope: 'col', class: 'num' }, 'Гальмування до апексу, м (зараз / найкраще)'),
          ),
        ),
        h('tbody', {}, ...rows),
      ),
    ),
    h('p', { class: 'hint' }, 'Втрата — середній час у повороті мінус час на найкращому колі. «Зараз» — середнє по валідних колах.'),
  );
}

function renderLaps(laps: Lap[], best: Lap): HTMLElement {
  const rows = laps.map((lap) => {
    const cls = [lap.isBest ? 'is-best' : '', lap.valid ? '' : 'is-invalid'].filter(Boolean).join(' ');
    return h(
      'tr',
      { class: cls, 'data-testid': 'lap-row', 'data-lap': String(lap.number) },
      h('th', { scope: 'row' }, String(lap.number)),
      h('td', { class: 'num' }, fmt(lap.time, 3)),
      h('td', { class: 'num' }, lap.isBest ? '—' : fmtDelta(lap.time - best.time, 3)),
      h('td', {}, lap.isBest ? 'найкраще' : lap.valid ? '' : 'невалідне'),
    );
  });
  return h(
    'section',
    { 'aria-labelledby': 'laps-title' },
    h('h2', { id: 'laps-title' }, 'Кола'),
    h(
      'div',
      { class: 'table-wrap' },
      h(
        'table',
        { class: 'laps' },
        h(
          'thead',
          {},
          h(
            'tr',
            {},
            h('th', { scope: 'col' }, 'Коло'),
            h('th', { scope: 'col', class: 'num' }, 'Час, с'),
            h('th', { scope: 'col', class: 'num' }, 'Від найкращого, с'),
            h('th', { scope: 'col' }, ''),
          ),
        ),
        h('tbody', {}, ...rows),
      ),
    ),
  );
}
