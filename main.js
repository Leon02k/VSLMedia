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

