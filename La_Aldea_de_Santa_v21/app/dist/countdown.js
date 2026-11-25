(() => {
  'use strict';
  const timer = document.querySelector('#christmas-countdown');
  if (!timer) return;
  const heading = document.querySelector('#countdown-title');
  const dateLabel = document.querySelector('#countdown-date');
  const fields = Object.fromEntries(['days', 'hours', 'minutes', 'seconds'].map(unit => [unit, timer.querySelector(`[data-countdown="${unit}"]`)]));

  function updateCountdown() {
    // Each visitor counts down to midnight on Christmas in their own city.
    // Recalculate from the clock on every tick, including after a sleeping tab.
    const now = new Date();
    const christmasDay = now.getMonth() === 11 && now.getDate() === 25;
    const year = now.getFullYear() + (now.getMonth() === 11 && now.getDate() > 25 ? 1 : 0);
    const target = new Date(year, 11, 25, 0, 0, 0, 0);
    let remaining = christmasDay ? 0 : Math.max(0, Math.ceil((target.getTime() - now.getTime()) / 1000));
    const days = Math.floor(remaining / 86400);
    remaining %= 86400;
    const hours = Math.floor(remaining / 3600);
    remaining %= 3600;
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    for (const [unit, value] of Object.entries({ days, hours, minutes, seconds })) {
      fields[unit].textContent = String(value).padStart(2, '0');
    }
    heading.textContent = christmasDay ? '¡Feliz Navidad!' : 'Faltan para Navidad';
    dateLabel.textContent = `25 de diciembre de ${year} · Según la hora de tu ciudad`;
    timer.classList.toggle('is-christmas', christmasDay);
    timer.setAttribute('aria-label', christmasDay ? '¡Feliz Navidad!' : `Faltan ${days} días, ${hours} horas, ${minutes} minutos y ${seconds} segundos para Navidad.`);
    timer.hidden = false;
  }

  updateCountdown();
  window.setInterval(updateCountdown, 1000);
  document.addEventListener('visibilitychange', updateCountdown);
  window.addEventListener('pageshow', updateCountdown);
})();
