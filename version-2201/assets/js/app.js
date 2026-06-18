(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startTimer();
      });
    });

    startTimer();
  }

  function normalizeText(value) {
    return String(value || '').trim().toLowerCase();
  }

  function bindCardFilter(form) {
    var input = form.querySelector('input');
    var section = form.closest('section') || document;
    var cards = Array.prototype.slice.call(section.querySelectorAll('.movie-card'));

    if (!input || !cards.length) {
      return;
    }

    input.addEventListener('input', function () {
      var query = normalizeText(input.value);

      cards.forEach(function (card) {
        var text = normalizeText([
          card.getAttribute('data-title'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.textContent
        ].join(' '));

        card.classList.toggle('is-filtered-out', query && text.indexOf(query) === -1);
      });
    });
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-card-filter]'), bindCardFilter);

  var searchList = document.querySelector('[data-search-list]');
  var searchInput = document.querySelector('[data-search-input]');
  var emptyMessage = document.querySelector('[data-empty-message]');

  if (searchList && searchInput) {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    searchInput.value = initialQuery;

    function runSearch() {
      var query = normalizeText(searchInput.value);
      var cards = Array.prototype.slice.call(searchList.querySelectorAll('.movie-card'));
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalizeText([
          card.getAttribute('data-title'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.textContent
        ].join(' '));
        var matched = !query || text.indexOf(query) !== -1;
        card.classList.toggle('is-filtered-out', !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (emptyMessage) {
        emptyMessage.classList.toggle('is-visible', visible === 0);
      }
    }

    searchInput.addEventListener('input', runSearch);
    runSearch();
  }

  function bindPlayer(player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('[data-play]');

    if (!video || !overlay) {
      return;
    }

    var mediaUrl = video.getAttribute('data-stream');
    var loaded = false;
    var hlsInstance = null;

    function attachMedia() {
      if (loaded) {
        return;
      }

      loaded = true;
      video.setAttribute('controls', 'controls');

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hlsInstance.loadSource(mediaUrl);
        hlsInstance.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = mediaUrl;
      } else {
        video.src = mediaUrl;
      }
    }

    function playMedia() {
      attachMedia();
      overlay.classList.add('is-hidden');
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          overlay.classList.remove('is-hidden');
        });
      }
    }

    overlay.addEventListener('click', playMedia);

    video.addEventListener('play', function () {
      overlay.classList.add('is-hidden');
    });

    video.addEventListener('ended', function () {
      overlay.classList.remove('is-hidden');
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-player]'), bindPlayer);
})();
