// Ano do footer
      document.getElementById("year").textContent = new Date().getFullYear();

      // Menu mobile acessível
      (() => {
        const btn = document.querySelector("[data-menu-button]");
        const panel = document.querySelector("[data-menu-panel]");
        const overlay = document.querySelector("[data-menu-overlay]");
        const closeBtn = document.querySelector("[data-menu-close]");

        if (!btn || !panel || !overlay) return;

        let lastFocus = null;

        const focusableSelector =
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

        const getFocusable = () => Array.from(panel.querySelectorAll(focusableSelector));

        const openMenu = () => {
          lastFocus = document.activeElement;
          panel.hidden = false;
          overlay.hidden = false;
          btn.setAttribute("aria-expanded", "true");
          document.documentElement.classList.add("overflow-hidden");

          const focusables = getFocusable();
          (focusables[0] || panel).focus();
        };

        const closeMenu = () => {
          panel.hidden = true;
          overlay.hidden = true;
          btn.setAttribute("aria-expanded", "false");
          document.documentElement.classList.remove("overflow-hidden");
          if (lastFocus) lastFocus.focus();
        };

        const trapFocus = (e) => {
          if (panel.hidden || e.key !== "Tab") return;

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

        btn.addEventListener("click", () => {
          const expanded = btn.getAttribute("aria-expanded") === "true";
          expanded ? closeMenu() : openMenu();
        });

        overlay.addEventListener("click", closeMenu);
        closeBtn?.addEventListener("click", closeMenu);

        document.addEventListener("keydown", (e) => {
          if (e.key === "Escape" && btn.getAttribute("aria-expanded") === "true") closeMenu();
          trapFocus(e);
        });
      })();