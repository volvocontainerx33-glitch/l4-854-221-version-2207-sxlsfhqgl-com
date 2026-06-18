(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function initMenu() {
        const button = document.querySelector(".menu-button");
        const panel = document.querySelector(".mobile-panel");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            const open = panel.classList.toggle("is-open");
            button.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function initHero() {
        const slides = selectAll("[data-hero-slide]");
        const dots = selectAll("[data-hero-dot]");
        if (!slides.length || !dots.length) {
            return;
        }
        let index = 0;
        let timer = null;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle("is-active", itemIndex === index);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle("is-active", itemIndex === index);
            });
        }
        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });
        const carousel = document.querySelector(".hero-carousel");
        if (carousel) {
            carousel.addEventListener("mouseenter", stop);
            carousel.addEventListener("mouseleave", start);
        }
        start();
    }

    function initFilters() {
        selectAll("[data-filter-panel]").forEach(function (panel) {
            const root = panel.parentElement || document;
            const keyword = panel.querySelector(".filter-keyword");
            const region = panel.querySelector(".filter-region");
            const type = panel.querySelector(".filter-type");
            const year = panel.querySelector(".filter-year");
            const cards = selectAll(".filter-card", root);
            function apply() {
                const q = (keyword && keyword.value || "").trim().toLowerCase();
                const regionValue = region && region.value || "";
                const typeValue = type && type.value || "";
                const yearValue = year && year.value || "";
                cards.forEach(function (card) {
                    const text = [
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-tags")
                    ].join(" ").toLowerCase();
                    const matched = (!q || text.indexOf(q) !== -1) &&
                        (!regionValue || card.getAttribute("data-region") === regionValue) &&
                        (!typeValue || card.getAttribute("data-type") === typeValue) &&
                        (!yearValue || card.getAttribute("data-year") === yearValue);
                    card.hidden = !matched;
                });
            }
            [keyword, region, type, year].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
        });
    }

    function cardTemplate(movie) {
        const tags = Array.isArray(movie.tags) ? movie.tags.join(" ") : "";
        return [
            '<article class="movie-card filter-card" ',
            'data-title="', escapeHtml(movie.title), '" ',
            'data-region="', escapeHtml(movie.region), '" ',
            'data-type="', escapeHtml(movie.type), '" ',
            'data-year="', escapeHtml(movie.year), '" ',
            'data-genre="', escapeHtml(movie.genre), '" ',
            'data-tags="', escapeHtml(tags), '">',
            '<a class="movie-cover" href="', escapeHtml(movie.url), '" aria-label="观看', escapeHtml(movie.title), '">',
            '<img src="', escapeHtml(movie.cover), '" alt="', escapeHtml(movie.title), '" loading="lazy">',
            '<span class="cover-mask"><span class="play-icon">▶</span></span>',
            '<span class="year-badge">', escapeHtml(movie.year), '</span>',
            '</a>',
            '<div class="movie-card-body">',
            '<a class="movie-card-title" href="', escapeHtml(movie.url), '">', escapeHtml(movie.title), '</a>',
            '<p class="movie-card-desc">', escapeHtml(movie.oneLine), '</p>',
            '<div class="movie-meta-line"><span>', escapeHtml(movie.type), '</span><span>', escapeHtml(movie.region), '</span></div>',
            '</div>',
            '</article>'
        ].join("");
    }

    function initSearchPage() {
        const page = document.querySelector("[data-search-page]");
        const results = document.getElementById("search-results");
        const input = document.getElementById("search-input");
        if (!page || !results || !input || !window.MOVIE_INDEX) {
            return;
        }
        const params = new URLSearchParams(window.location.search);
        const initial = params.get("q") || "";
        input.value = initial;
        function render() {
            const q = input.value.trim().toLowerCase();
            const source = window.MOVIE_INDEX || [];
            const matched = source.filter(function (movie) {
                const text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.oneLine, (movie.tags || []).join(" ")]
                    .join(" ")
                    .toLowerCase();
                return !q || text.indexOf(q) !== -1;
            }).slice(0, 120);
            results.innerHTML = matched.map(cardTemplate).join("");
        }
        input.addEventListener("input", render);
        render();
    }

    document.addEventListener("DOMContentLoaded", function () {
        initMenu();
        initHero();
        initFilters();
        initSearchPage();
    });
}());
