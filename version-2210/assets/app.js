(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function bindHeader() {
    var toggle = document.querySelector('.nav-toggle');
    var menu = document.querySelector('.mobile-menu');
    if (toggle && menu) {
      toggle.addEventListener('click', function () {
        var isOpen = menu.hasAttribute('hidden') === false;
        if (isOpen) {
          menu.setAttribute('hidden', '');
          toggle.setAttribute('aria-expanded', 'false');
        } else {
          menu.removeAttribute('hidden');
          toggle.setAttribute('aria-expanded', 'true');
        }
      });
    }

    document.querySelectorAll('.site-search-form').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[name="q"]');
        var query = input ? input.value.trim() : '';
        if (query) {
          window.location.href = 'list.html?q=' + encodeURIComponent(query);
        } else {
          window.location.href = 'list.html';
        }
      });
    });

    document.querySelectorAll('[data-year]').forEach(function (node) {
      node.textContent = String(new Date().getFullYear());
    });
  }

  function bindFilters() {
    var list = document.querySelector('[data-movie-list]');
    if (!list) {
      return;
    }

    var input = document.querySelector('[data-filter-input]');
    var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-value]'));
    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-card]'));
    var empty = document.querySelector('[data-empty-state]');
    var active = 'all';
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';

    if (input && initial) {
      input.value = initial;
    }

    function apply() {
      var query = normalize(input ? input.value : '');
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-search'));
        var category = card.getAttribute('data-category') || '';
        var categoryMatch = active === 'all' || category === active;
        var searchMatch = !query || text.indexOf(query) !== -1;
        var show = categoryMatch && searchMatch;
        card.hidden = !show;
        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    if (input) {
      input.addEventListener('input', apply);
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        active = button.getAttribute('data-filter-value') || 'all';
        buttons.forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        apply();
      });
    });

    apply();
  }

  window.initPlayer = function (url) {
    var video = document.getElementById('moviePlayer');
    var overlay = document.querySelector('[data-player-overlay]');
    var start = document.querySelector('[data-player-start]');
    var loaded = false;
    var instance = null;

    if (!video || !url) {
      return;
    }

    function load() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        instance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        instance.loadSource(url);
        instance.attachMedia(video);
      } else {
        video.src = url;
      }
    }

    function play() {
      load();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      video.controls = true;
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    if (start) {
      start.addEventListener('click', play);
    }
    if (overlay) {
      overlay.addEventListener('click', play);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
    window.addEventListener('beforeunload', function () {
      if (instance) {
        instance.destroy();
      }
    });
  };

  ready(function () {
    bindHeader();
    bindFilters();
  });
})();
