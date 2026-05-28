(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  ready(function () {
    var header = document.querySelector('.site-header');
    var menuToggle = document.querySelector('.menu-toggle');
    if (header && menuToggle) {
      menuToggle.addEventListener('click', function () {
        var opened = header.classList.toggle('is-open');
        menuToggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
      });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var current = 0;
      var show = function (index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('is-active', i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('is-active', i === current);
        });
      };
      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          show(Number(dot.getAttribute('data-hero-dot')) || 0);
        });
      });
      if (slides.length > 1) {
        setInterval(function () {
          show(current + 1);
        }, 5200);
      }
    }

    var queryParams = new URLSearchParams(window.location.search);
    var initialQuery = queryParams.get('q') || '';
    document.querySelectorAll('[data-filterable]').forEach(function (grid) {
      var scope = grid.closest('section') || document;
      var searchInput = scope.querySelector('.card-search') || document.querySelector('.global-search');
      var chipButtons = Array.prototype.slice.call(scope.querySelectorAll('[data-chip]'));
      var selects = Array.prototype.slice.call(scope.querySelectorAll('.filter-select'));
      var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
      var activeChip = '';

      if (searchInput && initialQuery) {
        searchInput.value = initialQuery;
      }

      var apply = function () {
        var q = normalize(searchInput ? searchInput.value : '');
        var selectValues = {};
        selects.forEach(function (select) {
          selectValues[select.getAttribute('data-filter')] = normalize(select.value);
        });
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-category'),
            card.getAttribute('data-tags'),
            card.textContent
          ].join(' '));
          var matched = true;
          if (q && haystack.indexOf(q) === -1) {
            matched = false;
          }
          if (activeChip && haystack.indexOf(normalize(activeChip)) === -1) {
            matched = false;
          }
          Object.keys(selectValues).forEach(function (key) {
            var value = selectValues[key];
            if (value && normalize(card.getAttribute('data-' + key)).indexOf(value) === -1) {
              matched = false;
            }
          });
          card.classList.toggle('is-hidden-card', !matched);
        });
      };

      if (searchInput) {
        searchInput.addEventListener('input', apply);
      }
      selects.forEach(function (select) {
        select.addEventListener('change', apply);
      });
      chipButtons.forEach(function (button) {
        button.addEventListener('click', function () {
          chipButtons.forEach(function (item) {
            item.classList.remove('is-active');
          });
          button.classList.add('is-active');
          activeChip = button.getAttribute('data-chip') || '';
          apply();
        });
      });
      apply();
    });

    document.querySelectorAll('[data-player]').forEach(function (shell) {
      var video = shell.querySelector('video');
      var cover = shell.querySelector('.player-cover');
      var started = false;
      var hls = null;
      var start = function () {
        if (!video) {
          return;
        }
        var src = video.getAttribute('data-stream');
        if (!src) {
          return;
        }
        if (!started) {
          if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src;
          } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(src);
            hls.attachMedia(video);
          } else {
            video.src = src;
          }
          video.setAttribute('controls', 'controls');
          shell.classList.add('is-playing');
          started = true;
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {});
        }
      };
      if (cover) {
        cover.addEventListener('click', start);
      }
      if (video) {
        video.addEventListener('click', function () {
          if (!started || video.paused) {
            start();
          }
        });
        video.addEventListener('ended', function () {
          if (hls && typeof hls.stopLoad === 'function') {
            hls.stopLoad();
          }
        });
      }
    });
  });
})();
