// Proposition 3 — moment phare : « Réserver en 4 étapes » — les flèches se tracent et les étapes
// s'allument l'une après l'autre au fil du défilement. En appui : dévoilement des arches, palme qui ondule.
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const EASE = 'cubic-bezier(.16,1,.3,1)';
lucide.createIcons();

// Menu mobile
const header = document.querySelector('.top');
const burger = document.querySelector('.top__burger');
burger.addEventListener('click', () => burger.setAttribute('aria-expanded', header.classList.toggle('is-open')));
document.querySelectorAll('.top__nav a').forEach(a => a.addEventListener('click', () => {
  header.classList.remove('is-open'); burger.setAttribute('aria-expanded', false);
}));

// Étapes liées au défilement
const steps = [...document.querySelectorAll('.steps li')];
const list = document.querySelector('.steps');
function progress() {
  const r = list.getBoundingClientRect();
  const p = Math.min(1, Math.max(0, (innerHeight * .9 - r.top) / (innerHeight * .45)));
  const seg = p * (steps.length - 1);
  steps.forEach((li, i) => {
    li.classList.toggle('is-on', seg >= i - .05);
    const local = Math.min(1, Math.max(0, seg - i));
    li.style.setProperty('--p', local.toFixed(3));
    li.style.setProperty('--o', local > .95 ? 1 : 0);
  });
}
if (reduce) steps.forEach(li => li.classList.add('is-on'));
else { addEventListener('scroll', progress, { passive: true }); progress(); }

// Lettre d'information (démo : pas d'envoi réel)
const form = document.querySelector('.news');
const msg = document.querySelector('.news__msg');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const v = form.querySelector('input').value.trim();
  msg.textContent = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
    ? 'Merci ! Vous recevrez nos prochaines nouvelles.'
    : 'Adresse e-mail invalide — vérifiez-la et réessayez.';
});

if (!reduce) {
  // Hero : texte, puis la photo qui glisse depuis la droite
  document.querySelectorAll('.hero__palm, .hero h1, .hero__copy p, .hero__copy .btn').forEach((el, i) => el.animate(
    [{ opacity: 0, transform: 'translateY(24px)' }, { opacity: 1, transform: 'none' }],
    { duration: 900, delay: 120 + i * 120, easing: EASE, fill: 'backwards' }));
  document.querySelector('.hero__pic img').animate(
    [{ transform: 'scale(1.1) translateX(40px)', opacity: 0 }, { transform: 'none', opacity: 1 }],
    { duration: 1600, easing: EASE, fill: 'backwards' });

  // Arches : dévoilement de bas en haut à l'entrée dans l'écran
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.animate([{ clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: 1200, easing: EASE });
    io.unobserve(e.target);
  }), { threshold: .25 });
  document.querySelectorAll('.arch, .services__pic img, .story__right img').forEach(el => io.observe(el));

  // Palme et monstera : léger balancement, seulement quand visibles
  const sway = [
    document.querySelector('.frond--l').animate(
      [{ transform: 'rotate(-18deg) scaleX(-1)' }, { transform: 'rotate(-13deg) scaleX(-1)' }],
      { duration: 4200, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' }),
    document.querySelector('.monstera').animate(
      [{ transform: 'rotate(-38deg)' }, { transform: 'rotate(-33deg)' }],
      { duration: 5200, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' }),
  ];
  new IntersectionObserver(([e]) => sway.forEach(a => e.isIntersecting ? a.play() : a.pause()))
    .observe(document.querySelector('.love'));
}
