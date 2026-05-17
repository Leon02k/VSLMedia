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

// Glass Cursor: weiche, sanft folgende Glas-Linse, die Buttons/Links spürt.
// Wird auf Touch-Geräten und bei reduce-motion-Präferenz unterdrückt (siehe CSS).
(() => {
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (coarse || reduced) return;

  const cursor = document.createElement('div');
  cursor.className = 'glass-cursor';
  cursor.setAttribute('aria-hidden', 'true');
  document.body.appendChild(cursor);

  let mx = -100, my = -100, cx = -100, cy = -100;
  let ready = false;

  window.addEventListener('pointermove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    if (!ready) {
      ready = true;
      cx = mx; cy = my;
      cursor.classList.add('is-ready');
    }
  });

  window.addEventListener('pointerdown', () => cursor.classList.add('is-press'));
  window.addEventListener('pointerup', () => cursor.classList.remove('is-press'));
  window.addEventListener('pointerleave', () => cursor.classList.remove('is-ready'));

  const hoverSelector = 'a, button, summary, .card, .testimonial, .video__placeholder, .nav__cta';
  document.querySelectorAll(hoverSelector).forEach((el) => {
    el.addEventListener('pointerenter', () => cursor.classList.add('is-hover'));
    el.addEventListener('pointerleave', () => cursor.classList.remove('is-hover'));
  });

  const ease = 0.14;
  function tick() {
    cx += (mx - cx) * ease;
    cy += (my - cy) * ease;
    cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();

// Click-to-load Vimeo: erst nach Nutzer-Interaktion wird Vimeo geladen.
// Vorher: kein Request an Vimeo, keine Cookies, kein Drittland-Transfer.
document.querySelectorAll('.video__placeholder[data-video-id]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const id = btn.dataset.videoId;
    const hash = btn.dataset.videoHash;
    const params = new URLSearchParams({ autoplay: '1', dnt: '1', pip: '0', portrait: '0', byline: '0', title: '0' });
    if (hash) params.set('h', hash);
    const iframe = document.createElement('iframe');
    iframe.src = `https://player.vimeo.com/video/${id}?${params}`;
    iframe.title = btn.getAttribute('aria-label') || 'Vimeo Video';
    iframe.loading = 'lazy';
    iframe.allow = 'autoplay; fullscreen; picture-in-picture; encrypted-media';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.setAttribute('allowfullscreen', '');
    iframe.className = 'video__iframe';
    btn.replaceWith(iframe);
  });
});
