# Цифровий тренер для автоспорту

Командний студентський проєкт. Вебзастосунок, який перетворює GPS-запис з екшн-камери чи телефона на розбір заїзду з порадами для новачків і аматорів.

## Етапи

Матеріали кожного етапу лежать у `docs/stages/stage-N/`.

### Етап 1. Вибір теми

Ми розглянули дві теми: «Цифровий тренер для автоспорту» і «Розумний кошик для товарів». Для кожної написали опис і SWOT-аналіз, порівняли теми за п'ятьма зваженими критеріями й обрали цифрового тренера.

- [Decision.md](docs/stages/stage-1/Decision.md) — критерії, порівняння, обґрунтування, ризики, наступні кроки
- [lap-coach/](docs/stages/stage-1/lap-coach/) — опис, SWOT і макет розбору заїзду
- [smart-grocery/](docs/stages/stage-1/smart-grocery/) — опис і SWOT альтернативної теми
- [presentation/](docs/stages/stage-1/presentation/) — презентація (LaTeX Beamer), збирання: `make pdf`

### Етап 2. Продукт

Ми описали продукт: для кого він, які болі закриває, які функції входять у перший реліз і як він може заробляти. Додали місію, North Star metric, tone of voice і тарифи-гіпотезу (freemium) та склали Lean Canvas.

- [Product-Map.md](docs/stages/stage-2/Product-Map.md) — карта продукту: місія, цінність, користувачі, функції, конкуренти, бізнес-модель, метрики
- [product-map.pdf](docs/stages/stage-2/product-map.pdf) — карта продукту на одному слайді (TikZ, [джерело](docs/stages/stage-2/product-map.tex)), збирання: `latexmk -xelatex product-map.tex`
- [lean-canvas.pdf](docs/stages/stage-2/lean-canvas.pdf) — Lean Canvas

### Етап 3. Планування

Ми спланували проєкт на рік, з листопада 2026 до жовтня 2027. Описали цілі, обсяг і обмеження, склали перелік робіт із діаграмою Ґанта і розподілили відповідальність у RACI-матриці. Сформували беклог із 45 задач і розставили пріоритети за матрицею Ейзенхауера. Визначили обсяг MVP на модуль 2: 18 задач на 48 годин.

- [Project-Overview.md](docs/stages/stage-3/Project-Overview.md) — опис проєкту, цілі на курс і на рік, обсяг, очікувані результати, обмеження, ризики
- [Roadmap.md](docs/stages/stage-3/Roadmap.md) — перелік робіт за фазами; діаграма Ґанта — [gantt.pdf](docs/stages/stage-3/gantt.pdf)
- [RACI.md](docs/stages/stage-3/RACI.md) — розподіл відповідальності за роботами і навантаження по місяцях
- [Backlog.pdf](docs/stages/stage-3/Backlog.pdf) — беклог продукту: ID, фаза, пріоритет MoSCoW, оцінки й залежності
- [Eisenhower.pdf](docs/stages/stage-3/Eisenhower.pdf) — матриця Ейзенхауера за задачами беклогу
- [Semester_Scope.md](docs/stages/stage-3/Semester_Scope.md) — обсяг робіт на модуль 2 (MVP): ресурс, задачі, що переходить у бету, розподіл по людях, Definition of Done і сценарій демо
- [presentation/](docs/stages/stage-3/presentation/) — презентація (LaTeX Beamer), збирання: `make pdf` (слайди), `make notes` (з нотатками доповідача), `make speech` (текст виступу)
