import { ANIMES, CATEGORIES, SORT_OPTIONS, START_ORDER, posterUrl } from "./data.js";
import { createRatingStore, isValidScore, MAX_SCORE, MIN_SCORE } from "./ratings.js";
import { createCard, focusStar, previewScore, updateCard } from "./card.js";
import { showToast } from "./toast.js";
import { average, normalize } from "./utils.js";

const ALL_CATEGORIES = "Todos";

const elements = {
  search: document.getElementById("search"),
  categories: document.getElementById("categories"),
  sorts: document.getElementById("sorts"),
  grid: document.getElementById("grid"),
  empty: document.getElementById("empty"),
  path: document.getElementById("path"),
  storageNote: document.getElementById("storage-note"),
};

const state = {
  search: "",
  category: ALL_CATEGORIES,
  sort: "nota",
  /** { [animeId]: { sum, count } } */
  totals: {},
  /** Nota escolhida mas ainda não confirmada, por anime. */
  pending: new Map(),
  /** Animes com voto sendo enviado. */
  submitting: new Set(),
};

const storeReady = createRatingStore();
const cards = new Map(ANIMES.map((anime) => [anime.id, createCard(anime)]));
const searchIndex = new Map(ANIMES.map((anime) => [anime.id, normalize(anime.nome)]));

// ---------- Lista ----------

const byName = (a, b) => a.nome.localeCompare(b.nome, "pt-BR");

const comparators = {
  // Sem avaliações vão para o fim.
  nota: (a, b) => (average(state.totals[b.id]) ?? -1) - (average(state.totals[a.id]) ?? -1) || byName(a, b),
  votos: (a, b) => (state.totals[b.id]?.count ?? 0) - (state.totals[a.id]?.count ?? 0) || byName(a, b),
  alfabetica: byName,
};

function visibleAnimes() {
  const query = normalize(state.search);
  return ANIMES.filter(
    (anime) =>
      searchIndex.get(anime.id).includes(query) &&
      (state.category === ALL_CATEGORIES || anime.categorias.includes(state.category)),
  ).sort(comparators[state.sort]);
}

function renderGrid() {
  const list = visibleAnimes();

  // Reordenar remove o foco do elemento movido; guardamos para restaurar.
  const focused = document.activeElement;
  elements.grid.replaceChildren(...list.map((anime) => cards.get(anime.id)));
  if (focused?.isConnected && document.activeElement !== focused) {
    focused.focus({ preventScroll: true });
  }

  elements.empty.hidden = list.length > 0;
}

function refreshCard(animeId) {
  updateCard(cards.get(animeId), {
    totals: state.totals[animeId],
    pending: state.pending.get(animeId) ?? 0,
    submitting: state.submitting.has(animeId),
  });
}

const refreshAllCards = () => ANIMES.forEach((anime) => refreshCard(anime.id));

// ---------- Controles ----------

function createChip(label, dataset) {
  const chip = document.createElement("button");
  chip.type = "button";
  chip.className = "chip";
  chip.textContent = label;
  Object.assign(chip.dataset, dataset);
  return chip;
}

function renderControls() {
  elements.categories.append(
    ...[ALL_CATEGORIES, ...CATEGORIES].map((category) => createChip(category, { category })),
  );
  elements.sorts.append(...SORT_OPTIONS.map(({ id, label }) => createChip(label, { sort: id })));
  syncControls();
}

function syncControls() {
  for (const chip of elements.categories.children) {
    chip.setAttribute("aria-pressed", String(chip.dataset.category === state.category));
  }
  for (const chip of elements.sorts.children) {
    chip.setAttribute("aria-pressed", String(chip.dataset.sort === state.sort));
  }
}

// ---------- Por onde começar ----------

