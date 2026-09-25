/** Minúsculas e sem acentos, para buscas como "acao" encontrarem "Ação". */
export const normalize = (text) =>
  text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();

export const average = (totals) => (totals?.count ? totals.sum / totals.count : null);

export const formatScore = (value) => value.toFixed(1).replace(".", ",");

export const pluralize = (count, singular, plural) => `${count} ${count === 1 ? singular : plural}`;

/** Converte uma nota (0–10) na largura de preenchimento das estrelas. */
export const starFill = (score) => `${Math.max(0, Math.min(100, score * 10))}%`;
