/*
 * Dados da AnimeList.
 *
 * Para adicionar um anime:
 *   1. Coloque a capa em assets/capas/<id>.jpg (retrato, de preferência 520x780).
 *   2. Adicione um objeto em ANIMES com o mesmo id.
 *   3. (Opcional) Inclua o id em ORDEM_INICIO para ele aparecer em "Por onde começar".
 *
 * "alt" guarda outros nomes do anime, usados apenas na busca.
 */

const CATEGORIAS = ["Ação", "Aventura", "Comédia", "Drama", "Fantasia", "Isekai", "Romance", "Terror", "Suspense"];

const ANIMES = [
  { id: "arcane", nome: "Arcane", alt: ["League of Legends"], categorias: ["Ação", "Drama", "Fantasia"] },
  { id: "chainsaw-man", nome: "Chainsaw Man", alt: [], categorias: ["Ação", "Terror", "Comédia"] },
  { id: "charlotte", nome: "Charlotte", alt: [], categorias: ["Drama", "Fantasia", "Suspense"] },
  { id: "cowboy-bebop", nome: "Cowboy Bebop", alt: [], categorias: ["Ação", "Aventura", "Drama"] },
  { id: "dandadan", nome: "Dandadan", alt: ["Dan Da Dan"], categorias: ["Ação", "Comédia", "Terror"] },
  { id: "darling-in-the-franxx", nome: "Darling in the Franxx", alt: [], categorias: ["Ação", "Romance", "Drama"] },
  { id: "fullmetal-alchemist", nome: "Fullmetal Alchemist: Brotherhood", alt: ["Hagane no Renkinjutsushi", "FMA"], categorias: ["Ação", "Aventura", "Fantasia", "Drama"] },
  { id: "hunter-x-hunter", nome: "Hunter x Hunter", alt: [], categorias: ["Ação", "Aventura", "Fantasia"] },
  { id: "jujutsu-kaisen", nome: "Jujutsu Kaisen", alt: [], categorias: ["Ação", "Terror", "Fantasia"] },
  { id: "kimetsu-no-yaiba", nome: "Demon Slayer: Kimetsu no Yaiba", alt: [], categorias: ["Ação", "Aventura", "Fantasia"] },
  { id: "kusuriya-no-hitorigoto", nome: "The Apothecary Diaries", alt: ["Kusuriya no Hitorigoto"], categorias: ["Drama", "Suspense", "Comédia"] },
  { id: "made-in-abyss", nome: "Made in Abyss", alt: [], categorias: ["Aventura", "Fantasia", "Drama"] },
  { id: "mieruko-chan", nome: "Mieruko-chan", alt: [], categorias: ["Terror", "Comédia", "Suspense"] },
  { id: "mushoku-tensei", nome: "Mushoku Tensei: Jobless Reincarnation", alt: [], categorias: ["Isekai", "Fantasia", "Aventura", "Drama"] },
  { id: "my-dress-up-darling", nome: "My Dress-Up Darling", alt: ["Sono Bisque Doll wa Koi wo Suru"], categorias: ["Romance", "Comédia"] },
  { id: "neon-genesis-evangelion", nome: "Neon Genesis Evangelion", alt: ["Evangelion", "Eva"], categorias: ["Ação", "Drama", "Suspense"] },
  { id: "noragami", nome: "Noragami", alt: [], categorias: ["Ação", "Fantasia", "Comédia"] },
  { id: "one-punch-man", nome: "One Punch Man", alt: ["One-Punch Man"], categorias: ["Ação", "Comédia"] },
  { id: "re-zero", nome: "Re:Zero − Starting Life in Another World", alt: ["Re Zero", "Re:Zero kara Hajimeru Isekai Seikatsu"], categorias: ["Isekai", "Drama", "Suspense", "Fantasia"] },
  { id: "shangri-la-frontier", nome: "Shangri-La Frontier", alt: [], categorias: ["Ação", "Aventura", "Fantasia"] },
  { id: "shingeki-no-kyojin", nome: "Attack on Titan", alt: ["Shingeki no Kyojin"], categorias: ["Ação", "Drama", "Suspense"] },
  { id: "solo-leveling", nome: "Solo Leveling", alt: ["Ore dake Level Up na Ken"], categorias: ["Ação", "Aventura", "Fantasia"] },
  { id: "sousou-no-frieren", nome: "Frieren: Beyond Journey's End", alt: ["Sousou no Frieren"], categorias: ["Aventura", "Fantasia", "Drama"] },
  { id: "spy-x-family", nome: "Spy x Family", alt: [], categorias: ["Ação", "Comédia"] },
  { id: "sword-art-online", nome: "Sword Art Online", alt: ["SAO"], categorias: ["Ação", "Aventura", "Fantasia"] },
  { id: "tensura", nome: "That Time I Got Reincarnated as a Slime", alt: ["Tensei shitara Slime Datta Ken", "Tensura"], categorias: ["Isekai", "Fantasia", "Comédia"] },
  { id: "yakusoku-no-neverland", nome: "The Promised Neverland", alt: ["Yakusoku no Neverland"], categorias: ["Suspense", "Drama", "Terror"] },
  { id: "zero-no-tsukaima", nome: "The Familiar of Zero", alt: ["Zero no Tsukaima"], categorias: ["Isekai", "Romance", "Comédia", "Fantasia"] },
];

/* Ordem sugerida para quem está começando: do mais leve e acessível ao mais intenso. */
const ORDEM_INICIO = [
  "kimetsu-no-yaiba", "fullmetal-alchemist", "jujutsu-kaisen", "shingeki-no-kyojin", "hunter-x-hunter",
  "mushoku-tensei", "re-zero", "sword-art-online", "solo-leveling", "noragami",
  "dandadan", "chainsaw-man", "my-dress-up-darling", "charlotte", "mieruko-chan",
  "yakusoku-no-neverland", "kusuriya-no-hitorigoto", "cowboy-bebop", "sousou-no-frieren", "darling-in-the-franxx",
];
