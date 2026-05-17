// Reveal-on-scroll
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = parseInt(el.dataset.delay || '0', 10);
        setTimeout(() => el.classList.add('is-in'), delay);
        io.unobserve(el);
      }
    });
  },
  { threshold: 0.12 }
);
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

// Also fade in section headers / cards
document.querySelectorAll('.section__head, .card, .case, .process li').forEach((el, i) => {
  el.classList.add('reveal');
  el.dataset.delay = (i % 6) * 60;
  io.observe(el);
});

// Card spotlight follow
document.querySelectorAll('.card').forEach((card) => {
  card.addEventListener('pointermove', (e) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - r.left}px`);
    card.style.setProperty('--my', `${e.clientY - r.top}px`);
  });
});

// Testimonial Carousel: rotiert die drei Karten alle paar Sekunden weiter.
// Karten bleiben in DOM Reihenfolge stehen, nur die Slot Klassen
// (is-left, is-mid, is-right) wandern, damit Vimeo Iframes nicht neu laden.
(() => {
  const carousel = document.querySelector('.testimonials');
  if (!carousel) return;

  // Auf Mobile übernimmt CSS, kein Karussell
  const mq = window.matchMedia('(max-width: 900px)');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  const cards = Array.from(carousel.children).filter((el) => el.classList.contains('testimonial'));
  if (cards.length !== 3) return;

  const SLOTS = ['is-left', 'is-mid', 'is-right'];
  const INTERVAL_MS = 5500;

  function applySlots(offset) {
    cards.forEach((card, i) => {
      card.classList.remove(...SLOTS);
      card.classList.add(SLOTS[(i + offset) % cards.length]);
    });
  }

  let offset = 0;
  applySlots(offset);

  let timer = null;
  function start() {
    if (timer || mq.matches || reduced.matches) return;
    timer = setInterval(() => {
      offset = (offset + 1) % cards.length;
      applySlots(offset);
    }, INTERVAL_MS);
  }
  function stop() {
    if (timer) { clearInterval(timer); timer = null; }
  }

  start();

  // Auf Hover und nach Klick (User interagiert mit einem Video) Rotation stoppen
  carousel.addEventListener('pointerenter', stop);
  carousel.addEventListener('pointerleave', start);
  carousel.addEventListener('pointerdown', () => {
    stop();
    // Pause für 30 s, dann darf das Karussell wieder starten
    setTimeout(start, 30000);
  });

  // Reagiere auf Wechsel zwischen Mobile und Desktop
  mq.addEventListener?.('change', (e) => (e.matches ? stop() : start()));
  reduced.addEventListener?.('change', (e) => (e.matches ? stop() : start()));
})();

