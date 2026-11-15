# UML: модель системи Lap Coach

Дві діаграми MVP: що пілот робить у застосунку (прецеденти) і з яких модулів складається розбір заїзду (компоненти).


---

## 1. Діаграма прецедентів

```mermaid
flowchart LR
    pilot["«актор»<br/>Пілот"]

    subgraph mvp["Lap Coach — етап 4"]
        uc1(("Відкрити<br/>застосунок"))
        uc2(("Завантажити<br/>GPX-файли заїзду"))
        uc3(("Відкрити<br/>демо-сесію"))
        uc4(("Переглянути<br/>таблицю кіл"))
        uc5(("Переглянути повороти<br/>за втратою часу"))
        uc6(("Переглянути<br/>поради"))
        uc7(("Перейти від поради<br/>до повороту"))
    end

    subgraph later["Після етапу 4"]
        uc8(("Завантажити<br/>відео MP4"))
        uc9(("Карта<br/>траси"))
    end

    pilot --- uc1
    pilot --- uc2
    pilot --- uc3
    pilot --- uc4
    pilot --- uc5
    pilot --- uc6
    uc7 -. "«extend»" .-> uc6

    pilot -.- uc8
    pilot -.- uc9

    classDef future stroke-dasharray: 5 5,color:#888
    class uc8,uc9 future
    style later stroke-dasharray: 5 5
```

Пілот відкриває застосунок і дає йому заїзд одним із двох способів: завантажує свої GPX-файли або відкриває демо-сесію «Жаги швидкості». Після цього він бачить три частини одного екрана розбору: таблицю кіл, повороти, відсортовані за втраченим часом, і поради. Перехід від поради до повороту розширює перегляд порад («extend»). Завантаження відео MP4 і карта траси позначені пунктиром: їх робимо після етапу 4.

## 2. Діаграма компонентів

```mermaid
flowchart LR
    subgraph data["Дані"]
        gpx[("GPX-файли заїзду<br/>(свої або демо)")]
        track[("track.json<br/>конфігурація траси")]
        amb[("amb-*.json<br/>офіційний хронометраж")]
    end

    ui["Екран розбору (UI)"]

    subgraph analyze["analyzeSession — розбір у браузері"]
        parseGpx["parseGpx"]
        parseTrack["parseTrack"]
        buildSession["buildSession"]
        splitLaps["splitLaps"]
        filterLaps["filterLaps"]
        analyzeCorners["analyzeCorners"]
        sortByLoss["sortByLoss"]
        buildAdvice["buildAdvice"]
        compare["compareWithReference"]
    end

    gpx -->|"текст GPX"| ui
    ui -->|"файли GPX"| parseGpx
    track --> parseTrack
    amb --> compare

    parseGpx -->|"GpxPoint[]"| buildSession
    buildSession -->|"Session"| splitLaps
    parseTrack -->|"Track"| splitLaps
    splitLaps -->|"Lap[]"| filterLaps
    filterLaps -->|"Lap[]"| analyzeCorners
    parseTrack -->|"Track"| analyzeCorners
    analyzeCorners -->|"CornerResult[]"| sortByLoss
    sortByLoss -->|"CornerResult[]"| buildAdvice
    filterLaps -->|"Lap[]"| compare

    filterLaps -->|"Lap[]"| ui
    sortByLoss -->|"CornerResult[]"| ui
    buildAdvice -->|"Advice[]"| ui
    compare -->|"похибка кола, с"| ui
```

Екран розбору передає GPX-файли в `analyzeSession` — конвеєр, який повністю працює в браузері, без сервера (B-18). `parseGpx` і `buildSession` збирають точки з усіх файлів в одну сесію; `splitLaps` ділить її на кола за лінією старту/фінішу з `track.json`, `filterLaps` відкидає виїзне коло, а `analyzeCorners`, `sortByLoss` і `buildAdvice` рахують втрати в поворотах і поради. Назад на екран ідуть три результати — `Lap[]`, `CornerResult[]` і `Advice[]`, а `compareWithReference` порівнює кола з `amb-*.json` і показує похибку проти офіційного хронометражу (ціль — ≤ 0,05 с, B-21).
