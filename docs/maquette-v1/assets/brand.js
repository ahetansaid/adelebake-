/* Adélé Baké — logo recréé en SVG (d'après le logo fourni, en attendant la version vectorielle officielle).
   Usage : <a data-logo="light|dark" data-layout="row|stack"></a> */
(function () {
  const COPPER = ['#D39A67', '#A8643A', '#7C4424'];

  // Monogramme AB posé sur le toit, avec la fenêtre à 4 carreaux.
  function mark(id, tone) {
    const ink = tone === 'light' ? ['#F3D2B2', '#E0A574', '#C9854F'] : COPPER;
    return `
<svg class="ab-mark" viewBox="0 0 120 96" aria-hidden="true">
  <defs>
    <linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${ink[0]}"/><stop offset=".55" stop-color="${ink[1]}"/><stop offset="1" stop-color="${ink[2]}"/>
    </linearGradient>
  </defs>
  <text x="60" y="54" text-anchor="middle" font-family="Cinzel, serif" font-size="56" font-weight="500"
        letter-spacing="-6" fill="url(#${id})">AB</text>
  <path d="M4 92 C 26 82, 46 70, 60 58 C 74 70, 94 82, 116 92" fill="none" stroke="url(#${id})" stroke-width="3" stroke-linecap="round"/>
  <g fill="url(#${id})">
    <rect x="54.5" y="70" width="5" height="5" rx=".6"/><rect x="60.5" y="70" width="5" height="5" rx=".6"/>
    <rect x="54.5" y="76" width="5" height="5" rx=".6"/><rect x="60.5" y="76" width="5" height="5" rx=".6"/>
  </g>
</svg>`;
  }

  let n = 0;
  document.querySelectorAll('[data-logo]').forEach((el) => {
    const tone = el.dataset.logo || 'dark';
    const layout = el.dataset.layout || 'row';
    const id = 'abg' + n++;
    el.classList.add('ab-logo', 'ab-logo--' + layout, 'ab-logo--' + tone);
    el.setAttribute('aria-label', 'Adélé Baké — Guesthouse & Conference Venue');
    el.innerHTML = `${mark(id, tone)}
      <span class="ab-word"><span class="ab-name">Adélé Baké</span><span class="ab-tag">Guesthouse &amp; Conference Venue</span></span>`;
  });

  const css = `
  .ab-logo{display:inline-flex;align-items:center;gap:.7rem;text-decoration:none;color:inherit;line-height:1}
  .ab-logo--stack{flex-direction:column;gap:.45rem;text-align:center}
  .ab-mark{width:3.1rem;height:auto;flex:none}
  .ab-logo--stack .ab-mark{width:5.5rem}
  .ab-word{display:flex;flex-direction:column;gap:.3rem}
  .ab-name{font-family:Cinzel,serif;font-weight:600;font-size:1.12rem;letter-spacing:.14em;text-transform:uppercase;white-space:nowrap}
  .ab-tag{font-family:inherit;font-size:.56rem;letter-spacing:.24em;text-transform:uppercase;opacity:.8;white-space:nowrap}
  .ab-logo--dark .ab-name{color:#4A2A18}.ab-logo--dark .ab-tag{color:#7C4424}
  .ab-logo--light .ab-name{color:#FBEBDC}.ab-logo--light .ab-tag{color:#F0CFAF}
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
})();
