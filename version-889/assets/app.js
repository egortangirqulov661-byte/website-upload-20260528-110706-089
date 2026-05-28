(function () {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');
  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
  if (slides.length > 1) {
    let current = 0;
    const show = function (index) {
      current = index;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    setInterval(function () {
      show((current + 1) % slides.length);
    }, 5000);
  }

  const params = new URLSearchParams(window.location.search);
  const q = params.get('q');
  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    const search = scope.querySelector('[data-filter-search]');
    const region = scope.querySelector('[data-filter-region]');
    const year = scope.querySelector('[data-filter-year]');
    const type = scope.querySelector('[data-filter-type]');
    const empty = scope.querySelector('[data-empty-state]');
    const cards = Array.from(scope.parentElement.querySelectorAll('.movie-card'));
    if (q && search) {
      search.value = q;
    }
    const filter = function () {
      const word = (search && search.value || '').trim().toLowerCase();
      const regionValue = region && region.value || '';
      const yearValue = year && year.value || '';
      const typeValue = type && type.value || '';
      let visible = 0;
      cards.forEach(function (card) {
        const haystack = [card.dataset.title, card.dataset.tags, card.dataset.category].join(' ').toLowerCase();
        const okWord = !word || haystack.indexOf(word) !== -1;
        const okRegion = !regionValue || card.dataset.region === regionValue;
        const okYear = !yearValue || card.dataset.year === yearValue;
        const okType = !typeValue || card.dataset.type === typeValue;
        const ok = okWord && okRegion && okYear && okType;
        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    };
    [search, region, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', filter);
        control.addEventListener('change', filter);
      }
    });
    filter();
  });
})();
