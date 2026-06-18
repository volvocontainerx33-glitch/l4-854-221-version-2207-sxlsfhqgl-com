(function () {
  function $(selector, parent) {
    return (parent || document).querySelector(selector);
  }

  function $all(selector, parent) {
    return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
  }

  function initMenu() {
    var button = $('[data-menu-toggle]');
    if (!button) {
      return;
    }
    button.addEventListener('click', function () {
      document.body.classList.toggle('menu-open');
    });
  }

  function initHero() {
    var slider = $('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = $all('[data-hero-slide]', slider);
    var dots = $all('[data-hero-dot]', slider);
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === active);
      });
    }

    function play() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        play();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', play);
    show(0);
    play();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initCardsFilter() {
    var panel = $('[data-filter-panel]');
    var list = $('[data-card-list]');
    if (!list) {
      return;
    }
    var cards = $all('[data-card]', list);
    var input = $('[data-local-search]');
    var buttons = panel ? $all('[data-filter]', panel) : [];
    var activeFilter = '';

    function apply() {
      var query = normalize(input ? input.value : '');
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-search'));
        var tags = normalize(card.getAttribute('data-tags'));
        var byText = !query || text.indexOf(query) !== -1;
        var byTag = !activeFilter || tags.indexOf(activeFilter) !== -1 || text.indexOf(activeFilter) !== -1;
        card.classList.toggle('is-hidden', !(byText && byTag));
      });
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        activeFilter = normalize(button.getAttribute('data-filter'));
        buttons.forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        apply();
      });
    });

    if (input) {
      input.addEventListener('input', apply);
    }
    apply();
  }

  function initSearchPage() {
    var input = $('[data-search-input]');
    var list = $('[data-card-list]');
    if (!input || !list) {
      return;
    }
    var cards = $all('[data-card]', list);
    var params = new URLSearchParams(window.location.search);
    input.value = params.get('q') || '';

    function apply() {
      var query = normalize(input.value);
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-search'));
        card.classList.toggle('is-hidden', query && text.indexOf(query) === -1);
      });
    }

    input.addEventListener('input', apply);
    apply();
  }

  function initPlayer(source) {
    var video = document.getElementById('movie-player');
    var playButton = $('.poster-play');
    if (!video || !source) {
      return;
    }
    var started = false;
    var hls = null;

    function attach() {
      if (started) {
        return;
      }
      started = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal || !hls) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
            hls = null;
          }
        });
      } else {
        video.src = source;
      }
    }

    function start() {
      attach();
      if (playButton) {
        playButton.classList.add('is-hidden');
      }
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {
          if (playButton) {
            playButton.classList.remove('is-hidden');
          }
        });
      }
    }

    if (playButton) {
      playButton.addEventListener('click', start);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener('play', function () {
      if (playButton) {
        playButton.classList.add('is-hidden');
      }
    });
    video.addEventListener('pause', function () {
      if (playButton && !video.ended) {
        playButton.classList.remove('is-hidden');
      }
    });
  }

  window.MovieSite = {
    initPlayer: initPlayer
  };

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initCardsFilter();
    initSearchPage();
  });
})();
