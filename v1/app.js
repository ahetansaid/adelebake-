// Proposition 1 — moment phare : révélation en volet (clip-path) depuis la vignette choisie.
const WHATSAPP = '2290162252194'; // à confirmer avec l'établissement
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

lucide.createIcons();

// En-tête : devient opaque au défilement ; menu mobile
const header = document.querySelector('.top');
const onScroll = () => header.classList.toggle('is-solid', scrollY > 40);
addEventListener('scroll', onScroll, { passive: true }); onScroll();
const burger = document.querySelector('.top__burger');
burger.addEventListener('click', () => {
  const open = header.classList.toggle('is-open');
  burger.setAttribute('aria-expanded', open);
});
document.querySelectorAll('.top__nav a').forEach(a => a.addEventListener('click', () => {
  header.classList.remove('is-open'); burger.setAttribute('aria-expanded', false);
}));

// Diaporama
const slides = [...document.querySelectorAll('.slide')];
const tabs = [...document.querySelectorAll('.hero__thumbs button')];
const DUR = 6000;
let cur = 0, timer;
document.documentElement.style.setProperty('--dur', DUR + 'ms');

function go(i) {
  if (i === cur) return;
  const prev = slides[cur];
  prev.classList.add('is-leaving');
  prev.classList.remove('is-active');
  slides[i].classList.add('is-active');
  setTimeout(() => prev.classList.remove('is-leaving'), 1100);
  tabs.forEach((t, k) => t.setAttribute('aria-selected', k === i));
  cur = i;
  restart();
}
function restart() {
  clearTimeout(timer);
  if (document.hidden) return;
  timer = setTimeout(() => go((cur + 1) % slides.length), DUR);
}
tabs.forEach((t, i) => t.addEventListener('click', () => go(i)));
document.addEventListener('visibilitychange', restart);
restart();

// Titre : les trois salutations arrivent l'une après l'autre
if (!reduce) {
  document.querySelectorAll('.hero__title span').forEach((s, i) => {
    s.animate(
      [{ opacity: 0, transform: 'translateY(40px)', filter: 'blur(8px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }],
      { duration: 900, delay: 150 + i * 180, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' }
    );
  });
  document.querySelector('.book').classList.add('is-in');
}

// Réservation → message WhatsApp pré-rempli
const form = document.querySelector('.book');
const today = new Date().toISOString().slice(0, 10);
form.in.min = today; form.out.min = today;
form.in.addEventListener('change', () => { form.out.min = form.in.value; });
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const msg = form.querySelector('.book__msg');
  if (form.out.value <= form.in.value) { msg.textContent = 'La date de départ doit être après la date d\'arrivée.'; return; }
  const fmt = (d) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  const text = `Bonjour Adélé Baké, je souhaite réserver du ${fmt(form.in.value)} au ${fmt(form.out.value)} pour ${form.ad.value} adulte(s) et ${form.ch.value} enfant(s). Merci !`;
  msg.textContent = 'Ouverture de WhatsApp…';
  window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
});
