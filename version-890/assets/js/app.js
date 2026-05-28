(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMenu() {
        var toggle = document.querySelector(".menu-toggle");
        var panel = document.querySelector(".mobile-panel");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            var nextState = panel.hasAttribute("hidden");
            if (nextState) {
                panel.removeAttribute("hidden");
            } else {
                panel.setAttribute("hidden", "");
            }
            toggle.setAttribute("aria-expanded", String(nextState));
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dots button"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function schedule() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                schedule();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                schedule();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                schedule();
            });
        }

        show(0);
        schedule();
    }

    function initCatalogSearch() {
        var catalog = document.querySelector("[data-filter-catalog]");
        var input = document.querySelector("[data-catalog-input]");
        var form = document.querySelector("[data-catalog-form]");
        if (!catalog || !input) {
            return;
        }

        var cards = Array.prototype.slice.call(catalog.querySelectorAll("[data-search]"));
        var empty = document.querySelector("[data-empty]");

        function applyFilter(value) {
            var query = value.trim().toLowerCase();
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = (card.getAttribute("data-search") || "").toLowerCase();
                var matched = !query || haystack.indexOf(query) !== -1;
                card.style.display = matched ? "" : "none";
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        if (initial) {
            input.value = initial;
        }
        applyFilter(input.value);

        input.addEventListener("input", function () {
            applyFilter(input.value);
        });

        if (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                applyFilter(input.value);
            });
        }
    }

    window.initStreamPlayer = function (streamUrl, videoId, buttonId) {
        var video = document.getElementById(videoId || "videoPlayer");
        var trigger = document.getElementById(buttonId || "playMask");
        var message = document.querySelector("[data-player-message]");
        var hlsInstance = null;
        var attached = false;

        if (!video || !trigger || !streamUrl) {
            return;
        }

        function showMessage(text) {
            if (message) {
                message.textContent = text;
                message.classList.add("is-visible");
            }
        }

        function attach() {
            if (attached) {
                return Promise.resolve();
            }
            attached = true;

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        showMessage("视频暂时无法播放");
                    }
                });
                return new Promise(function (resolve) {
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, resolve);
                    window.setTimeout(resolve, 1200);
                });
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                return Promise.resolve();
            }

            video.src = streamUrl;
            return Promise.resolve();
        }

        function play() {
            trigger.classList.add("is-hidden");
            attach().then(function () {
                var result = video.play();
                if (result && result.catch) {
                    result.catch(function () {
                        trigger.classList.remove("is-hidden");
                    });
                }
            });
        }

        trigger.addEventListener("click", play);
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener("play", function () {
            trigger.classList.add("is-hidden");
        });
        video.addEventListener("pause", function () {
            if (!video.ended) {
                trigger.classList.remove("is-hidden");
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    ready(function () {
        initMenu();
        initHero();
        initCatalogSearch();
    });
})();
