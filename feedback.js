(() => {
  const form = document.getElementById("feedback-form");
  if (!form) return;

  // --- Anti-bot passivo + anti-duplo submit ---

  // marca quando o formulário foi carregado
  const formLoadedAt = Date.now();
  const loadedInput = document.getElementById("form_loaded_at");
  const elapsedInput = document.getElementById("form_elapsed_ms");

  if (loadedInput) {
    loadedInput.value = String(formLoadedAt);
  }

  // evita múltiplos envios
  let submitting = false;

  form.addEventListener("submit", () => {
    // tempo até o envio
    if (elapsedInput) {
      elapsedInput.value = String(Date.now() - formLoadedAt);
    }

    // bloqueia duplo submit
    if (submitting) {
      event.preventDefault();
      return;
    }

    submitting = true;

    // opcional: feedback visual
    const btn = form.querySelector('button[type="submit"]');
    if (btn) {
      btn.disabled = true;
      btn.setAttribute("aria-disabled", "true");
      btn.dataset.originalText = btn.textContent;
      btn.textContent = "Enviando…";
    }
  });


  const alertBox = document.getElementById("form-alert");

  const anonimo = document.getElementById("anonimo");
  const emailWrapper = document.getElementById("email-wrapper");
  const email = document.getElementById("email");

  const dificuldadeWrapper = document.getElementById("dificuldade-wrapper");
  const dificuldade = document.getElementById("dificuldade");

  const problemaLocalWrapper = document.getElementById("problema_local-wrapper");
  const problemaLocal = document.getElementById("problema_local");

  const getChecked = (name) => form.querySelector(`input[name="${name}"]:checked`);

  // Condicionais
  const syncDificuldade = () => {
    const v = getChecked("encontrou")?.value || "";
    const needs = v === "Sim, com alguma dificuldade" || v === "Não consegui encontrar";

    if (!dificuldadeWrapper || !dificuldade) return;

    if (needs) {
      dificuldadeWrapper.classList.remove("hidden");
      dificuldade.removeAttribute("tabindex");
      dificuldade.removeAttribute("aria-hidden");
    } else {
      dificuldade.value = "";
      dificuldadeWrapper.classList.add("hidden");
      dificuldade.setAttribute("tabindex", "-1");
      dificuldade.setAttribute("aria-hidden", "true");
      setError("dificuldade", false);
    }
  };

  const syncProblemaLocal = () => {
    const v = getChecked("problema_tecnico")?.value || "";
    const needs = v === "Sim";

    if (!problemaLocalWrapper || !problemaLocal) return;

    if (needs) {
      problemaLocalWrapper.classList.remove("hidden");
      problemaLocal.removeAttribute("tabindex");
      problemaLocal.removeAttribute("aria-hidden");
    } else {
      problemaLocal.value = "";
      problemaLocalWrapper.classList.add("hidden");
      problemaLocal.setAttribute("tabindex", "-1");
      problemaLocal.setAttribute("aria-hidden", "true");
      setError("problema_local", false);
    }
  };

  // Campos e validações
  const fields = {
    // radios
    perfil: {
      el: form.querySelector('input[name="perfil"]'),
      err: document.getElementById("perfil-erro"),
      validate: () => !!getChecked("perfil")
    },
    objetivo: {
      el: form.querySelector('input[name="objetivo"]'),
      err: document.getElementById("objetivo-erro"),
      validate: () => !!getChecked("objetivo")
    },
    uso_anterior: {
      el: form.querySelector('input[name="uso_anterior"]'),
      err: document.getElementById("uso_anterior-erro"),
      validate: () => !!getChecked("uso_anterior")
    },
    facilidade: {
      el: form.querySelector('input[name="facilidade"]'),
      err: document.getElementById("facilidade-erro"),
      validate: () => !!getChecked("facilidade")
    },
    encontrou: {
      el: form.querySelector('input[name="encontrou"]'),
      err: document.getElementById("encontrou-erro"),
      validate: () => !!getChecked("encontrou")
    },
    visual: {
      el: form.querySelector('input[name="visual"]'),
      err: document.getElementById("visual-erro"),
      validate: () => !!getChecked("visual")
    },
    clareza: {
      el: form.querySelector('input[name="clareza"]'),
      err: document.getElementById("clareza-erro"),
      validate: () => !!getChecked("clareza")
    },
    confianca: {
      el: form.querySelector('input[name="confianca"]'),
      err: document.getElementById("confianca-erro"),
      validate: () => !!getChecked("confianca")
    },
    problema_tecnico: {
      el: form.querySelector('input[name="problema_tecnico"]'),
      err: document.getElementById("problema_tecnico-erro"),
      validate: () => !!getChecked("problema_tecnico")
    },

    // condicionais
    dificuldade: {
      el: document.getElementById("dificuldade"),
      err: document.getElementById("dificuldade-erro"),
      validate: (el) => {
        const v = getChecked("encontrou")?.value || "";
        const needs = v === "Sim, com alguma dificuldade" || v === "Não consegui encontrar";
        if (!needs) return true;
        return el.value.trim().length > 0;
      }
    },
    problema_local: {
      el: document.getElementById("problema_local"),
      err: document.getElementById("problema_local-erro"),
      validate: (el) => {
        const v = getChecked("problema_tecnico")?.value || "";
        const needs = v === "Sim";
        if (!needs) return true;
        return el.value.trim().length > 0;
      }
    },

    melhorar: {
      el: document.getElementById("melhorar"),
      err: document.getElementById("melhorar-erro"),
      validate: (el) => true
    },


    // consentimento
    consentimento: {
      el: document.getElementById("consentimento"),
      err: document.getElementById("consentimento-erro"),
      validate: (el) => el.checked
    },

    // opcionais com validação
    pagina: {
      el: document.getElementById("pagina"),
      err: document.getElementById("pagina-erro"),
      validate: (el) => {
        const v = el.value.trim();
        if (!v) return true;
        try {
          const u = new URL(v);
          return u.protocol === "https:" || u.protocol === "http:";
        } catch {
          return false;
        }
      }
    },
    email: {
      el: document.getElementById("email"),
      err: document.getElementById("email-erro"),
      validate: (el) => {
        if (anonimo && anonimo.checked) return true;
        const v = el.value.trim();
        if (!v) return true; // opcional
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      }
    }
  };

  const setError = (key, hasError) => {
    const f = fields[key];
    if (!f || !f.el || !f.err) return;

    // se for radio (sem id), não tenta "border" no input invisível:
    const isRadio = f.el instanceof HTMLInputElement && f.el.type === "radio";

    if (hasError) {
      if (!isRadio) {
        f.el.setAttribute("aria-invalid", "true");
        f.el.classList.add("border-red-300");
        f.el.classList.add("focus:ring-red-200");
      }
      f.err.classList.remove("hidden");
    } else {
      if (!isRadio) {
        f.el.removeAttribute("aria-invalid");
        f.el.classList.remove("border-red-300");
        f.el.classList.remove("focus:ring-red-200");
      }
      f.err.classList.add("hidden");
    }
  };

  const validateAll = () => {
    let firstInvalid = null;
    let invalidCount = 0;

    Object.keys(fields).forEach((key) => {
      const f = fields[key];
      if (!f) return;

      // email não valida se anônimo
      if (key === "email" && anonimo && anonimo.checked) {
        setError("email", false);
        return;
      }

      const ok = typeof f.validate === "function" ? f.validate(f.el) : true;
      const hasError = !ok;

      setError(key, hasError);

      if (hasError) {
        invalidCount++;
        if (!firstInvalid) {
          // se for grupo radio, foca no primeiro do grupo
          if (key === "perfil") firstInvalid = form.querySelector('input[name="perfil"]');
          else if (key === "objetivo") firstInvalid = form.querySelector('input[name="objetivo"]');
          else if (key === "uso_anterior") firstInvalid = form.querySelector('input[name="uso_anterior"]');
          else if (key === "facilidade") firstInvalid = form.querySelector('input[name="facilidade"]');
          else if (key === "encontrou") firstInvalid = form.querySelector('input[name="encontrou"]');
          else if (key === "visual") firstInvalid = form.querySelector('input[name="visual"]');
          else if (key === "clareza") firstInvalid = form.querySelector('input[name="clareza"]');
          else if (key === "confianca") firstInvalid = form.querySelector('input[name="confianca"]');
          else if (key === "problema_tecnico") firstInvalid = form.querySelector('input[name="problema_tecnico"]');
          else firstInvalid = f.el;
        }
      }
    });

    if (alertBox) {
      if (invalidCount > 0) alertBox.classList.remove("hidden");
      else alertBox.classList.add("hidden");
    }

    return { ok: invalidCount === 0, firstInvalid };
  };

  // Anônimo: esconde e limpa email
  const syncAnonimo = () => {
    if (!anonimo || !emailWrapper || !email) return;
    const on = anonimo.checked;

    if (on) {
      email.value = "";
      emailWrapper.classList.add("hidden");
      email.setAttribute("tabindex", "-1");
      email.setAttribute("aria-hidden", "true");
      setError("email", false);
    } else {
      emailWrapper.classList.remove("hidden");
      email.removeAttribute("tabindex");
      email.removeAttribute("aria-hidden");
    }
  };

  if (anonimo) {
    anonimo.addEventListener("change", syncAnonimo);
    syncAnonimo();
  }

  // listeners de radios que ativam condicionais
  form.addEventListener("change", (e) => {
    const t = e.target;
    if (!(t instanceof HTMLElement)) return;

    if (t.matches('input[name="encontrou"]')) syncDificuldade();
    if (t.matches('input[name="problema_tecnico"]')) syncProblemaLocal();
  });

  // roda uma vez
  syncDificuldade();
  syncProblemaLocal();

  // Ajuda sob demanda (botão "?") — alterna parágrafos hidden com data-help-toggle
  form.addEventListener("click", (e) => {
    const btn = e.target.closest?.("[data-help-toggle]");
    if (!btn) return;

    const id = btn.getAttribute("data-help-toggle");
    const target = document.getElementById(id);
    if (!target) return;

    const isHidden = target.classList.contains("hidden");
    target.classList.toggle("hidden", !isHidden);

    btn.setAttribute("aria-expanded", String(isHidden));
  });

  const visualDetalheWrapper = document.getElementById("visual-detalhe-wrapper");
  const visualDetalhe = document.getElementById("visual_detalhe");

  const confiancaDetalheWrapper = document.getElementById("confianca-detalhe-wrapper");
  const confiancaDetalhe = document.getElementById("confianca_detalhe");

  const clarezaDetalheWrapper = document.getElementById("clareza-detalhe-wrapper");
  const clarezaDetalhe = document.getElementById("clareza_detalhe");

  const syncVisualExtras = () => {
    const v = getChecked("visual")?.value || "";
    const show = v === "Pior";

    if (visualDetalheWrapper) visualDetalheWrapper.classList.toggle("hidden", !show);

    // se estiver escondendo, limpa
    if (!show && visualDetalhe) visualDetalhe.value = "";
  };

  const syncConfiancaExtras = () => {
    const v = getChecked("confianca")?.value || "";
    const show = v === "Não transmite" || v === "Transmite pouco";

    if (confiancaDetalheWrapper) confiancaDetalheWrapper.classList.toggle("hidden", !show);
    if (!show && confiancaDetalhe) confiancaDetalhe.value = "";
  };

  const syncClarezaExtras = () => {
    const v = getChecked("clareza")?.value || "";
    const show = v === "Nada claras" || v === "Pouco claras";

    if (clarezaDetalheWrapper) clarezaDetalheWrapper.classList.toggle("hidden", !show);
    if (!show && clarezaDetalhe) clarezaDetalhe.value = "";
  };

  form.addEventListener("change", (e) => {
  const t = e.target;
    if (!(t instanceof HTMLElement)) return;

    if (t.matches('input[name="visual"]')) syncVisualExtras();
    if (t.matches('input[name="confianca"]')) syncConfiancaExtras();
    if (t.matches('input[name="clareza"]')) syncClarezaExtras();
  });

  // roda uma vez na carga
  syncVisualExtras();
  syncConfiancaExtras();
  syncClarezaExtras();

  // remove erro conforme usuário interage
  ["change", "input", "blur"].forEach((evt) => {
    form.addEventListener(
      evt,
      (e) => {
        const target = e.target;
        if (!target || !(target instanceof HTMLElement)) return;

        const mapById = {
          dificuldade: "dificuldade",
          problema_local: "problema_local",
          melhorar: "melhorar",
          pagina: "pagina",
          email: "email",
          consentimento: "consentimento"
        };

        if (target.id && mapById[target.id]) {
          const key = mapById[target.id];
          const ok = fields[key].validate(fields[key].el);
          setError(key, !ok);
          if (alertBox) alertBox.classList.add("hidden");
        }

        // radios (limpa erro ao marcar)
        const radioNames = [
          "perfil",
          "objetivo",
          "uso_anterior",
          "facilidade",
          "encontrou",
          "visual",
          "clareza",
          "confianca",
          "problema_tecnico"
        ];

        radioNames.forEach((name) => {
          if (target.matches && target.matches(`input[name="${name}"]`)) {
            setError(name, false);
            if (alertBox) alertBox.classList.add("hidden");
          }
        });
      },
      true
    );
  });

  form.addEventListener("submit", (e) => {
    // garante que wrappers estejam no estado correto antes de validar
    syncDificuldade();
    syncProblemaLocal();
    syncVisualExtras();
    syncConfiancaExtras();
    syncClarezaExtras();


    const { ok, firstInvalid } = validateAll();
    if (!ok) {
      e.preventDefault();
      if (firstInvalid && firstInvalid.focus) firstInvalid.focus();
      if (alertBox) alertBox.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
})();

// feedback.js — seta dos selects (controle por classe .is-open)
(() => {
  const wraps = Array.from(document.querySelectorAll(".feedback-select"));
  if (!wraps.length) return;

  const closeAll = (except = null) => {
    wraps.forEach((w) => {
      if (w !== except) w.classList.remove("is-open");
    });
  };

  const isInsideAny = (target) => wraps.some((w) => w.contains(target));

  wraps.forEach((wrap) => {
    const sel = wrap.querySelector("select");
    if (!sel) return;

    sel.addEventListener("pointerdown", () => {
      closeAll(wrap);
      wrap.classList.add("is-open");
    });

    sel.addEventListener("change", () => {
      wrap.classList.remove("is-open");
    });

    sel.addEventListener("blur", () => {
      wrap.classList.remove("is-open");
    });

    sel.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        wrap.classList.remove("is-open");
        sel.blur();
      }
    });
  });

  document.addEventListener(
    "pointerdown",
    (e) => {
      if (!isInsideAny(e.target)) closeAll(null);
    },
    true
  );

  document.addEventListener(
    "focusin",
    (e) => {
      if (!isInsideAny(e.target)) closeAll(null);
    },
    true
  );
})();
