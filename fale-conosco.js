/* fale-conosco.v2.js — versão FINAL (sem campo de página) */
(() => {
  const form = document.getElementById("contato-form");
  if (!form) return;

  const alertBox = document.getElementById("form-alert");
  const submitBtn = form.querySelector('button[type="submit"]');

  const loadedAtInput = document.getElementById("form_loaded_at");
  const elapsedInput = document.getElementById("form_elapsed_ms");
  const honeypot = document.getElementById("website");

  const wantReply = document.getElementById("want_reply");
  const nome = document.getElementById("nome");
  const email = document.getElementById("email");
  const assunto = document.getElementById("assunto");
  const area = document.getElementById("area");
  const mensagem = document.getElementById("mensagem");
  const tipoOutro = document.getElementById("tipo_outro");

  const modal = document.getElementById("sens-modal");
  const modalList = document.getElementById("sens-modal-list");
  const modalCancel = document.getElementById("sens-modal-cancel");
  const modalProceed = document.getElementById("sens-modal-proceed");

  let allowProceedOnce = false;
  let lastActiveEl = null;

  const MIN_ELAPSED_MS = 1200;
  const MAX_MESSAGE_LEN = 4000;

  const loadedAt = Date.now();
  if (loadedAtInput) loadedAtInput.value = String(loadedAt);

  const $ = (id) => document.getElementById(id);

  function showAlert() {
    alertBox?.classList.remove("hidden");
  }
  function hideAlert() {
    alertBox?.classList.add("hidden");
  }

  function setError(field, errorId, hasError) {
    if (!field) return;
    const err = errorId ? $(errorId) : null;

    field.classList.toggle("border-red-500", hasError);
    field.classList.toggle("ring-2", hasError);
    field.classList.toggle("ring-red-200", hasError);

    if (err) err.classList.toggle("hidden", !hasError);

    if (hasError) {
      field.setAttribute("aria-invalid", "true");
      if (errorId) field.setAttribute("aria-describedby", errorId);
    } else {
      field.removeAttribute("aria-invalid");
    }
  }

  function focusFirstInvalid() {
    const first = form.querySelector('[aria-invalid="true"]');
    if (first) {
      first.focus({ preventScroll: true });
      first.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  function getRadio(name) {
    return form.querySelector(`input[name="${name}"]:checked`)?.value || "";
  }

  function isValidEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  function detectSensitive(text) {
    const t = text || "";
    const findings = [];

    if (/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/.test(t)) findings.push("Possível CPF detectado.");
    if (/\b\d{5}-?\d{3}\b/.test(t)) findings.push("Possível CEP detectado.");
    if (/\b(?:\+?55\s*)?(?:\(?\d{2}\)?\s*)?(?:9?\d{4})-?\d{4}\b/.test(t)) findings.push("Possível telefone detectado.");
    if (/\b[\w.+-]+@[\w-]+\.[\w.-]+\b/.test(t)) findings.push("E-mail dentro da mensagem.");
    if (/\b(CPF|RG|CNH|endereço|processo)\b/i.test(t)) findings.push("Termos de dados pessoais detectados.");

    return findings;
  }

  function openModal(findings) {
    if (!modal) return;

    modalList.innerHTML = "";
    findings.forEach((txt) => {
      const li = document.createElement("li");
      li.className = "flex gap-3";
      li.textContent = `⚠️ ${txt}`;
      modalList.appendChild(li);
    });

    allowProceedOnce = false;
    lastActiveEl = document.activeElement;

    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
    modalCancel?.focus();
  }

  function closeModal() {
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
    lastActiveEl?.focus();
  }

  modalCancel?.addEventListener("click", closeModal);
  modalProceed?.addEventListener("click", () => {
    allowProceedOnce = true;
    closeModal();
    form.requestSubmit(submitBtn);
  });

  function syncWantReplyUI() {
  const mustReply = wantReply.checked;

  // regras funcionais
  email.required = mustReply;
  nome.required = mustReply;

  // feedback visual (asterisco no label do e-mail)
  const emailLabel = form.querySelector('label[for="email"]');
  if (!emailLabel) return;

  let star = emailLabel.querySelector('[data-required-star="email"]');

  if (mustReply && !star) {
    star = document.createElement("span");
    star.dataset.requiredStar = "email";
    star.className = "text-red-600";
    star.textContent = " *";
    emailLabel.appendChild(star);
  }

  if (!mustReply && star) {
    star.remove();
  }
}

wantReply?.addEventListener("change", syncWantReplyUI);
syncWantReplyUI(); // garante estado inicial correto


  form.addEventListener("submit", (e) => {
    const isStatic = !form.action || form.action === "#" || form.action.endsWith("#");

    if (submitBtn.disabled) {
      e.preventDefault();
      return;
    }

    let ok = true;
    hideAlert();

    if (honeypot?.value) ok = false;
    if (Date.now() - loadedAt < MIN_ELAPSED_MS) ok = false;

    if (!getRadio("tipo")) {
      $("tipo-erro")?.classList.remove("hidden");
      ok = false;
    }

    if (getRadio("tipo") === "Outro") {
      const err = !tipoOutro.value.trim();
      setError(tipoOutro, null, err);
      if (err) ok = false;
    }

    if (!assunto.value.trim()) {
      setError(assunto, "assunto-erro", true);
      ok = false;
    }

    if (!area.value) {
      setError(area, "area-erro", true);
      ok = false;
    }

    if (mensagem.value.trim().length < 10 || mensagem.value.length > MAX_MESSAGE_LEN) {
      setError(mensagem, "mensagem-erro", true);
      ok = false;
    }

    if (email.required && !isValidEmail(email.value)) {
      setError(email, "email-erro", true);
      ok = false;
    }

    if (!document.getElementById("consentimento").checked) {
      ok = false;
    }

    if (!ok) {
      e.preventDefault();
      showAlert();
      focusFirstInvalid();
      return;
    }

    const findings = detectSensitive(`${assunto.value}\n${mensagem.value}`);
    if (findings.length && !allowProceedOnce) {
      e.preventDefault();
      openModal(findings);
      return;
    }

    submitBtn.disabled = true;

    if (isStatic) {
      e.preventDefault();
      document.getElementById("form-success")?.classList.remove("hidden");
      setTimeout(() => (submitBtn.disabled = false), 1500);
    }
  });
})();
