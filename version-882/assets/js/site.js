(function () {
    function qs(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    function qsa(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function setupMenu() {
        var toggle = qs(".menu-toggle");
        var nav = qs(".mobile-nav");

        if (!toggle || !nav) {
            return;
        }

        toggle.addEventListener("click", function () {
            var isOpen = nav.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });
    }

    function setupHero() {
        var hero = qs("[data-hero]");
        if (!hero) {
            return;
        }

        var slides = qsa(".hero-slide", hero);
        var dots = qsa(".hero-dot", hero);
        var current = 0;
        var timer = null;

        function activate(index) {
            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function start() {
            if (slides.length <= 1) {
                return;
            }

            timer = window.setInterval(function () {
                activate(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                stop();
                activate(index);
                start();
            });
        });

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);

        activate(0);
        start();
    }

    function setupFilters() {
        qsa("[data-filter-panel]").forEach(function (panel) {
            var targetId = panel.getAttribute("data-filter-panel");
            var grid = qs('[data-filter-grid="' + targetId + '"]');

            if (!grid) {
                return;
            }

            var cards = qsa(".movie-card", grid);
            var searchInput = qs('[data-filter-search="' + targetId + '"]');
            var yearSelect = qs('[data-filter-year="' + targetId + '"]');
            var typeSelect = qs('[data-filter-type="' + targetId + '"]');
            var noResults = qs('[data-filter-empty="' + targetId + '"]');

            function matches(card, keyword, year, type) {
                var text = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-tags")
                ].join(" "));

                var cardYear = String(card.getAttribute("data-year") || "");
                var cardType = String(card.getAttribute("data-type") || "");

                if (keyword && text.indexOf(keyword) === -1) {
                    return false;
                }

                if (year && cardYear !== year) {
                    return false;
                }

                if (type && cardType !== type) {
                    return false;
                }

                return true;
            }

            function apply() {
                var keyword = normalize(searchInput && searchInput.value);
                var year = yearSelect ? yearSelect.value : "";
                var type = typeSelect ? typeSelect.value : "";
                var visible = 0;

                cards.forEach(function (card) {
                    var ok = matches(card, keyword, year, type);
                    card.classList.toggle("is-hidden", !ok);

                    if (ok) {
                        visible += 1;
                    }
                });

                if (noResults) {
                    noResults.classList.toggle("is-visible", visible === 0);
                }
            }

            [searchInput, yearSelect, typeSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });

            apply();
        });
    }

    function setupPlayer() {
        qsa(".player-shell[data-src]").forEach(function (shell) {
            var video = qs("video", shell);
            var overlay = qs(".player-overlay", shell);
            var button = qs(".player-button", shell);
            var status = qs(".player-status", shell);
            var src = shell.getAttribute("data-src");
            var loaded = false;
            var hlsInstance = null;

            if (!video || !src) {
                return;
            }

            function setStatus(message) {
                if (status) {
                    status.textContent = message;
                }
            }

            function loadSource() {
                if (loaded) {
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(src);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        setStatus("播放源已就绪");
                    });
                    hlsInstance.on(window.Hls.Events.ERROR, function () {
                        setStatus("正在尝试继续加载");
                    });
                } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = src;
                    video.addEventListener("loadedmetadata", function () {
                        setStatus("播放源已就绪");
                    }, { once: true });
                } else {
                    video.src = src;
                    setStatus("正在加载播放源");
                }

                loaded = true;
            }

            function play() {
                loadSource();
                shell.classList.add("is-playing");
                video.controls = true;

                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {
                        setStatus("点击视频继续播放");
                    });
                }
            }

            shell.addEventListener("click", function (event) {
                if (event.target === video && loaded) {
                    return;
                }

                play();
            });

            if (overlay) {
                overlay.addEventListener("click", play);
            }

            if (button) {
                button.addEventListener("click", play);
            }

            video.addEventListener("play", function () {
                shell.classList.add("is-playing");
            });
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupPlayer();
    });
})();
