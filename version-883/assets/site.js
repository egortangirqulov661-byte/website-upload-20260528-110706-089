(function () {
  var header = document.getElementById('siteHeader');
  var menuButton = document.querySelector('.menu-toggle');
  var mobileNav = document.getElementById('mobileNav');

  function updateHeader() {
    if (!header) {
      return;
    }
    if (window.scrollY > 18) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (menuButton && header && mobileNav) {
    menuButton.addEventListener('click', function () {
      var open = header.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;
    var timer = null;

    function showSlide(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function startTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startTimer();
      });
    });

    startTimer();
  }

  var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
  panels.forEach(function (panel) {
    var scope = panel.parentElement || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card-grid] .movie-card, [data-card-grid] .rank-item'));
    if (!cards.length) {
      cards = Array.prototype.slice.call(document.querySelectorAll('[data-card-grid] .movie-card, [data-card-grid] .rank-item'));
    }
    var search = panel.querySelector('[data-filter="search"]');
    var category = panel.querySelector('[data-filter="category"]');
    var type = panel.querySelector('[data-filter="type"]');
    var year = panel.querySelector('[data-filter="year"]');

    function value(node) {
      return node ? node.value.trim().toLowerCase() : '';
    }

    function runFilter() {
      var q = value(search);
      var c = value(category);
      var t = value(type);
      var y = value(year);

      cards.forEach(function (card) {
        var content = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-tags') || '',
          card.getAttribute('data-category') || '',
          card.getAttribute('data-type') || '',
          card.getAttribute('data-year') || ''
        ].join(' ').toLowerCase();
        var ok = true;
        if (q && content.indexOf(q) === -1) {
          ok = false;
        }
        if (c && (card.getAttribute('data-category') || '').toLowerCase() !== c) {
          ok = false;
        }
        if (t && (card.getAttribute('data-type') || '').toLowerCase() !== t) {
          ok = false;
        }
        if (y && (card.getAttribute('data-year') || '').toLowerCase() !== y) {
          ok = false;
        }
        card.classList.toggle('is-hidden', !ok);
      });
    }

    [search, category, type, year].forEach(function (node) {
      if (node) {
        node.addEventListener('input', runFilter);
        node.addEventListener('change', runFilter);
      }
    });
  });

  var players = Array.prototype.slice.call(document.querySelectorAll('.js-player'));
  players.forEach(function (player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('.player-cover');
    var src = player.getAttribute('data-src');
    var ready = false;

    function attachSource() {
      if (!video || !src || ready) {
        return;
      }
      ready = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        video.src = src;
      }
    }

    function playMovie() {
      attachSource();
      if (cover) {
        cover.classList.add('hidden');
      }
      if (video) {
        video.controls = true;
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {
            video.controls = true;
          });
        }
      }
    }

    if (cover) {
      cover.addEventListener('click', playMovie);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (!ready || video.paused) {
          playMovie();
        }
      });
    }
  });
}());
