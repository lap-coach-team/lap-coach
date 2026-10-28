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
