/**
 * Armazenamento das avaliações.
 *
 * Duas implementações com a mesma interface:
 *  - shared: banco compartilhado (`window.claude.use("db")`), disponível quando a
 *    página roda como Artifact no claude.ai — todos os visitantes veem as mesmas notas;
 *  - local:  `localStorage`, usado em qualquer outro lugar — as notas ficam salvas
 *    apenas neste navegador.
 *
 * Interface: { shared: boolean, subscribe(callback), addVote(animeId, score) }
 * O callback recebe um objeto { [animeId]: { sum, count } }.
 */

export const MIN_SCORE = 1;
export const MAX_SCORE = 10;

const LOCAL_KEY = "anime-list:votes";

export const isValidScore = (score) =>
  Number.isInteger(score) && score >= MIN_SCORE && score <= MAX_SCORE;

export async function createRatingStore() {
  const db = await connectSharedDb();
  return db ? createSharedStore(db) : createLocalStore();
}

async function connectSharedDb() {
  try {
    return window.claude ? await window.claude.use("db") : null;
  } catch {
    return null;
  }
}

function createSharedStore(db) {
  const votes = db.collection("votes");

  return {
    shared: true,

    subscribe(callback) {
      votes.onSnapshot(
        (snapshot) => {
          const totals = {};
          for (const doc of snapshot.docs) {
            const vote = doc.data();
            if (vote?.animeId && isValidScore(vote.nota)) {
              addToTotals(totals, vote.animeId, vote.nota);
            }
          }
          callback(totals);
        },
        (error) => console.error("Falha ao sincronizar avaliações:", error),
      );
    },

    async addVote(animeId, score) {
      await votes.add({ animeId, nota: score, ts: Date.now() });
    },
  };
}

function createLocalStore() {
  const listeners = new Set();
  let totals = readLocal();

  const notify = () => listeners.forEach((callback) => callback(totals));

  // Mantém várias abas abertas em sincronia.
  window.addEventListener("storage", (event) => {
    if (event.key === LOCAL_KEY) {
      totals = readLocal();
      notify();
    }
  });

  return {
    shared: false,

    subscribe(callback) {
      listeners.add(callback);
      callback(totals);
    },

    async addVote(animeId, score) {
      const next = structuredClone(totals);
      addToTotals(next, animeId, score);
      localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
      totals = next;
      notify();
    },
  };
}

function readLocal() {
  try {
    const parsed = JSON.parse(localStorage.getItem(LOCAL_KEY));
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function addToTotals(totals, animeId, score) {
  const entry = (totals[animeId] ??= { sum: 0, count: 0 });
  entry.sum += score;
  entry.count += 1;
}
