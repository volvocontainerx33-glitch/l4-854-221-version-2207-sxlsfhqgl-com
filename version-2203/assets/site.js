(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var existing = document.querySelector('script[src="' + src + '"]');
      if (existing) {
        existing.addEventListener('load', resolve);
        existing.addEventListener('error', reject);
        if (window.Hls) {
          resolve();
        }
        return;
      }

      var script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function initMobileNavigation() {
    var button = document.querySelector('[data-mobile-menu-button]');
    var menu = document.querySelector('[data-mobile-menu]');

    if (!button || !menu) {
      return;
    }

    button.addEventListener('click', function () {
      var isOpen = menu.classList.toggle('is-open');
      button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = selectAll('[data-hero-slide]', hero);
    var dots = selectAll('[data-hero-dot]', hero);
    var currentIndex = 0;

    function showSlide(nextIndex) {
      currentIndex = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, index) {
        slide.classList.toggle('is-active', index === currentIndex);
        slide.setAttribute('aria-hidden', index === currentIndex ? 'false' : 'true');
      });

      dots.forEach(function (dot, index) {
        dot.classList.toggle('is-active', index === currentIndex);
        dot.setAttribute('aria-current', index === currentIndex ? 'true' : 'false');
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(currentIndex + 1);
      }, 5000);
    }
  }

  function initSearchAndFilters() {
    var searchInput = document.querySelector('[data-search-input]');
    var cards = selectAll('[data-card]');
    var chips = selectAll('[data-filter-chip]');
    var count = document.querySelector('[data-search-count]');
    var empty = document.querySelector('[data-empty-tip]');
    var activeFilter = 'all';

    if (!cards.length) {
      return;
    }

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function applyFilters() {
      var query = normalize(searchInput ? searchInput.value : '');
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-category'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' '));

        var filterValue = normalize(card.getAttribute('data-category'));
        var matchesQuery = !query || text.indexOf(query) !== -1;
        var matchesFilter = activeFilter === 'all' || filterValue === activeFilter;
        var shouldShow = matchesQuery && matchesFilter;

        card.classList.toggle('is-hidden', !shouldShow);
        if (shouldShow) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = '已显示 ' + visible + ' 部';
      }

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    if (searchInput) {
      searchInput.addEventListener('input', applyFilters);
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (item) {
          item.classList.remove('is-active');
        });

        chip.classList.add('is-active');
        activeFilter = normalize(chip.getAttribute('data-filter-value') || 'all');
        applyFilters();
      });
    });

    applyFilters();
  }

  function initPlayer() {
    var video = document.querySelector('video[data-m3u8]');
    if (!video) {
      return;
    }

    var startButton = document.querySelector('[data-player-start]');
    var status = document.querySelector('[data-player-status]');
    var source = video.getAttribute('data-m3u8');
    var initialized = false;

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    function attachSource() {
      if (initialized) {
        return Promise.resolve();
      }

      initialized = true;
      setStatus('正在加载播放源...');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        setStatus('播放源已就绪');
        return Promise.resolve();
      }

      function attachWithHls() {
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });

          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setStatus('播放源已就绪');
          });
          hls.on(window.Hls.Events.ERROR, function (_, data) {
            if (data && data.fatal) {
              setStatus('播放源加载遇到问题，请稍后重试');
            }
          });
          return Promise.resolve();
        }

        setStatus('当前浏览器暂不支持 HLS 播放');
        return Promise.reject(new Error('HLS is not supported'));
      }

      if (window.Hls) {
        return attachWithHls();
      }

      return loadScript('https://cdn.jsdelivr.net/npm/hls.js@latest')
        .then(attachWithHls)
        .catch(function () {
          setStatus('播放器组件加载失败，请检查网络后重试');
        });
    }

    function beginPlayback() {
      attachSource().then(function () {
        var playPromise = video.play();
        if (playPromise && typeof playPromise.then === 'function') {
          playPromise.then(function () {
            if (startButton) {
              startButton.style.display = 'none';
            }
          }).catch(function () {
            setStatus('请再次点击播放按钮开始播放');
          });
        }
      });
    }

    if (startButton) {
      startButton.addEventListener('click', beginPlayback);
    }

    video.addEventListener('play', function () {
      if (startButton) {
        startButton.style.display = 'none';
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileNavigation();
    initHero();
    initSearchAndFilters();
    initPlayer();
  });
})();
