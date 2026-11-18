import { analyzeSession } from '../analyze';
import type { GpxFile } from '../model';
import { InputError } from '../parse';
import { h } from './format';
import { renderReport } from './render';

/** Звідки екран бере демо-сесію і трасу. У тестах підміняється читанням з диска. */
export interface DataSource {
  /** track.json траси (у MVP одна траса — «Жага швидкості»). */
  loadTrack(): Promise<unknown>;
  /** GPX-файли демо-сесії. */
  loadDemoGpx(): Promise<GpxFile[]>;
  /** Офіційні часи AMB для демо-сесії. */
  loadDemoReference(): Promise<number[]>;
}

const DEMO_GPX = ['GH011616_1_GPS5.gpx', 'GH021616_1_GPS5.gpx'];

/** Демо-файли з app/public/demo/, відносно адреси сторінки (працює і на GitHub Pages). */
export const fetchDataSource: DataSource = {
  loadTrack: () => fetchDemo('track.json').then((r) => r.json()),
  loadDemoGpx: () =>
    Promise.all(DEMO_GPX.map(async (name) => ({ name, text: await (await fetchDemo(name)).text() }))),
  loadDemoReference: () =>
    fetchDemo('amb-2026-10-01.json')
      .then((r) => r.json())
      .then((json: { lapTimes: number[] }) => json.lapTimes),
};

async function fetchDemo(name: string): Promise<Response> {
  const response = await fetch(new URL(`demo/${name}`, document.baseURI));
  if (!response.ok) throw new Error(`Не вдалося завантажити ${name}: ${response.status}`);
  return response;
}

/**
 * Монтує екран розбору в root.
 * Після кожного розбору (успішного чи з помилкою) root отримує подію `analysis-done` —
 * на неї чекає тест екрана.
 */
export function mountApp(root: HTMLElement, data: DataSource = fetchDataSource): void {
  const fileInput = h('input', {
    type: 'file',
    accept: '.gpx,application/gpx+xml',
    multiple: '',
    id: 'gpx-input',
    class: 'visually-hidden',
    'data-testid': 'gpx-input',
  });
  const pickLabel = h('label', { for: 'gpx-input', class: 'button primary' }, 'Обрати GPX-файли заїзду');
  const demoButton = h('button', { type: 'button', class: 'button', 'data-testid': 'demo-button' }, 'Демо-сесія');
  const status = h('div', { class: 'status', role: 'status', 'aria-live': 'polite', 'data-testid': 'status' });
  const output = h('div', { 'data-testid': 'output' });

  root.replaceChildren(
    h(
      'main',
      {},
      h(
        'header',
        { class: 'top' },
        h('h1', {}, 'Lap Coach'),
        h(
          'p',
          { class: 'lead' },
          'Розбір заїзду на картингу за GPS-записом з GoPro: кола, повороти, де втрачаєш час і що змінити.',
        ),
      ),
      h(
        'section',
        { class: 'controls', 'aria-label': 'Вибір заїзду' },
        pickLabel,
        fileInput,
        demoButton,
        h(
          'p',
          { class: 'hint' },
          'Можна обрати кілька частин одного запису (GH01…, GH02…). Файли обробляються у браузері й нікуди не вивантажуються. Траса — «Жага швидкості».',
        ),
      ),
      status,
      output,
    ),
  );

  let busy = false;
  const run = async (load: () => Promise<{ files: GpxFile[]; reference?: number[] }>) => {
    if (busy) return;
    busy = true;
    demoButton.disabled = true;
    fileInput.disabled = true;
    status.className = 'status';
    status.textContent = 'Обробляю запис…';
    output.replaceChildren();
    try {
      const [{ files, reference }, track] = await Promise.all([load(), data.loadTrack()]);
      // Дати браузеру намалювати «Обробляю…» перед важким розбором.
      await new Promise((resolve) => setTimeout(resolve, 0));
      const report = analyzeSession(files, track, reference);
      status.textContent = '';
      output.replaceChildren(renderReport(report));
    } catch (error) {
      status.className = 'status error';
      status.textContent =
        error instanceof InputError
          ? error.message
          : 'Щось пішло не так. Спробуйте ще раз або оберіть інші файли.';
      if (!(error instanceof InputError)) console.error(error);
    } finally {
      busy = false;
      demoButton.disabled = false;
      fileInput.disabled = false;
      root.dispatchEvent(new CustomEvent('analysis-done'));
    }
  };

  demoButton.addEventListener('click', () => {
    void run(async () => ({
      files: await data.loadDemoGpx(),
      reference: await data.loadDemoReference(),
    }));
  });

  // Посилання …/#demo одразу відкриває демо-сесію (для презентації і README).
  if (location.hash === '#demo') demoButton.click();

  fileInput.addEventListener('change', () => {
    const picked = Array.from(fileInput.files ?? []);
    if (picked.length === 0) return;
    void run(async () => ({
      files: await Promise.all(picked.map(async (file) => ({ name: file.name, text: await file.text() }))),
    }));
    fileInput.value = '';
  });
}
