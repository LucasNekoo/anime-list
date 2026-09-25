export const CATEGORIES = [
  "Ação",
  "Aventura",
  "Comédia",
  "Drama",
  "Fantasia",
  "Isekai",
  "Romance",
  "Terror",
  "Suspense",
];

export const SORT_OPTIONS = [
  { id: "nota", label: "Mais bem avaliados" },
  { id: "votos", label: "Mais votados" },
  { id: "alfabetica", label: "A-Z" },
];

export const ANIMES = [
  { id: "chainsaw-man", nome: "Chainsaw Man", categorias: ["Ação", "Terror", "Comédia"] },
  { id: "charlotte", nome: "Charlotte", categorias: ["Drama", "Fantasia", "Suspense"] },
  { id: "cowboy-bebop", nome: "Cowboy Bebop", categorias: ["Ação", "Aventura", "Drama"] },
  { id: "dandadan", nome: "Dandadan", categorias: ["Ação", "Comédia", "Terror"] },
  { id: "darling-in-the-franxx", nome: "Darling in the Franxx", categorias: ["Ação", "Romance", "Drama"] },
  { id: "fullmetal-alchemist", nome: "Fullmetal Alchemist: Brotherhood", categorias: ["Ação", "Aventura", "Fantasia", "Drama"] },
  { id: "hunter-x-hunter", nome: "Hunter x Hunter", categorias: ["Ação", "Aventura", "Fantasia"] },
  { id: "jujutsu-kaisen", nome: "Jujutsu Kaisen", categorias: ["Ação", "Terror", "Fantasia"] },
  { id: "kimetsu-no-yaiba", nome: "Demon Slayer: Kimetsu no Yaiba", categorias: ["Ação", "Aventura", "Fantasia"] },
  { id: "kusuriya-no-hitorigoto", nome: "The Apothecary Diaries", categorias: ["Drama", "Suspense", "Comédia"] },
  { id: "mieruko-chan", nome: "Mieruko-chan", categorias: ["Terror", "Comédia", "Suspense"] },
  { id: "mushoku-tensei", nome: "Mushoku Tensei: Jobless Reincarnation", categorias: ["Isekai", "Fantasia", "Aventura", "Drama"] },
  { id: "my-dress-up-darling", nome: "My Dress-Up Darling", categorias: ["Romance", "Comédia"] },
  { id: "noragami", nome: "Noragami", categorias: ["Ação", "Fantasia", "Comédia"] },
  { id: "re-zero", nome: "Re:Zero − Starting Life in Another World", categorias: ["Isekai", "Drama", "Suspense", "Fantasia"] },
  { id: "shingeki-no-kyojin", nome: "Attack on Titan", categorias: ["Ação", "Drama", "Suspense"] },
  { id: "solo-leveling", nome: "Solo Leveling", categorias: ["Ação", "Aventura", "Fantasia"] },
  { id: "sousou-no-frieren", nome: "Frieren: Beyond Journey's End", categorias: ["Aventura", "Fantasia", "Drama"] },
  { id: "sword-art-online", nome: "Sword Art Online", categorias: ["Ação", "Aventura", "Fantasia"] },
  { id: "yakusoku-no-neverland", nome: "The Promised Neverland", categorias: ["Suspense", "Drama", "Terror"] },
];

/** Ordem sugerida para quem está começando: do mais leve ao mais intenso. */
export const START_ORDER = [
  "kimetsu-no-yaiba",
  "fullmetal-alchemist",
  "jujutsu-kaisen",
  "shingeki-no-kyojin",
  "hunter-x-hunter",
  "mushoku-tensei",
  "re-zero",
  "sword-art-online",
  "solo-leveling",
  "noragami",
  "dandadan",
  "chainsaw-man",
  "my-dress-up-darling",
  "charlotte",
  "mieruko-chan",
  "yakusoku-no-neverland",
  "kusuriya-no-hitorigoto",
  "cowboy-bebop",
  "sousou-no-frieren",
  "darling-in-the-franxx",
];

export const posterUrl = (id) => `assets/posters/${id}.jpg`;
