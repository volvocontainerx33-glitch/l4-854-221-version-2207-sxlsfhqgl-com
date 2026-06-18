(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = all('[data-hero-slide]', hero);
    var dots = all('[data-hero-dot]', hero);
    if (!slides.length) {
      return;
    }
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', (dotIndex % slides.length) === current);
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index % slides.length);
      });
    });
    show(0);
    if (slides.length > 1) {
      window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }
  }

  function setupFilters() {
    var panels = all('[data-filter-scope]');
    panels.forEach(function (scope) {
      var input = scope.querySelector('[data-filter-input]');
      var select = scope.querySelector('[data-filter-select]');
      var cards = all('[data-filter-card]', scope);
      var empty = scope.querySelector('[data-filter-empty]');
      function apply() {
        var q = input ? input.value.trim().toLowerCase() : '';
        var chosen = select ? select.value : '';
        var shown = 0;
        cards.forEach(function (card) {
          var haystack = (card.getAttribute('data-search') || '').toLowerCase();
          var type = card.getAttribute('data-type') || '';
          var year = card.getAttribute('data-year') || '';
          var category = card.getAttribute('data-category') || '';
          var passText = !q || haystack.indexOf(q) !== -1;
          var passSelect = !chosen || type === chosen || year === chosen || category === chosen;
          var pass = passText && passSelect;
          card.hidden = !pass;
          if (pass) {
            shown += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('is-visible', shown === 0);
        }
      }
      if (input) {
        input.addEventListener('input', apply);
      }
      if (select) {
        select.addEventListener('change', apply);
      }
      apply();
    });
  }

  function setupSearchPage() {
    var input = document.querySelector('[data-search-page-input]');
    if (!input) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    if (q) {
      input.value = q;
      input.dispatchEvent(new Event('input'));
    }
  }

  function setupPlayers() {
    all('[data-player]').forEach(function (player) {
      var video = player.querySelector('video');
      var overlay = player.querySelector('[data-video-start]');
      if (!video || !overlay) {
        return;
      }
      var source = video.getAttribute('data-video-src') || '';
      var ready = false;
      var hlsInstance = null;
      function attachSource() {
        if (ready || !source) {
          return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else {
          video.src = source;
        }
        ready = true;
      }
      function start() {
        attachSource();
        overlay.classList.add('is-hidden');
        video.controls = true;
        var playResult = video.play();
        if (playResult && typeof playResult.catch === 'function') {
          playResult.catch(function () {
            overlay.classList.remove('is-hidden');
          });
        }
      }
      overlay.addEventListener('click', start);
      video.addEventListener('click', function () {
        if (video.paused) {
          start();
        }
      });
      video.addEventListener('error', function () {
        overlay.classList.remove('is-hidden');
      });
      window.addEventListener('pagehide', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupSearchPage();
    setupPlayers();
  });
})();
