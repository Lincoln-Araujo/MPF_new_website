(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* 1) Ano no footer */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const getCssMs = (varName, fallbackMs) => {
    const v = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : fallbackMs;
  };

  const waitForTransition = (el, fallbackMs) =>
    new Promise((resolve) => {
      let done = false;

      const finish = () => {
        if (done) return;
        done = true;
        el.removeEventListener("transitionend", onEnd);
        resolve();
      };

      const onEnd = (e) => {
        // às vezes vários properties disparam; qualquer um serve
        if (e.target === el) finish();
      };

      el.addEventListener("transitionend", onEnd, { once: false });
      window.setTimeout(finish, fallbackMs);
    });

  /* 2) Menu mobile (a11y + animação + burger) */
  (() => {
    const btn = $("[data-menu-button]");
    const panel = $("[data-menu-panel]");
    const overlay = $("[data-menu-overlay]");
    if (!btn || !panel || !overlay) return;

    const root = document.documentElement;
    let lastFocus = null;

    const focusableSelector =
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const getFocusable = () => $$(focusableSelector, panel);
    const isOpen = () => btn.getAttribute("aria-expanded") === "true";

    const slowMs = getCssMs("--t-slow", 320);

    const openMenu = () => {
      if (isOpen()) return;

      lastFocus = document.activeElement;

      panel.hidden = false;
      overlay.hidden = false;

      // reflow para garantir que o CSS pegue o estado inicial (opacity/transform)
      // eslint-disable-next-line no-unused-expressions
      panel.offsetHeight;

      btn.setAttribute("aria-expanded", "true");
      btn.setAttribute("aria-label", "Fechar menu");
      root.classList.add("menu-open");
      document.body.style.overflow = "hidden";

      const focusables = getFocusable();
      (focusables[0] || panel).focus();
    };

    const closeMenu = async () => {
      if (!isOpen()) return;

      btn.setAttribute("aria-expanded", "false");
      btn.setAttribute("aria-label", "Abrir menu");
      root.classList.remove("menu-open");
      document.body.style.overflow = "";

      await waitForTransition(panel, slowMs);

      panel.hidden = true;
      overlay.hidden = true;

      if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
    };

    const trapFocus = (e) => {
      if (!isOpen() || e.key !== "Tab") return;

      const focusables = getFocusable();
      if (!focusables.length) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    btn.addEventListener("click", () => (isOpen() ? closeMenu() : openMenu()));
    overlay.addEventListener("click", closeMenu);

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && isOpen()) closeMenu();
      trapFocus(e);
    });
  })();

  /* 3) Contraste (switch) */
  (() => {
    const buttons = $$("[data-contrast-toggle]");
    if (!buttons.length) return;

    const storageKey = "mpf-contrast";

    const setContrast = (enabled) => {
      document.body.classList.toggle("hc", enabled);
      buttons.forEach((b) => b.setAttribute("aria-checked", String(enabled)));
      localStorage.setItem(storageKey, enabled ? "1" : "0");
    };

    if (localStorage.getItem(storageKey) === "1") setContrast(true);

    buttons.forEach((b) => {
      b.addEventListener("click", () => {
        setContrast(!document.body.classList.contains("hc"));
      });
    });
  })();

  /* 4) Tamanho da fonte (A-/A/A+) */
  (() => {
    const buttons = $$("[data-font]");
    if (!buttons.length) return;

    const storageKey = "mpf-font-scale";
    const min = 14;
    const max = 20;
    const defaultSize = 16;

    const getCurrentBase = () => {
      const computed = getComputedStyle(document.documentElement).fontSize;
      return Math.round(parseFloat(computed));
    };

    const setBaseFont = (px) => {
      const clamped = Math.max(min, Math.min(max, px));
      document.documentElement.style.setProperty("--base-font-size", `${clamped}px`);
      localStorage.setItem(storageKey, String(clamped));
    };

    const saved = localStorage.getItem(storageKey);
    if (saved) setBaseFont(parseInt(saved, 10));

    buttons.forEach((b) => {
      b.addEventListener("click", () => {
        const action = b.getAttribute("data-font");
        const current = getCurrentBase();

        if (action === "increase") setBaseFont(current + 1);
        if (action === "decrease") setBaseFont(current - 1);
        if (action === "reset") setBaseFont(defaultSize);
      });
    });
  })();

  /* 5) “Mais” no menu desktop (joga links excedentes pro dropdown) */
  (() => {
    const nav = document.querySelector('nav[aria-label="Navegação principal"]');
    if (!nav) return;

    const ul = nav.querySelector("ul");
    const moreItem = ul?.querySelector("[data-more-item]");
    const moreBtn = ul?.querySelector("[data-more-button]");
    const moreMenu = ul?.querySelector("[data-more-menu]");
    if (!ul || !moreItem || !moreBtn || !moreMenu) return;

    const closeMore = () => {
      moreMenu.hidden = true;
      moreBtn.setAttribute("aria-expanded", "false");
    };

    const openMore = () => {
      moreMenu.hidden = false;
      moreBtn.setAttribute("aria-expanded", "true");
    };

    moreBtn.addEventListener("click", () => {
      const expanded = moreBtn.getAttribute("aria-expanded") === "true";
      expanded ? closeMore() : openMore();
    });

    document.addEventListener("click", (e) => {
      if (!moreItem.contains(e.target)) closeMore();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMore();
    });

    const putBackOverflowLinks = () => {
      const links = Array.from(moreMenu.querySelectorAll("a"));
      links.forEach((a) => {
        a.removeAttribute("role");
        const li = document.createElement("li");
        li.appendChild(a);
        ul.insertBefore(li, moreItem);
      });
      moreMenu.innerHTML = "";
    };

    const getRealItems = () => Array.from(ul.children).filter((li) => li !== moreItem);

    const navVisible = () => getComputedStyle(nav).display !== "none";

    const isOverflowing = () => {
      // medir por scrollWidth é mais estável do que getBoundingClientRect (fontes, zoom, etc)
      return ul.scrollWidth > ul.clientWidth + 1;
    };

    const moveLastToMore = () => {
      const items = getRealItems();
      // evita ficar só com 1 item no menu
      if (items.length <= 2) return false;

      const li = items[items.length - 1];
      if (!li) return false;

      const link = li.querySelector("a");
      li.remove();

      if (!link) return true;

      const menuLi = document.createElement("li");
      menuLi.setAttribute("role", "none");
      link.setAttribute("role", "menuitem");
      menuLi.appendChild(link);
      moreMenu.prepend(menuLi);

      return true;
    };

    const rebuild = () => {
      closeMore();
      putBackOverflowLinks();

      moreItem.hidden = true;
      moreMenu.hidden = true;

      if (!navVisible()) return;

      // 1) primeiro testa sem o "Mais"
      if (!isOverflowing()) return;

      // 2) se estourou, liga o "Mais" e vai movendo do fim até caber
      moreItem.hidden = false;

      // o "Mais" em si ocupa espaço, então precisamos reavaliar
      while (isOverflowing()) {
        const moved = moveLastToMore();
        if (!moved) break;
      }

      // se acabou não movendo nada, não mostra
      if (moreMenu.children.length === 0) {
        moreItem.hidden = true;
        closeMore();
      }
    };

    // ResizeObserver pega resize do container; também rodamos em load + quando fontes terminam de carregar
    const ro = new ResizeObserver(rebuild);
    ro.observe(ul);

    window.addEventListener("load", rebuild);
    if (document.fonts && typeof document.fonts.ready?.then === "function") {
      document.fonts.ready.then(rebuild).catch(() => {});
    }
  })();
})();
