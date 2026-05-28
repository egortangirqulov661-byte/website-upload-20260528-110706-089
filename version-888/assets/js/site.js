(function() {
  const menuButton = document.querySelector("[data-menu-button]");
  const mobilePanel = document.querySelector("[data-mobile-panel]");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function() {
      mobilePanel.classList.toggle("open");
    });
  }

  const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));

  if (slides.length > 1) {
    let current = 0;

    const activate = function(index) {
      current = index;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    };

    dots.forEach(function(dot, dotIndex) {
      dot.addEventListener("click", function() {
        activate(dotIndex);
      });
    });

    window.setInterval(function() {
      activate((current + 1) % slides.length);
    }, 5200);
  }

  const searchPage = document.querySelector("[data-search-page]");
  if (searchPage) {
    const params = new URLSearchParams(window.location.search);
    const input = document.querySelector("[data-search-input]");
    const category = document.querySelector("[data-category-filter]");
    const year = document.querySelector("[data-year-filter]");
    const cards = Array.from(document.querySelectorAll("[data-card]"));
    const empty = document.querySelector("[data-no-results]");

    if (input && params.get("q")) {
      input.value = params.get("q");
    }

    const applyFilter = function() {
      const query = input ? input.value.trim().toLowerCase() : "";
      const cat = category ? category.value : "";
      const yearValue = year ? year.value : "";
      let visible = 0;

      cards.forEach(function(card) {
        const searchText = (card.getAttribute("data-search") || "").toLowerCase();
        const cardCategory = card.getAttribute("data-category") || "";
        const cardYear = card.getAttribute("data-year") || "";
        const queryOk = !query || searchText.indexOf(query) !== -1;
        const categoryOk = !cat || cardCategory === cat;
        const yearOk = !yearValue || cardYear === yearValue;
        const show = queryOk && categoryOk && yearOk;

        card.style.display = show ? "" : "none";
        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("show", visible === 0);
      }
    };

    [input, category, year].forEach(function(node) {
      if (node) {
        node.addEventListener("input", applyFilter);
        node.addEventListener("change", applyFilter);
      }
    });

    applyFilter();
  }
})();
