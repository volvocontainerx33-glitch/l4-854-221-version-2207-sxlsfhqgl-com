(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return (value || '').toString().toLowerCase().trim();
  }

  function setupMenu() {
    var button = document.querySelector('[data-menu-button]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = selectAll('[data-hero-slide]', hero);
    var dots = selectAll('[data-hero-dot]', hero);
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
      });
    });
    if (slides.length > 1) {
      window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
  }

  function setupFilters() {
    var searchInputs = selectAll('[data-movie-search]');
    var groups = selectAll('[data-filter-group]');
    function activeFilter() {
      var active = document.querySelector('.filter-chip.active');
      return active ? active.getAttribute('data-filter-value') : '全部';
    }
    function apply() {
      var query = '';
      searchInputs.forEach(function (input) {
        if (input.value) {
          query = normalize(input.value);
        }
      });
      var filter = activeFilter();
      selectAll('[data-movie-card]').forEach(function (card) {
        var haystack = normalize(card.getAttribute('data-search'));
        var type = card.getAttribute('data-type') || '';
        var matchesText = !query || haystack.indexOf(query) !== -1;
        var matchesFilter = filter === '全部' || type.indexOf(filter) !== -1 || haystack.indexOf(normalize(filter)) !== -1;
        card.setAttribute('data-hidden', matchesText && matchesFilter ? 'false' : 'true');
      });
    }
    searchInputs.forEach(function (input) {
      var param = input.getAttribute('data-query-param');
      if (param) {
        var params = new URLSearchParams(window.location.search);
        var value = params.get(param);
        if (value) {
          input.value = value;
        }
      }
      input.addEventListener('input', apply);
    });
    groups.forEach(function (group) {
      selectAll('.filter-chip', group).forEach(function (button) {
        button.addEventListener('click', function () {
          selectAll('.filter-chip', group).forEach(function (item) {
            item.classList.remove('active');
          });
          button.classList.add('active');
          apply();
        });
      });
    });
    if (searchInputs.length || groups.length) {
      apply();
    }
  }

  window.startMoviePlayer = function (options) {
    var video = document.getElementById(options.videoId);
    var overlay = document.getElementById(options.overlayId);
    var loaded = false;
    var hlsInstance = null;
    if (!video || !overlay || !options.src) {
      return;
    }
    function attach() {
      if (!loaded) {
        loaded = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = options.src;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hlsInstance.loadSource(options.src);
          hlsInstance.attachMedia(video);
        } else {
          video.src = options.src;
        }
      }
      overlay.style.display = 'none';
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }
    overlay.addEventListener('click', attach);
    video.addEventListener('click', function () {
      if (!loaded) {
        attach();
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
