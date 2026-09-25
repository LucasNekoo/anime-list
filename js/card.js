import { posterUrl } from "./data.js";
import { MAX_SCORE, MIN_SCORE } from "./ratings.js";
import { average, formatScore, pluralize, starFill } from "./utils.js";

const template = document.getElementById("card-template");

/** Cria o card de um anime. As partes que mudam são atualizadas por `updateCard`. */
export function createCard(anime) {
  const card = template.content.firstElementChild.cloneNode(true);
  card.dataset.id = anime.id;

  const poster = card.querySelector(".poster img");
  poster.src = posterUrl(anime.id);
  poster.alt = `Capa de ${anime.nome}`;

  card.querySelector(".card-title").textContent = anime.nome;

  card.querySelector(".card-tags").append(
    ...anime.categorias.map((categoria) => {
      const tag = document.createElement("span");
      tag.className = "tag";
      tag.textContent = `#${categoria}`;
      return tag;
    }),
  );

  const starInput = card.querySelector(".star-input");
  starInput.setAttribute("aria-label", `Avalie ${anime.nome} de ${MIN_SCORE} a ${MAX_SCORE}`);

  const hits = [];
  for (let score = MIN_SCORE; score <= MAX_SCORE; score++) {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.score = score;
    button.setAttribute("role", "radio");
    button.setAttribute("aria-label", `Nota ${score} de ${MAX_SCORE}`);
    hits.push(button);
  }
  card.querySelector(".star-hits").append(...hits);

  return card;
}

/**
 * @param {HTMLElement} card
 * @param {{ totals?: {sum:number,count:number}, pending: number, submitting: boolean }} state
 */
export function updateCard(card, { totals, pending, submitting }) {
  const avg = average(totals);

  card.querySelector(".stars-mini").style.setProperty("--fill", starFill(avg ?? 0));
  card.querySelector(".average-value").textContent = `${avg === null ? "—" : formatScore(avg)} / ${MAX_SCORE}`;
  card.querySelector(".vote-count").textContent = totals?.count
    ? pluralize(totals.count, "avaliação", "avaliações")
    : "Sem avaliações ainda";

  previewScore(card, pending);

  // Roving tabindex: só a estrela selecionada (ou a primeira) entra no Tab.
  const focusable = pending || MIN_SCORE;
  for (const button of card.querySelectorAll("[data-score]")) {
    const score = Number(button.dataset.score);
    button.setAttribute("aria-checked", String(score === pending));
    button.tabIndex = score === focusable ? 0 : -1;
  }

  card.querySelector(".pending-score").textContent = pending ? `${pending} / ${MAX_SCORE}` : "";

  const confirm = card.querySelector(".confirm");
  confirm.disabled = !pending || submitting;
  confirm.textContent = submitting ? "Enviando avaliação..." : "Confirmar avaliação";
}

/** Mostra uma nota nas estrelas de input sem alterar o estado (usado no hover). */
export function previewScore(card, score) {
  card.querySelector(".star-input").style.setProperty("--fill", starFill(score));
}

export function focusStar(card, score) {
  card.querySelector(`[data-score="${score}"]`)?.focus();
}
