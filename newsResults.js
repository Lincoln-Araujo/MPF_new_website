/* mpf-noticias.js
   ✅ Filtro por unidade (Órgão) apenas
   ✅ Lista do aside (sticky) + dropdown mobile
   ✅ Busca por palavra-chave (título + resumo)
   ✅ Categoria
   ✅ Ordenação por data/hora (data-datetime ISO) com fallback (data-date)
   ✅ Filtragem NÃO automática: só aplica ao clicar "Filtrar"
   ✅ Toggle Cards/Lista (desktop) com localStorage
   ✅ Default inicia em LISTA
*/

(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // ====== LISTA DE ÓRGÃOS (igual ao select do MPF atual) ======
  const ORGAOS_MPF_ATUAL = [
    { id: "/portal/rs", label: "Procuradoria da República no Rio Grande do Sul" },
    { id: "/portal/regiao1", label: "Procuradoria Regional da República da 1ª Região" },
    { id: "/portal/presp", label: "Procuradoria Regional Eleitoral em São Paulo" },
    { id: "/portal/al", label: "Procuradoria da República em Alagoas" },
    { id: "/portal/ac", label: "Procuradoria da República no Acre" },
    { id: "/portal/rj", label: "Procuradoria da República no Rio de Janeiro" },
    { id: "/portal/regiao6", label: "MPF-MG de 2º Grau" },
    { id: "/portal/preal", label: "Procuradoria Regional Eleitoral em Alagoas" },
    { id: "/portal/pgr", label: "Procuradoria-Geral da República" },
    { id: "/portal/preap", label: "Procuradoria Regional Eleitoral no Amapá" },
    { id: "/portal/predf", label: "Procuradoria Regional Eleitoral no Distrito Federal" },
    { id: "/portal/prems", label: "Procuradoria Regional Eleitoral no Mato Grosso do Sul" },
    { id: "/portal/ap", label: "Procuradoria da República no Amapá" },
    { id: "/portal/prepa", label: "Procuradoria Regional Eleitoral no Pará" },
    { id: "/portal/regiao3", label: "Procuradoria Regional da República da 3ª Região" },
    { id: "/portal/mt", label: "Ministério Público Federal em Mato Grosso" },
    { id: "/portal/premt", label: "Procuradoria Regional Eleitoral em Mato Grosso" },
    { id: "/portal/prego", label: "Procuradoria Regional Eleitoral em Goiás" },
    { id: "/portal/prero", label: "Procuradoria Regional Eleitoral em Rondônia" },
    { id: "/portal/pge", label: "Procuradoria-Geral Eleitoral" },
    { id: "/portal/ba", label: "Procuradoria da República na Bahia" },
    { id: "/portal/rr", label: "Procuradoria da República em Roraima" },
    { id: "/portal/prerj", label: "Procuradoria Regional Eleitoral no Rio de Janeiro" },
    { id: "/portal/regiao5", label: "Procuradoria Regional da República da 5ª Região" },
    { id: "/portal/prepr", label: "Procuradoria Regional Eleitoral no Paraná" },
    { id: "/portal/sc", label: "Procuradoria da República em Santa Catarina" },
    { id: "/portal/prese", label: "Procuradoria Regional Eleitoral em Sergipe" },
    { id: "/portal/pi", label: "Procuradoria da República no Piauí" },
    { id: "/portal/preac", label: "Procuradoria Regional Eleitoral no Acre" },
    { id: "/portal/se", label: "Procuradoria da República em Sergipe" },
    { id: "/portal/ms", label: "Procuradoria da República em Mato Grosso do Sul" },
    { id: "/portal/es", label: "Procuradoria da República no Espírito Santo" },
    { id: "/portal/prern", label: "Procuradoria Regional Eleitoral no Rio Grande do Norte" },
    { id: "/portal/sp", label: "Procuradoria da República em São Paulo" },
    { id: "/portal/prepb", label: "Procuradoria Regional Eleitoral na Paraíba" },
    { id: "/portal/ce", label: "Procuradoria da República no Ceará" },
    { id: "/portal/preto", label: "Procuradoria Regional Eleitoral no Tocantins" },
    { id: "/portal/rn", label: "Procuradoria da República no Rio Grande do Norte" },
    { id: "/portal/pa", label: "Procuradoria da República no Pará" },
    { id: "/portal/prees", label: "Procuradoria Regional Eleitoral no Espírito Santo" },
    { id: "/portal/prece", label: "Procuradoria Regional Eleitoral no Ceará" },
    { id: "/portal/preba", label: "Procuradoria Regional Eleitoral na Bahia" },
    { id: "/portal/regiao4", label: "Procuradoria Regional da República da 4ª Região" },
    { id: "/portal/premg", label: "Procuradoria Regional Eleitoral em Minas Gerais" },
    { id: "/portal/pe", label: "Procuradoria da República em Pernambuco" },
    { id: "/portal/presc", label: "Procuradoria Regional Eleitoral em Santa Catarina" },
    { id: "/portal/pream", label: "Procuradoria Regional Eleitoral no Amazonas" },
    { id: "/portal/am", label: "Procuradoria da República no Amazonas" },
    { id: "/portal/ro", label: "Procuradoria da República em Rondônia" },
    { id: "/portal/mg", label: "MPF-MG de 1º grau" },
    { id: "/portal/prema", label: "Procuradoria Regional Eleitoral no Maranhão" },
    { id: "/portal/regiao2", label: "Procuradoria Regional da República da 2ª Região" },
    { id: "/portal/prers", label: "Procuradoria Regional Eleitoral no Rio Grande do Sul" },
    { id: "/portal/prepe", label: "Procuradoria Regional Eleitoral em Pernambuco" },
    { id: "/portal/pb", label: "Procuradoria da República na Paraíba" },
    { id: "/portal/go", label: "Procuradoria da República em Goiás" },
    { id: "/portal/to", label: "Procuradoria da República no Tocantins" },
    { id: "/portal/df", label: "Procuradoria da República no Distrito Federal" },
    { id: "/portal/ma", label: "Procuradoria da República no Maranhão" },
    { id: "/portal/pr", label: "Procuradoria da República no Paraná" },
    { id: "/portal/prepi", label: "Procuradoria Regional Eleitoral no Piauí" },
  ];

  // Aliases opcionais (se algum card vier com valor curto no futuro)
  const ORIGIN_ALIASES = new Map([
    ["pgr", "/portal/pgr"],
    ["pge", "/portal/pge"],
    ["presp", "/portal/presp"],
  ]);

  const ORGAO_LABEL = new Map(ORGAOS_MPF_ATUAL.map((x) => [x.id, x.label]));

  function normalizeOriginId(raw) {
    const v = String(raw || "").trim();
    if (!v) return "";
    if (v.startsWith("/portal/")) return v;
    return ORIGIN_ALIASES.get(v) || v;
  }

  // ====== ELEMENTS ======
  const results = $("#news-results");
  if (!results) return;

  const items = () => $$(".news-item", results);

  const countEl = $("#news-count");
  const statusEl = $("#filter-status");

  const searchInput = $("#news-search");
  const catSelect = $("#news-category");
  const sortSelect = $("#news-sort");
  const applyBtn = $("#applyFilters");

  // View (Cards/Lista) - botões agora no header "Resultados"
  const viewBtns = $$(".news-view-btn");

  // Aside (Unidade)
  const asideSearch = $("#asideSearch");
  const asideList = $("#asideList");

  // Mobile unidade
  const itemMobile = $("#itemMobile");

  // ====== STATE ======
  // state = aplicado (só muda quando clica Filtrar)
  const state = {
    selected: "",
    q: "",
    category: "",
    sort: "recentes",
    view: "list", // ✅ default lista
  };

  // draft = o que o usuário está mexendo nos inputs
  const draft = { ...state };

  // ====== HELPERS ======
  function normalizeText(s) {
    return String(s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "");
  }

  function getSelectedLabel(originId) {
    if (!originId) return "";
    return ORGAO_LABEL.get(originId) || originId;
  }

  function parseDateMs(el) {
    // Prefer data-datetime ISO completo
    const dt = el.dataset.datetime;
    if (dt) {
      const ms = new Date(dt).getTime();
      if (!Number.isNaN(ms)) return ms;
    }

    // Fallback antigo: data-date="YYYY-MM-DD"
    const d = el.dataset.date;
    if (d) {
      const ms = new Date(`${d}T00:00:00`).getTime();
      if (!Number.isNaN(ms)) return ms;
    }

    return 0;
  }

  function formatDateTime(isoOrDate) {
    if (!isoOrDate) return "";

    // aceita tanto ISO quanto "YYYY-MM-DD"
    const d = new Date(isoOrDate.includes("T") ? isoOrDate : `${isoOrDate}T00:00:00`);
    if (Number.isNaN(d.getTime())) return "";

    const pad = (n) => String(n).padStart(2, "0");
    const dd = pad(d.getDate());
    const mm = pad(d.getMonth() + 1);
    const yyyy = d.getFullYear();
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());

    // se veio só data (00:00), você pode preferir mostrar sem hora — mas aqui sempre mostra hora
    return `${dd}/${mm}/${yyyy} • ${hh}:${mi}`;
  }

  // ====== VIEW ======
  function setView(view) {
    // no mobile, pode manter lista sempre (opcional)
    if (!window.matchMedia("(min-width: 640px)").matches) {
      results.classList.remove("is-cards");
      results.classList.add("is-list");
      return;
    }

    const v = view === "cards" ? "cards" : "list";

    results.classList.toggle("is-list", v === "list");
    results.classList.toggle("is-cards", v === "cards");

    viewBtns.forEach((b) => {
      const active = b.dataset.view === v;
      b.setAttribute("aria-pressed", active ? "true" : "false");
      b.classList.toggle("bg-gray-900", active);
      b.classList.toggle("text-white", active);
      b.classList.toggle("bg-white", !active);
      b.classList.toggle("text-gray-900", !active);
    });

    try {
      localStorage.setItem("mpf_news_view", v);
    } catch (e) {}
  }

  // ====== HYDRATE TIME (preenche <time data-role="datetime"> ) ======
  function hydrateTimes() {
    items().forEach((el) => {
      const t = el.querySelector('[data-role="datetime"]');
      if (!t) return;

      const iso = el.dataset.datetime;
      const fallback = el.dataset.date;

      const text = iso ? formatDateTime(iso) : formatDateTime(fallback);
      if (text) t.textContent = text;
    });
  }

  // ====== RENDER LISTS ======
  function renderMobileOptions() {
    if (!itemMobile) return;

    itemMobile.innerHTML = [
      `<option value="">Todas</option>`,
      ...ORGAOS_MPF_ATUAL.map((x) => `<option value="${x.id}">${x.label}</option>`),
    ].join("");
  }

  function syncMobile() {
    if (itemMobile) itemMobile.value = draft.selected || "";
  }

  function renderAsideList() {
    if (!asideList) return;

    const q = (asideSearch?.value || "").trim().toLowerCase();
    const list = ORGAOS_MPF_ATUAL.filter((x) => !q || x.label.toLowerCase().includes(q));

    asideList.innerHTML = list
      .map((x) => {
        const active = x.id === draft.selected;
        return `
          <li>
            <button type="button"
              class="w-full text-left rounded-md px-3 py-2 text-sm font-semibold
                     border ${active ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 bg-white text-gray-900"}
                     hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)]/30"
              data-select="${x.id}">
              ${x.label}
            </button>
          </li>
        `;
      })
      .join("");

    $$("#asideList [data-select]").forEach((btn) => {
      btn.addEventListener("click", () => {
        draft.selected = btn.dataset.select || "";
        renderAsideList();
        syncMobile();
      });
    });
  }

  // ====== FILTER LOGIC ======
  function matchOrigin(el) {
    if (!state.selected) return true;
    const origin = normalizeOriginId(el.dataset.origin || "");
    return origin === state.selected;
  }

  function matchCategory(el) {
    if (!state.category) return true;
    return (el.dataset.category || "") === state.category;
  }

  function matchSearch(el) {
    const q = normalizeText(state.q);
    if (!q) return true;

    // título
    const title = el.querySelector("h1,h2,h3,h4")?.textContent || "";

    // resumo (primeiro parágrafo descritivo)
    // se o primeiro <p> for o chapéu em algum template futuro, você pode refinar,
    // mas com seu HTML atual o resumo está no <p> com line-clamp.
    const summary = el.querySelector("p.mt-2")?.textContent || el.querySelector("p")?.textContent || "";

    const hay = normalizeText(`${title} ${summary}`);
    return hay.includes(q);
  }

  function applyFilters() {
    items().forEach((el) => {
      const ok = matchOrigin(el) && matchCategory(el) && matchSearch(el);
      el.hidden = !ok;
    });
  }

  function applySorting() {
    const list = items();
    const visible = list.filter((el) => !el.hidden);

    visible.sort((a, b) => {
      const da = parseDateMs(a);
      const db = parseDateMs(b);
      return state.sort === "antigas" ? da - db : db - da;
    });

    // reappend visíveis na ordem correta (mantém hidden fora)
    visible.forEach((el) => results.appendChild(el));
  }

  function updateCount() {
    if (!countEl) return;
    const visible = items().filter((el) => !el.hidden).length;
    countEl.textContent = String(visible);
  }

  function updateStatus() {
    if (!statusEl) return;

    const parts = [];
    if (state.selected) parts.push(`Unidade: ${getSelectedLabel(state.selected)}`);
    if (state.category) parts.push(`Categoria: ${state.category}`);
    if (state.q) parts.push(`Busca: “${state.q}”`);

    statusEl.textContent = parts.length ? `Filtrado por ${parts.join(" • ")}.` : "Exibindo todas as notícias.";
  }

  function applyAll() {
    applyFilters();
    applySorting();
    updateCount();
    updateStatus();
  }

  // ====== EVENTS (draft only) ======
  if (asideSearch) asideSearch.addEventListener("input", renderAsideList);

  if (itemMobile) {
    itemMobile.addEventListener("change", (e) => {
      draft.selected = e.target.value || "";
      renderAsideList();
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      draft.q = searchInput.value.trim();
    });
  }

  if (catSelect) {
    catSelect.addEventListener("change", () => {
      draft.category = catSelect.value || "";
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener("change", () => {
      draft.sort = sortSelect.value || "recentes";
    });
  }

  // ✅ aplica quando clicar Filtrar
  if (applyBtn) {
    applyBtn.addEventListener("click", () => {
      Object.assign(state, draft);
      applyAll();
    });
  }

  // View toggle (imediato, não depende do Filtrar)
  viewBtns.forEach((b) => {
    b.addEventListener("click", () => {
      const v = b.dataset.view || "list";
      state.view = v;
      setView(v);
    });
  });

  // ====== INIT ======
  // conta inicial
  if (countEl) countEl.textContent = String(items().length);

  // view inicial (default list)
  let saved = "list";
  try {
    saved = localStorage.getItem("mpf_news_view") || "list";
  } catch (e) {}
  state.view = saved;
  setView(state.view);

  // mantém comportamento responsivo
  window.addEventListener("resize", () => setView(state.view));

  // popula selects/listas
  renderMobileOptions();
  syncMobile();
  renderAsideList();

  // preenche data/hora nos cards (se tiver data-datetime)
  hydrateTimes();

  // estado inicial: sem filtros aplicados
  // (como draft começa igual state, não precisa aplicar nada)
  applyAll();
})();