function renderStartGuide() {
  const animesById = new Map(ANIMES.map((anime) => [anime.id, anime]));

  const steps = START_ORDER.filter((id) => animesById.has(id)).map((id, index) => {
    const anime = animesById.get(id);
    const step = document.createElement("li");
    step.className = index === 0 ? "step first" : "step";

    const number = document.createElement("span");
    number.className = "step-number";
    number.textContent = index + 1;

    const img = document.createElement("img");
    img.src = posterUrl(id);
    img.alt = "";
    img.loading = "lazy";
    img.decoding = "async";

    const name = document.createElement("p");
    name.textContent = anime.nome;

    step.append(number, img);
    if (index === 0) {
      const badge = document.createElement("span");
      badge.className = "step-badge";
      badge.textContent = "Comece aqui";
      step.append(badge);
    }
    step.append(name);
    return step;
  });

  elements.path.replaceChildren(...steps);
}

// ---------- Avaliação ----------

function setPending(animeId, score) {
  state.pending.set(animeId, score);
  refreshCard(animeId);
}

async function confirmVote(animeId) {
  const score = state.pending.get(animeId);
  if (!isValidScore(score) || state.submitting.has(animeId)) return;

  state.submitting.add(animeId);
  refreshCard(animeId);

  try {
    const store = await storeReady;
    await store.addVote(animeId, score);
    state.pending.delete(animeId);
    showToast("Avaliação registrada!");
  } catch (error) {
    console.error(error);
    showToast("Não foi possível registrar sua avaliação. Tente novamente.", { error: true });
  } finally {
    state.submitting.delete(animeId);
    refreshCard(animeId);
  }
}

const STAR_KEYS = {
  ArrowRight: (score) => score + 1,
  ArrowUp: (score) => score + 1,
  ArrowLeft: (score) => score - 1,
  ArrowDown: (score) => score - 1,
  Home: () => MIN_SCORE,
  End: () => MAX_SCORE,
};

// ---------- Eventos ----------

function bindEvents() {
  elements.search.addEventListener("input", (event) => {
    state.search = event.target.value;
    renderGrid();
  });

  elements.categories.addEventListener("click", (event) => {
    const chip = event.target.closest("[data-category]");
    if (!chip) return;
    state.category = chip.dataset.category;
    syncControls();
    renderGrid();
  });

  elements.sorts.addEventListener("click", (event) => {
    const chip = event.target.closest("[data-sort]");
    if (!chip) return;
    state.sort = chip.dataset.sort;
    syncControls();
    renderGrid();
  });

  const cardOf = (target) => target.closest(".card");

  elements.grid.addEventListener("click", (event) => {
    const card = cardOf(event.target);
    if (!card) return;

    const star = event.target.closest("[data-score]");
    if (star) {
      setPending(card.dataset.id, Number(star.dataset.score));
    } else if (event.target.closest(".confirm")) {
      confirmVote(card.dataset.id);
    }
  });

  elements.grid.addEventListener("keydown", (event) => {
    const star = event.target.closest("[data-score]");
    const next = STAR_KEYS[event.key];
    if (!star || !next) return;

    event.preventDefault();
    const card = cardOf(star);
    const score = Math.max(MIN_SCORE, Math.min(MAX_SCORE, next(Number(star.dataset.score))));
    setPending(card.dataset.id, score);
    focusStar(card, score);
  });

  // Pré-visualiza a nota ao passar o mouse sobre as estrelas.
  elements.grid.addEventListener("pointerover", (event) => {
    const star = event.target.closest("[data-score]");
    if (star) previewScore(cardOf(star), Number(star.dataset.score));
  });

  elements.grid.addEventListener("pointerout", (event) => {
    const input = event.target.closest(".star-input");
    if (input && !input.contains(event.relatedTarget)) {
      const card = cardOf(input);
      previewScore(card, state.pending.get(card.dataset.id) ?? 0);
    }
  });
}

// ---------- Inicialização ----------

renderStartGuide();
renderControls();
refreshAllCards();
renderGrid();
bindEvents();

storeReady.then((store) => {
  elements.storageNote.textContent = store.shared
    ? "As avaliações são compartilhadas entre todos que acessam esta página."
    : "As avaliações ficam salvas neste navegador.";

  store.subscribe((totals) => {
    state.totals = totals;
    refreshAllCards();
    renderGrid();
  });
});
