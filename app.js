(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* 1) Ano no footer */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

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

    const setBtnLabel = (open) => {
      btn.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
      const sr = btn.querySelector(".sr-only");
      if (sr) sr.textContent = open ? "Fechar menu" : "Abrir menu";
    };

    const openMenu = () => {
      if (isOpen()) return;
      lastFocus = document.activeElement;

      panel.hidden = false;
      overlay.hidden = false;

      // força reflow para garantir transição
      // eslint-disable-next-line no-unused-expressions
      panel.offsetHeight;

      btn.setAttribute("aria-expanded", "true");
      setBtnLabel(true);
      root.classList.add("menu-open");
      document.body.style.overflow = "hidden";

      const focusables = getFocusable();
      (focusables[0] || panel).focus();
    };

    const closeMenu = () => {
      if (!isOpen()) return;

      btn.setAttribute("aria-expanded", "false");
      setBtnLabel(false);
      root.classList.remove("menu-open");
      document.body.style.overflow = "";

      // espera transição antes de esconder
      window.setTimeout(() => {
        panel.hidden = true;
        overlay.hidden = true;
      }, 320);

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

  /* 5) “Mais” no menu desktop (move links excedentes pro dropdown) */
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

    moreBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const expanded = moreBtn.getAttribute("aria-expanded") === "true";
      expanded ? closeMore() : openMore();
    });

    document.addEventListener("click", (e) => {
      if (!moreItem.contains(e.target)) closeMore();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMore();
    });

    const putBackOverflow = () => {
      // move links do dropdown de volta pro UL antes do "Mais"
      const links = Array.from(moreMenu.querySelectorAll("a"));
      links.forEach((a) => {
        a.removeAttribute("role");
        const li = document.createElement("li");
        li.appendChild(a);
        ul.insertBefore(li, moreItem);
      });
      moreMenu.innerHTML = "";
    };

    const getRealItems = () =>
      Array.from(ul.children).filter((li) => li !== moreItem);

    const isOverflowing = () => ul.scrollWidth > ul.clientWidth + 1;

    const moveOneToMore = () => {
      const items = getRealItems();
      if (items.length <= 2) return false; // mantém pelo menos 2 itens visíveis
      const li = items[items.length - 1];
      const a = li?.querySelector("a");
      if (!li || !a) {
        li?.remove();
        return true;
      }

      li.remove();

      const menuLi = document.createElement("li");
      menuLi.setAttribute("role", "none");
      a.setAttribute("role", "menuitem");
      menuLi.appendChild(a);
      moreMenu.prepend(menuLi);
      return true;
    };

    const rebuild = () => {
      closeMore();
      putBackOverflow();

      // se o nav estiver oculto (ex.: abaixo do lg), não mede
      const navVisible = getComputedStyle(nav).display !== "none";
      if (!navVisible) {
        moreItem.hidden = true;
        return;
      }

      // começa com "Mais" escondido
      moreItem.hidden = true;

      // se estourar sem o "Mais", mostra e move do fim até caber
      if (isOverflowing()) {
        moreItem.hidden = false;

        // por ter mostrado o "Mais", pode precisar mover mais de um item
        while (isOverflowing()) {
          const moved = moveOneToMore();
          if (!moved) break;
        }
      }

      // se não tem nada no dropdown, garante "Mais" escondido
      if (moreMenu.children.length === 0) {
        moreItem.hidden = true;
        closeMore();
      }
    };

    const ro = new ResizeObserver(rebuild);
    ro.observe(ul);
    window.addEventListener("load", rebuild);
  })();

  /* 6) Cookies */
  (() => {
    const banner = $("#cookie-banner");
    if (!banner) return;

    const accept = $("#cookie-accept", banner);
    const reject = $("#cookie-reject", banner);
    const settingsBtn = $("#cookie-settings", banner);
    const settingsPanel = $("#cookie-settings-panel", banner);

    const key = "mpf-cookie-consent"; // accepted | rejected

    const hide = () => {
      banner.hidden = true;
      settingsPanel.hidden = true;
    };
    const show = () => {
      banner.hidden = false;
    };

    const saved = localStorage.getItem(key);
    if (saved !== "accepted" && saved !== "rejected") show();

    accept?.addEventListener("click", () => {
      localStorage.setItem(key, "accepted");
      hide();
    });

    reject?.addEventListener("click", () => {
      localStorage.setItem(key, "rejected");
      hide();
    });

    settingsBtn?.addEventListener("click", () => {
      const isHidden = settingsPanel.hidden;
      settingsPanel.hidden = !isHidden;
    });
  })();
})();