(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const results = $("#news-results");
  const buttons = $$(".news-view-btn");
  const countEl = $("#news-count");

  if (countEl) {
    countEl.textContent = String($$(".news-item").length);
  }

  if (!results || !buttons.length) return;

  function setView(view) {
    if (window.matchMedia("(min-width: 1024px)").matches) {
      results.classList.toggle("is-cards", view === "cards");
      results.classList.toggle("is-list", view === "list");

      buttons.forEach((b) => {
        const active = b.dataset.view === view;
        b.setAttribute("aria-pressed", active);
      });

      try {
        localStorage.setItem("mpf_news_view", view);
      } catch (e) {}
    }
  }

  buttons.forEach((btn) =>
    btn.addEventListener("click", () => setView(btn.dataset.view))
  );

  let saved = "cards";
  try {
    saved = localStorage.getItem("mpf_news_view") || "cards";
  } catch (e) {}

  setView(saved);

  window.addEventListener("resize", () => {
    if (!window.matchMedia("(min-width: 1024px)").matches) {
      results.classList.remove("is-cards");
      results.classList.add("is-list");
    } else {
      setView(saved);
    }
  });
})();
