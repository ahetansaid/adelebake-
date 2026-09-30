// Proposition 2 — moment phare : la bande jaune se creuse, puis les pastilles s'y posent une à une
// et leurs icônes se dessinent. Le repère « Adélé Baké » tombe sur le plan à l'arrivée sur le quartier.
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const EASE = 'cubic-bezier(.16,1,.3,1)';
lucide.createIcons();

// Menu mobile
const bar = document.querySelector('.bar');
const burger = document.querySelector('.bar__burger');
burger.addEventListener('click', () => burger.setAttribute('aria-expanded', bar.classList.toggle('is-open')));
document.querySelectorAll('.bar__nav a').forEach(a => a.addEventListener('click', () => {
  bar.classList.remove('is-open'); burger.setAttribute('aria-expanded', false);
}));

if (!reduce) {
  // Titre et accroche
  document.querySelectorAll('.hero h1, .hero__copy p, .hero__icons a').forEach((el, i) => el.animate(
    [{ opacity: 0, transform: 'translateY(26px)', filter: 'blur(8px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }],
    { duration: 950, delay: 120 + i * 110, easing: EASE, fill: 'backwards' }));
  document.querySelector('.hero__img').animate([{ transform: 'scale(1.08)' }, { transform: 'scale(1)' }], { duration: 2600, easing: EASE });

  // Bande jaune : les courbes se creusent depuis une ligne droite
  const flat = (y) => `path("M0 ${y} Q720 ${y} 1440 ${y} V120 H0Z")`;
  document.querySelector('.c-yellow').animate([{ d: flat(120) }, { d: 'path("M0 0 Q720 90 1440 0 V120 H0Z")' }],
    { duration: 1100, delay: 300, easing: EASE, fill: 'backwards' });
  document.querySelector('.c-white').animate([{ d: flat(120) }, { d: 'path("M0 34 Q720 128 1440 34 V120 H0Z")' }],
    { duration: 1100, delay: 420, easing: EASE, fill: 'backwards' });

  // Pastilles puis tracé des icônes
  document.querySelectorAll('.quick a').forEach((a, i) => {
    const delay = 780 + i * 110;
    a.querySelector('.bubble').animate(
      [{ opacity: 0, transform: 'translateY(40px) scale(.6)' }, { opacity: 1, transform: 'none' }],
      { duration: 800, delay, easing: EASE, fill: 'backwards' });
    a.querySelectorAll('.bubble svg > *').forEach((el) => {
      const len = el.getTotalLength ? Math.ceil(el.getTotalLength()) : 100;
      el.animate([{ strokeDasharray: len, strokeDashoffset: len }, { strokeDasharray: len, strokeDashoffset: 0 }],
        { duration: 900, delay: delay + 250, easing: 'ease-out', fill: 'backwards' });
    });
  });

  // Plan : le repère tombe, les étiquettes suivent
  const pin = document.querySelector('.pinmark');
  const tags = [...document.querySelectorAll('.tag')];
  new IntersectionObserver((entries, io) => {
    if (!entries[0].isIntersecting) return;
    pin.animate([{ transform: 'translateY(-60px)', opacity: 0 }, { transform: 'none', opacity: 1 }],
      { duration: 800, easing: 'cubic-bezier(.34,1.3,.64,1)', fill: 'backwards' });
    tags.forEach((t, i) => t.animate([{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'none' }],
      { duration: 500, delay: 400 + i * 120, easing: EASE, fill: 'backwards' }));
    io.disconnect();
  }, { threshold: .35 }).observe(document.querySelector('.sticker'));
}

// Agenda : boutons précédent / suivant, glisser à la souris
const track = document.querySelector('.agenda__track');
const [prev, next] = document.querySelectorAll('.agenda__nav .round');
const step = () => track.querySelector('.ev').offsetWidth + parseFloat(getComputedStyle(track).columnGap);
prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: reduce ? 'auto' : 'smooth' }));
next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: reduce ? 'auto' : 'smooth' }));
const sync = () => {
  prev.disabled = track.scrollLeft < 4;
  next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
};
track.addEventListener('scroll', sync, { passive: true }); sync();
let sx = 0, sl = 0, down = false;
track.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') return; down = true; sx = e.clientX; sl = track.scrollLeft; track.classList.add('is-drag'); });
addEventListener('pointermove', (e) => { if (down) track.scrollLeft = sl - (e.clientX - sx); });
addEventListener('pointerup', () => { down = false; track.classList.remove('is-drag'); });
