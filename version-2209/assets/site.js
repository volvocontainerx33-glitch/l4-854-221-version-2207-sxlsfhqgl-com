(function () {
    var mobileToggle = document.querySelector('[data-mobile-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');
    if (mobileToggle && mobilePanel) {
        mobileToggle.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    var filterInput = document.querySelector('[data-filter-input]');
    var typeFilter = document.querySelector('[data-filter-type]');
    var yearFilter = document.querySelector('[data-filter-year]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var emptyHint = document.querySelector('[data-empty-hint]');

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function applyFilter() {
        if (!cards.length) {
            return;
        }
        var keyword = normalize(filterInput && filterInput.value);
        var typeValue = normalize(typeFilter && typeFilter.value);
        var yearValue = normalize(yearFilter && yearFilter.value);
        var visible = 0;
        cards.forEach(function (card) {
            var haystack = normalize(card.getAttribute('data-search'));
            var type = normalize(card.getAttribute('data-type'));
            var year = normalize(card.getAttribute('data-year'));
            var ok = true;
            if (keyword && haystack.indexOf(keyword) === -1) {
                ok = false;
            }
            if (typeValue && type.indexOf(typeValue) === -1) {
                ok = false;
            }
            if (yearValue && year !== yearValue) {
                ok = false;
            }
            card.style.display = ok ? '' : 'none';
            if (ok) {
                visible += 1;
            }
        });
        if (emptyHint) {
            emptyHint.classList.toggle('is-visible', visible === 0);
        }
    }

    if (filterInput) {
        filterInput.addEventListener('input', applyFilter);
    }
    if (typeFilter) {
        typeFilter.addEventListener('change', applyFilter);
    }
    if (yearFilter) {
        yearFilter.addEventListener('change', applyFilter);
    }

    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q && filterInput) {
        filterInput.value = q;
        applyFilter();
    }

    window.initMoviePlayer = function (config) {
        var video = document.getElementById(config.videoId);
        var button = document.getElementById(config.buttonId);
        if (!video || !button) {
            return;
        }
        var attached = false;
        var hlsInstance = null;
        function attach() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = config.streamUrl;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hlsInstance.loadSource(config.streamUrl);
                hlsInstance.attachMedia(video);
                return;
            }
            video.src = config.streamUrl;
        }
        function play() {
            attach();
            button.classList.add('is-hidden');
            video.setAttribute('controls', 'controls');
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    button.classList.remove('is-hidden');
                });
            }
        }
        button.addEventListener('click', play);
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };
})();
