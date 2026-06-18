(function () {
    const ready = function (callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    };

    ready(function () {
        const root = document.body.getAttribute("data-root") || ".";
        const rootPath = root === "." ? "." : root;
        const searchPage = rootPath + "/search.html";

        document.querySelectorAll(".menu-toggle").forEach(function (button) {
            const panel = document.querySelector(".mobile-panel");
            button.addEventListener("click", function () {
                const open = panel.hasAttribute("hidden");
                if (open) {
                    panel.removeAttribute("hidden");
                } else {
                    panel.setAttribute("hidden", "");
                }
                button.setAttribute("aria-expanded", String(open));
            });
        });

        document.querySelectorAll(".nav-search").forEach(function (input) {
            input.addEventListener("keydown", function (event) {
                if (event.key === "Enter") {
                    const query = input.value.trim();
                    if (query) {
                        window.location.href = searchPage + "?q=" + encodeURIComponent(query);
                    }
                }
            });
        });

        const slides = Array.from(document.querySelectorAll(".hero-slide"));
        const dots = Array.from(document.querySelectorAll(".hero-dot"));
        if (slides.length > 1) {
            let index = 0;
            const show = function (next) {
                index = (next + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("is-active", i === index);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("is-active", i === index);
                });
            };
            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    show(Number(dot.getAttribute("data-slide-target")) || 0);
                });
            });
            window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        const params = new URLSearchParams(window.location.search);
        const queryValue = params.get("q") || "";
        const searchInputs = Array.from(document.querySelectorAll(".site-search"));
        const cards = Array.from(document.querySelectorAll(".searchable-list .movie-card"));
        const filters = Array.from(document.querySelectorAll(".filter-btn"));
        const empty = document.querySelector(".no-results");
        let activeFilter = "all";

        const applyFilter = function () {
            const term = (searchInputs[0] ? searchInputs[0].value : "").trim().toLowerCase();
            let visible = 0;
            cards.forEach(function (card) {
                const search = (card.getAttribute("data-search") || "").toLowerCase();
                const category = card.getAttribute("data-category") || "";
                const matchedText = !term || search.indexOf(term) !== -1;
                const matchedCategory = activeFilter === "all" || category === activeFilter;
                const matched = matchedText && matchedCategory;
                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.hidden = visible !== 0;
            }
        };

        if (queryValue && searchInputs.length) {
            searchInputs.forEach(function (input) {
                input.value = queryValue;
            });
            applyFilter();
        }

        searchInputs.forEach(function (input) {
            input.addEventListener("input", function () {
                searchInputs.forEach(function (other) {
                    if (other !== input) {
                        other.value = input.value;
                    }
                });
                applyFilter();
            });
        });

        filters.forEach(function (button) {
            button.addEventListener("click", function () {
                activeFilter = button.getAttribute("data-filter") || "all";
                filters.forEach(function (item) {
                    item.classList.toggle("is-active", item === button);
                });
                applyFilter();
            });
        });

        document.querySelectorAll(".video-stage").forEach(function (stage) {
            const video = stage.querySelector("video");
            const overlay = stage.querySelector(".play-overlay");
            if (!video) {
                return;
            }
            const stream = video.getAttribute("data-stream");
            let attached = false;

            const attach = function () {
                if (attached || !stream) {
                    return Promise.resolve();
                }
                attached = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                    return Promise.resolve();
                }
                if (window.Hls && window.Hls.isSupported()) {
                    const hls = new window.Hls({ enableWorker: true });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    return Promise.resolve();
                }
                video.src = stream;
                return Promise.resolve();
            };

            const play = function () {
                attach().then(function () {
                    if (overlay) {
                        overlay.classList.add("is-hidden");
                    }
                    const result = video.play();
                    if (result && typeof result.catch === "function") {
                        result.catch(function () {});
                    }
                });
            };

            if (overlay) {
                overlay.addEventListener("click", play);
            }
            video.addEventListener("click", function () {
                if (video.paused) {
                    play();
                }
            });
            video.addEventListener("play", function () {
                if (overlay) {
                    overlay.classList.add("is-hidden");
                }
            });
        });
    });
})();
