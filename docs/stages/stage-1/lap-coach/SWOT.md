# SWOT-аналіз: Цифровий тренер для автоспорту

Вебзастосунок, який перетворює GPS-запис з екшн-камери чи телефона на розбір заїзду з порадами для новачків і аматорів.

---

## S — Сильні сторони

- **Не потрібне нове обладнання.** Застосунок працює з камерою чи телефоном, які у пілота вже є. Для порівняння: найближчий за ідеєю пристрій-«тренер» Garmin Catalyst 2 має рекомендовану ціну $1,199.99 [1]; AiM Solo 2 продається приблизно за $777 [2].
- **Дані з екшн-камери придатні для аналізу.** GPS був у всіх флагманах GoPro, починаючи з HERO5 (2016) [3]. За даними розробників, які розібрали формат, у відео записуються гіроскоп ~400 Гц, акселерометр ~200 Гц і GPS-позиція ~18 Гц [4]. Ці цифри неофіційні, але відтворювані.
- **Відкритий формат даних.** GoPro розробила формат GPMF, щоб телеметрія зберігалася всередині самого відеофайлу [5]. Для розбору вже є бібліотеки з відкритим кодом (наприклад, gopro-telemetry для HERO5 і новіших) [6].
- **Поради простою мовою, а не графіки.** Професійні рішення на кшталт AiM пропонують аналіз даних у програмі Race Studio 3 [7], тобто розраховані на тих, хто вже вміє читати телеметрію.
- **Точність GPS у GoPro перевірена на реальній сесії.** У нашому демо (GoPro HERO7, 14 кіл) час кола за GPS відрізнявся від офіційного хронометражу AMB в середньому на 0,035 с, максимум на 0,14 с. Розкид траєкторії на прямих — до 0,40 м, точку гальмування видно з точністю близько ±2 м [25]. Але біля мосту надійність лінії низька через відбиття сигналу [25].
- **Межі траси можна отримати без виїзду на трасу.** У демо межі обведено за супутниковими знімками Esri: від місця, де їздили карти, до зміни кольору покриття. 95% точок межі визначено впевнено [25].

## W — Слабкі сторони

- **Точність GPS у телефоні.** Смартфони зазвичай визначають позицію з точністю до 4,9 м під відкритим небом; біля будівель, мостів і дерев точність гірша [8]. Це одного порядку з різницею, яку хочемо показувати («гальмуєш на 10 м раніше»). Спеціалізовані приймачі (RaceBox Mini) заявляють 25 Гц і точність до 10 см [9].
- **Залежність від кріплення телефона.** Розробники RaceChrono зазначають, що вбудований GPS погано працює або не працює зовсім, якщо телефон у кишені чи на сидінні [10].
- **Закриті картодроми.** У закритих приміщеннях GPS-сигнал зникає, і час там вимірюють транспондерами [11]. Водночас значна частина прокатного картингу проходить у залах (наприклад, K1 Speed — оператор критих картодромів) [12].
- **Не всі камери мають GPS.** У GoPro HERO12 Black GPS прибрали заради часу роботи [3]; у HERO13 його повернули [13].
- **Лише аналіз після заїзду.** Garmin Catalyst 2 дає голосові підказки в реальному часі [1].
- **Межі траси з відео поки не будуються.** У демо відео використано лише у двох поворотах (T2, T4). Там супутник показував асфальт з'єднувальної дороги, а на відео видно шинний відбійник. Відстань від колеса до шин оцінювали з кадру [25]. 91% точок межі взято з фото з дрона, яке надав пілот, решту — із супутника [25]. Без такого фото межа невпевнена там, де шини перекривають з'єднувальні дороги, а дерева закривають трасу зверху.

## O — Можливості

- **Живий тренер дорогий.** Хороший картинговий тренер коштує €250–350 на день плюс €100–150 витрат [14]. Групова академія K1 Speed — $139 з пілота [15].
- **Попит на AI-тренерів підтверджений інвестиціями.** Track Titan залучив $5 млн посівних інвестицій, орієнтується на аматорів і заявляє понад 200 000 користувачів [16]; за їхніми даними, користувачі в середньому покращують найкраще коло більш ніж на 0,5 с після першої сесії [17].
- **Ріст прокатного картингу.** K1 Speed має 107 локацій [12], понад 50 000 відвідувачів на центр на рік [18], планує рекордні 14 відкриттів за рік і розвиває ліги [19].
- **Інтеграція із зовнішніми GPS.** RaceBox публікує документацію протоколу для використання у власних застосунках [9] — спосіб частково закрити проблему точності.

## T — Загрози

