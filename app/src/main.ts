import './style.css';

// Тимчасова сторінка. Екран розбору — задача «Екран розбору заїзду».
document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <main>
    <h1>Lap Coach</h1>
    <p>Розбір заїзду за GPS-записом з GoPro. Екран розбору — у роботі.</p>
  </main>
`;
