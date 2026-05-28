(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
            return;
        }
        callback();
    }

    function setupMobileMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            var isOpen = panel.classList.toggle("is-open");
            document.body.classList.toggle("menu-open", isOpen);
            button.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });
    }

    function setupHeroCarousel() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === current);
                dot.setAttribute("aria-pressed", i === current ? "true" : "false");
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                start();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function normalize(text) {
        return (text || "").toString().toLowerCase().replace(/\s+/g, "");
    }

    function setupCardFilter() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]"));
        if (!inputs.length) {
            return;
        }
        inputs.forEach(function (input) {
            var target = input.getAttribute("data-filter-input") || "body";
            var root = document.querySelector(target) || document;
            var cards = Array.prototype.slice.call(root.querySelectorAll("[data-search-text]"));
            var empty = root.querySelector("[data-empty-state]");
            var tagButtons = Array.prototype.slice.call(root.querySelectorAll("[data-filter-tag]"));
            var activeTag = "";

            function apply() {
                var query = normalize(input.value);
                var shown = 0;
                cards.forEach(function (card) {
                    var haystack = normalize(card.getAttribute("data-search-text"));
                    var tags = normalize(card.getAttribute("data-filter-tags"));
                    var okQuery = !query || haystack.indexOf(query) !== -1;
                    var okTag = !activeTag || tags.indexOf(activeTag) !== -1;
                    var visible = okQuery && okTag;
                    card.style.display = visible ? "" : "none";
                    if (visible) {
                        shown += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", shown === 0);
                }
            }

            tagButtons.forEach(function (button) {
                button.addEventListener("click", function () {
                    activeTag = normalize(button.getAttribute("data-filter-tag"));
                    tagButtons.forEach(function (item) {
                        item.classList.toggle("is-active", item === button);
                    });
                    apply();
                });
            });

            input.addEventListener("input", apply);
            apply();
        });
    }

    function setupSearchPage() {
        var input = document.querySelector("[data-search-page-input]");
        if (!input) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        input.value = query;
        input.dispatchEvent(new Event("input"));
    }

    function initializeVideoPlayer(videoId, triggerId, sourceUrl) {
        var video = document.getElementById(videoId);
        var trigger = document.getElementById(triggerId);
        var loaded = false;
        var hlsInstance = null;

        if (!video || !sourceUrl) {
            return;
        }

        function load() {
            if (loaded) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = sourceUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(sourceUrl);
                hlsInstance.attachMedia(video);
                video._hlsInstance = hlsInstance;
            } else {
                video.src = sourceUrl;
            }
            loaded = true;
        }

        function play() {
            load();
            if (trigger) {
                trigger.classList.add("is-hidden");
            }
            video.controls = true;
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }

        if (trigger) {
            trigger.addEventListener("click", play);
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
    }

    window.initializeVideoPlayer = initializeVideoPlayer;

    ready(function () {
        setupMobileMenu();
        setupHeroCarousel();
        setupCardFilter();
        setupSearchPage();
    });
})();