- **Прямі конкуренти з AI-тренером для картингу вже існують.** Tenth Finder показує, в якому повороті втрачається час, через яку помилку і що змінити, для прокатного картингу та гонок [20]. Kart Track перетворює дані MyChron/Alfano на пріоритезований список втрат часу [21].
- **Дешеві аналітичні застосунки з великою аудиторією.** RaceChrono Pro коштує $19.99, має понад 100 000 активних користувачів, оптимальне коло, графік дельти, базу 2600+ трас і синхронізацію з відео з екшн-камер [22]. Готових порад не дає, але закриває частину потреби.
- **Великі гравці можуть увійти в нішу.** Track Titan планує розширюватися і в реальний автоспорт [16]. Garmin уже має True Optimal Lap — найкращий досяжний час із відео траєкторій пілота [1].
- **Залежність від виробників камер.** Випадок HERO12 показав, що GPS можуть прибрати з нової моделі [3].

---

## Обмеження аналізу

- Звіти про «ринок картингу» рахують продажі картів, а не кількість пілотів-аматорів, і цифри розходяться: $147,5 млн у 2023 [23] проти $181,5 млн у 2024 [24]. Для оцінки аудиторії вони майже не придатні.
- Дані про український ринок (картодроми, трек-дні) не досліджувалися.
- Частота GPS у GoPro (~18 Гц) взята з розбору формату розробниками, а не з офіційної специфікації. Демо показує ті самі 18 Гц для HERO7 [25].
- Дані демо — це одна сесія одного пілота на одній відкритій трасі в Києві. З демо не видно, які кроки виконано автоматично, а які вручну.
- Умови використання супутникових знімків Esri у власному продукті не перевірялися.

## Джерела

1. [Garmin Catalyst 2 — анонс (Barchart)](https://www.barchart.com/story/news/251647/optimize-time-on-the-track-with-the-cutting-edge-garmin-catalyst-2)
2. [AiM Solo2 Lap Timer — Perry Auto Laval](https://perryautolaval.com/products/aim-solo2-lap-timer)
3. [GoPro removes GPS from Hero12 — Digital Camera World](https://www.digitalcameraworld.com/news/gopro-literally-loses-its-way-as-it-removes-gps-from-new-gopro-hero12-black)
4. [gopro-utils (GitHub)](https://github.com/KonradIT/gopro-utils)
5. [GoPro's GPMF open sources video metadata — Newsshooter](https://www.newsshooter.com/2017/05/26/gopro-gpmf-open-sources-video-metadata/)
6. [gopro-telemetry (npm)](https://npmjs.com/package/gopro-telemetry)
7. [AiM Solo 2 DL — Harris Race Radios](https://www.harrisraceradios.com/product/aim-motorsport-aim-motorsport-solo-2-dl-gps-lap-timer-with-ecu-input/)
8. [GPS Accuracy — GPS.gov](https://www.gps.gov/systems/gps/performance/accuracy/)
9. [RaceBox Mini — Mode Auto Concepts](https://modeautoconcepts.com/es/products/racebox-mini-automotive-performance-lap-timer-drag-meter)
10. [RaceChrono FAQ: GPS accuracy](https://racechrono.com/article/faq/why-does-the-travel-path-show-that-im-off-road-or-the-speed-is-incorrect-at-places)
11. [GPS Accuracy in Karting — Purpl](https://purpl.app/blog/gps-lap-timer-accuracy/)
12. [K1 Speed — Wikipedia](https://en.wikipedia.org/wiki/K1_Speed)
13. [GoPro Hero 13 vs Hero 12 — TechRadar](https://www.techradar.com/cameras/action-cameras/gopro-hero-13-black-vs-gopro-hero-12-black-5-headline-upgrades-in-gopros-latest-flagship)
14. [Karting Coach Costs — Purpl](https://purpl.app/blog/karting-coach-cost/)
15. [K1 Karting Academy Canton — K1 Speed](https://www.k1speed.com/blog/canton-karting-academy.html)
16. [Track Titan raises $5m — IT Brief UK](https://itbrief.co.uk/story/track-titan-raises-usd-5m-to-power-ai-racing-coaching)
17. [Track Titan raises $5M — Tech.eu](https://tech.eu/2025/12/04/track-titan-raises-5m-for-ai-powered-strava-for-motorsport/)
18. [K1 Speed — Verlinvest](https://verlinvest.com/brands/k1speed)
19. [A Need for K1 Speed — OCBJ](https://www.ocbj.com/tourism/recreation/a-need-for-k1-speed/)
20. [Tenth Finder — MWM](https://mwm.ai/apps/tenth-finder/6758552858)
21. [Kart Track: Telemetry & Setup — App Store](https://apps.apple.com/fi/app/id6742863546)
22. [RaceChrono Pro — App Store](https://apps.apple.com/app/id1129429340)
23. [Go Kart Market — GMI](https://www.gminsights.com/industry-analysis/go-kart-market)
24. [Global Go Kart Market Report — GII Korea](https://www.giikorea.co.kr/report/vmr1820608-global-go-kart-market-research-report-industry.html)
25. [Демо розбору заїзду, розділ «How this was measured»](Karting-session.html)
