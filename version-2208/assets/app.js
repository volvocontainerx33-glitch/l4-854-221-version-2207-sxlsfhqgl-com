const q = (selector, scope = document) => scope.querySelector(selector);
const qa = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

function initMobileNav() {
  const toggle = q('[data-mobile-toggle]');
  const panel = q('[data-mobile-panel]');
  if (!toggle || !panel) {
    return;
  }
  toggle.addEventListener('click', () => {
    panel.classList.toggle('is-open');
  });
}

function initHero() {
  const hero = q('[data-hero]');
  if (!hero) {
    return;
  }
  const slides = qa('[data-hero-slide]', hero);
  const dots = qa('[data-hero-dot]', hero);
  if (!slides.length) {
    return;
  }
  let active = 0;
  const show = (index) => {
    active = (index + slides.length) % slides.length;
    slides.forEach((slide, idx) => slide.classList.toggle('active', idx === active));
    dots.forEach((dot, idx) => dot.classList.toggle('active', idx === active));
  };
  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => show(idx));
  });
  window.setInterval(() => show(active + 1), 5200);
}

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

function initFilters() {
  const input = q('[data-filter-input]');
  const list = q('[data-filter-list]');
  if (!input || !list) {
    return;
  }
  const cards = qa('.movie-card', list);
  const emptyState = q('[data-empty-state]');
  const params = new URLSearchParams(window.location.search);
  const initial = params.get('q') || '';
  if (initial) {
    input.value = initial;
  }
  const apply = () => {
    const term = normalize(input.value);
    let visible = 0;
    cards.forEach((card) => {
      const text = normalize([
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.tags,
        card.textContent
      ].join(' '));
      const matched = !term || text.includes(term);
      card.hidden = !matched;
      if (matched) {
        visible += 1;
      }
    });
    if (emptyState) {
      emptyState.hidden = visible !== 0;
    }
  };
  input.addEventListener('input', apply);
  apply();
}

async function attachStream(video, stream) {
  if (video.dataset.ready === 'true') {
    return;
  }
  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = stream;
    video.dataset.ready = 'true';
    return;
  }
  const module = await import('./hls-vendor-dru42stk.js');
  const Hls = module.H;
  if (Hls && Hls.isSupported()) {
    const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
    hls.loadSource(stream);
    hls.attachMedia(video);
    video.dataset.ready = 'true';
    return;
  }
  video.src = stream;
  video.dataset.ready = 'true';
}

function initPlayers() {
  qa('[data-player]').forEach((player) => {
    const video = q('video', player);
    const button = q('[data-play-button]', player);
    if (!video || !button) {
      return;
    }
    const play = async () => {
      const stream = video.getAttribute('data-stream');
      if (!stream) {
        return;
      }
      button.classList.add('is-hidden');
      await attachStream(video, stream);
      try {
        await video.play();
      } catch (error) {
        button.classList.remove('is-hidden');
      }
    };
    button.addEventListener('click', play);
    player.addEventListener('click', (event) => {
      if (event.target === video && video.paused) {
        play();
      }
    });
    video.addEventListener('play', () => button.classList.add('is-hidden'));
    video.addEventListener('pause', () => {
      if (!video.currentTime) {
        button.classList.remove('is-hidden');
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initHero();
  initFilters();
  initPlayers();
});
