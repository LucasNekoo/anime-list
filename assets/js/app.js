(() => {
  "use strict";

  /* ---------- Utilitários ---------- */

  const $ = (sel, raiz = document) => raiz.querySelector(sel);

  const escapar = (texto) =>
    String(texto).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  // Remove acentos e caixa para a busca ("acao" encontra "Ação").
  const normalizar = (texto) => texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

  const formatarMedia = (n) => n.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  const plural = (n, um, varios) => `${n} ${n === 1 ? um : varios}`;

  // localStorage pode estar bloqueado (aba anônima, cookies desativados): nunca deixar isso quebrar a página.
  const armazenamento = {
    ler(chave, padrao) {
      try {
        const valor = localStorage.getItem(chave);
        return valor === null ? padrao : JSON.parse(valor);
      } catch {
        return padrao;
      }
    },
    gravar(chave, valor) {
      try {
        localStorage.setItem(chave, JSON.stringify(valor));
      } catch {
        /* sem armazenamento: a nota vale só nesta visita */
      }
    },
  };

  const imagem = (id) => `assets/capas/${id}.jpg`;

  /* ---------- Estado ---------- */

  const porId = new Map(ANIMES.map((a) => [a.id, a]));
  const indiceBusca = new Map(ANIMES.map((a) => [a.id, normalizar([a.nome, ...(a.alt || [])].join(" "))]));

  const filtros = { busca: "", categoria: "Todas", ordem: "nota" };
  const ORDENS = [
    ["nota", "Melhor avaliados"],
    ["votos", "Mais avaliados"],
    ["nome", "A–Z"],
  ];

  const CHAVE_NOTAS = "animelist:minhas-notas";
  const CHAVE_VOTANTE = "animelist:votante";

  const minhasNotas = armazenamento.ler(CHAVE_NOTAS, {});
  let votante = armazenamento.ler(CHAVE_VOTANTE, null);
  if (!votante) {
    votante = globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    armazenamento.gravar(CHAVE_VOTANTE, votante);
  }

  let medias = {}; // id -> { soma, total }
  const rascunhos = {}; // id -> nota escolhida e ainda não salva
  const abertos = new Set(); // ids com o painel de avaliação aberto
  const salvando = new Set();
  let ordemRenderizada = "";

  // Banco compartilhado: existe apenas quando a página roda como Artifact do Claude.
  // Em qualquer outro lugar (GitHub Pages, arquivo local) as notas ficam salvas no navegador.
  const bancoPromessa = (async () => {
    try {
      return window.claude ? await window.claude.use("db") : null;
    } catch {
      return null;
    }
  })();

  /* ---------- Médias ---------- */

  function mediasLocais() {
    const resultado = {};
    for (const [id, nota] of Object.entries(minhasNotas)) {
      if (porId.has(id)) resultado[id] = { soma: nota, total: 1 };
    }
    return resultado;
  }

  // Cada navegador conta uma vez por anime: vale a nota mais recente.
  function mediasDoBanco(docs) {
    const ultimos = new Map();
    docs.forEach((doc, i) => {
      const v = doc.data?.();
      if (!v || !porId.has(v.animeId) || typeof v.nota !== "number" || v.nota < 1 || v.nota > 10) return;
      const chave = v.votante ? `${v.votante}:${v.animeId}` : `doc:${doc.id ?? i}`;
      const anterior = ultimos.get(chave);
      if (!anterior || (v.ts || 0) >= (anterior.ts || 0)) ultimos.set(chave, v);
    });
    const resultado = {};
    for (const v of ultimos.values()) {
      const m = (resultado[v.animeId] ??= { soma: 0, total: 0 });
      m.soma += v.nota;
      m.total += 1;
    }
    return resultado;
  }

  const media = (id) => {
    const m = medias[id];
    return m && m.total ? m.soma / m.total : null;
  };

  /* ---------- Lista filtrada ---------- */

  function listaVisivel() {
    const termo = normalizar(filtros.busca);
    const lista = ANIMES.filter(
      (a) =>
        (!termo || indiceBusca.get(a.id).includes(termo)) &&
        (filtros.categoria === "Todas" || a.categorias.includes(filtros.categoria))
    );
    const porNome = (x, y) => x.nome.localeCompare(y.nome, "pt-BR");
    if (filtros.ordem === "nota") {
      lista.sort((x, y) => (media(y.id) ?? -1) - (media(x.id) ?? -1) || porNome(x, y));
    } else if (filtros.ordem === "votos") {
      lista.sort((x, y) => (medias[y.id]?.total || 0) - (medias[x.id]?.total || 0) || porNome(x, y));
    } else {
      lista.sort(porNome);
    }
    return lista;
  }

  /* ---------- Renderização ---------- */

  const grade = $("#grade");
  const contador = $("#contador");

  function cardHTML(a) {
    const nome = escapar(a.nome);
    let alvos = "";
    for (let n = 1; n <= 10; n++) {
      alvos += `<label data-nota="${n}"><input type="radio" name="nota-${a.id}" value="${n}"><span class="sr-only">${n} de 10</span></label>`;
    }
    return `
      <article class="card" id="anime-${a.id}" data-id="${a.id}">
        <div class="card-capa">
          <img src="${imagem(a.id)}" alt="" loading="lazy" decoding="async" width="520" height="780">
          <span class="card-media" data-media hidden></span>
        </div>
        <h3 class="card-nome">${nome}</h3>
        <ul class="card-generos" aria-label="Categorias">
          ${a.categorias.map((c) => `<li><button type="button" data-categoria="${escapar(c)}">${escapar(c)}</button></li>`).join("")}
        </ul>
        <p class="card-meta" data-meta></p>
        <button type="button" class="card-avaliar" data-alternar aria-expanded="false" aria-controls="painel-${a.id}"></button>
        <div class="painel" id="painel-${a.id}" hidden>
          <fieldset>
            <legend class="sr-only">Sua nota para ${nome}, de 1 a 10</legend>
            <div class="estrelas">
              <div class="estrelas-faixa" data-faixa></div>
              <div class="estrelas-alvos">${alvos}</div>
            </div>
          </fieldset>
          <button type="button" class="painel-salvar" data-salvar></button>
        </div>
      </article>`;
  }

  // Atualiza só atributos e textos do card, sem recriar o HTML (preserva o foco do teclado).
  function atualizarCard(card) {
    const id = card.dataset.id;
    const m = medias[id];
    const valorMedia = media(id);
    const minha = minhasNotas[id];
    const escolhida = rascunhos[id] ?? minha ?? 0;
    const aberto = abertos.has(id);
    const ocupado = salvando.has(id);

    const selo = $("[data-media]", card);
    selo.hidden = valorMedia === null;
    if (valorMedia !== null) {
      selo.textContent = formatarMedia(valorMedia);
      selo.setAttribute("aria-label", `Média ${formatarMedia(valorMedia)} de 10`);
    }

    $("[data-meta]", card).textContent = m?.total ? plural(m.total, "nota", "notas") : "Ainda sem notas";

    const alternar = $("[data-alternar]", card);
    alternar.textContent = minha ? `Sua nota: ${minha}/10` : "Avaliar";
    alternar.classList.toggle("tem-nota", Boolean(minha));
    alternar.setAttribute("aria-expanded", String(aberto));

    const painel = $(".painel", card);
    painel.hidden = !aberto;
    if (!aberto) return;

    card.style.setProperty("--nota", escolhida);
    card.querySelectorAll("input[type=radio]").forEach((r) => {
      r.checked = Number(r.value) === escolhida;
    });
    const salvar = $("[data-salvar]", card);
    salvar.disabled = ocupado || !escolhida || escolhida === minha;
    if (ocupado) salvar.textContent = "Salvando…";
    else if (!escolhida) salvar.textContent = "Escolha uma nota";
    else if (escolhida === minha) salvar.textContent = `Sua nota atual: ${minha}/10`;
    else salvar.textContent = `${minha ? "Mudar nota para" : "Salvar nota"} ${escolhida}/10`;
  }

  function renderizarGrade() {
    const lista = listaVisivel();
    const chave = lista.map((a) => a.id).join("|");

    if (chave !== ordemRenderizada) {
      ordemRenderizada = chave;
      grade.innerHTML = lista.length
        ? lista.map(cardHTML).join("")
        : `<div class="vazio">
             <p>Nenhum anime encontrado${filtros.busca ? ` para “${escapar(filtros.busca)}”` : ""}${filtros.categoria !== "Todas" ? ` em ${escapar(filtros.categoria)}` : ""}.</p>
             <button type="button" class="botao-secundario" data-limpar>Limpar filtros</button>
           </div>`;
    }
    grade.querySelectorAll(".card").forEach(atualizarCard);

    contador.textContent =
      lista.length === ANIMES.length
        ? plural(ANIMES.length, "anime", "animes")
        : `${lista.length} de ${plural(ANIMES.length, "anime", "animes")}`;
  }

  function renderizarFiltros() {
    $("#categorias").innerHTML = ["Todas", ...CATEGORIAS]
      .map((c) => `<button type="button" class="chip" data-filtro="${escapar(c)}" aria-pressed="${filtros.categoria === c}">${escapar(c)}</button>`)
      .join("");
    $("#ordem").innerHTML = ORDENS.map(
      ([valor, rotulo]) => `<button type="button" data-ordem="${valor}" aria-pressed="${filtros.ordem === valor}">${rotulo}</button>`
    ).join("");
  }

  function renderizarTrilha() {
    $("#trilha").innerHTML = ORDEM_INICIO.filter((id) => porId.has(id))
      .map((id, i) => {
        const a = porId.get(id);
        return `
          <li class="passo${i === 0 ? " passo-primeiro" : ""}">
            <a href="#anime-${id}" data-ir="${id}">
              <span class="passo-numero" aria-hidden="true">${i + 1}</span>
              <span class="passo-capa">
                ${i === 0 ? '<span class="passo-selo">Comece aqui</span>' : ""}
                <img src="${imagem(id)}" alt="" loading="lazy" decoding="async" width="520" height="780">
              </span>
              <span class="passo-nome"><span class="sr-only">${i + 1}. </span>${escapar(a.nome)}</span>
            </a>
          </li>`;
      })
      .join("");
  }

  /* ---------- Aviso (toast) ---------- */

  let temporizadorToast;
  function avisar(mensagem, erro = false) {
    const toast = $("#toast");
    toast.textContent = mensagem;
    toast.classList.toggle("erro", erro);
    toast.classList.add("visivel");
    clearTimeout(temporizadorToast);
    temporizadorToast = setTimeout(() => toast.classList.remove("visivel"), 3200);
  }

  /* ---------- Ações ---------- */

  async function salvarNota(id) {
    const nota = rascunhos[id];
    if (!nota || salvando.has(id)) return;
    const card = document.getElementById(`anime-${id}`);
    salvando.add(id);
    if (card) atualizarCard(card);

    try {
      const banco = await bancoPromessa;
      if (banco) await banco.collection("votes").add({ animeId: id, nota, ts: Date.now(), votante });
      minhasNotas[id] = nota;
      armazenamento.gravar(CHAVE_NOTAS, minhasNotas);
      if (!banco) medias = mediasLocais();
      delete rascunhos[id];
      abertos.delete(id);
      avisar(`Nota ${nota}/10 salva para ${porId.get(id).nome}.`);
    } catch {
      avisar("A nota não foi salva. Verifique sua conexão e tente de novo.", true);
    } finally {
      salvando.delete(id);
      renderizarGrade();
      if (!abertos.has(id)) document.getElementById(`anime-${id}`)?.querySelector("[data-alternar]")?.focus();
    }
  }

  function alternarPainel(id) {
    const card = document.getElementById(`anime-${id}`);
    if (abertos.has(id)) {
      abertos.delete(id);
      delete rascunhos[id];
      atualizarCard(card);
      return;
    }
    abertos.add(id);
    atualizarCard(card);
    const marcado = card.querySelector("input[type=radio]:checked") || card.querySelector("input[type=radio]");
    marcado.focus({ preventScroll: true });
  }

  function limparFiltros() {
    filtros.busca = "";
    filtros.categoria = "Todas";
    $("#busca").value = "";
    renderizarFiltros();
    renderizarGrade();
  }

  function irParaAnime(id) {
    if (!document.getElementById(`anime-${id}`)) limparFiltros();
    const card = document.getElementById(`anime-${id}`);
    if (!card) return;
    const reduzirMovimento = matchMedia("(prefers-reduced-motion: reduce)").matches;
    card.scrollIntoView({ behavior: reduzirMovimento ? "auto" : "smooth", block: "center" });
    card.classList.remove("destaque");
    void card.offsetWidth; // reinicia a animação se o mesmo card for escolhido de novo
    card.classList.add("destaque");
    card.querySelector("[data-alternar]").focus({ preventScroll: true });
  }

  /* ---------- Eventos ---------- */

  let temporizadorBusca;
  $("#busca").addEventListener("input", (e) => {
    clearTimeout(temporizadorBusca);
    temporizadorBusca = setTimeout(() => {
      filtros.busca = e.target.value;
      renderizarGrade();
    }, 120);
  });

  $("#categorias").addEventListener("click", (e) => {
    const botao = e.target.closest("[data-filtro]");
    if (!botao) return;
    filtros.categoria = botao.dataset.filtro;
    renderizarFiltros();
    renderizarGrade();
  });

  $("#ordem").addEventListener("click", (e) => {
    const botao = e.target.closest("[data-ordem]");
    if (!botao) return;
    filtros.ordem = botao.dataset.ordem;
    renderizarFiltros();
    renderizarGrade();
  });

  grade.addEventListener("click", (e) => {
    const alvo = e.target.closest("[data-alternar], [data-salvar], [data-categoria], [data-limpar]");
    if (!alvo) return;
    if (alvo.matches("[data-limpar]")) return limparFiltros();
    if (alvo.matches("[data-categoria]")) {
      filtros.categoria = alvo.dataset.categoria;
      renderizarFiltros();
      renderizarGrade();
      $("#lista").scrollIntoView({ block: "start" });
      return;
    }
    const id = alvo.closest(".card").dataset.id;
    if (alvo.matches("[data-alternar]")) alternarPainel(id);
    else salvarNota(id);
  });

  // Escolha da nota (clique, toque ou setas do teclado nos botões de rádio).
  grade.addEventListener("change", (e) => {
    if (e.target.type !== "radio") return;
    const card = e.target.closest(".card");
    rascunhos[card.dataset.id] = Number(e.target.value);
    atualizarCard(card);
  });

  // Prévia ao passar o mouse sobre as estrelas.
  grade.addEventListener("pointerover", (e) => {
    const alvo = e.target.closest(".estrelas-alvos label");
    if (alvo) alvo.closest(".card").style.setProperty("--previa", alvo.dataset.nota);
  });
  grade.addEventListener("pointerout", (e) => {
    const estrelas = e.target.closest(".estrelas");
    if (estrelas && !estrelas.contains(e.relatedTarget)) estrelas.closest(".card").style.removeProperty("--previa");
  });

  grade.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const card = e.target.closest(".card");
    if (card && abertos.has(card.dataset.id)) {
      alternarPainel(card.dataset.id);
      $("[data-alternar]", card).focus();
    }
  });

  $("#trilha").addEventListener("click", (e) => {
    const link = e.target.closest("[data-ir]");
    if (!link) return;
    e.preventDefault();
    irParaAnime(link.dataset.ir);
  });

  document.querySelectorAll("[data-rolar]").forEach((botao) => {
    botao.addEventListener("click", () => {
      const trilha = $("#trilha");
      trilha.scrollBy({ left: Number(botao.dataset.rolar) * trilha.clientWidth * 0.8, behavior: "smooth" });
    });
  });

  // Capa que não carregou: mostra um fundo neutro no lugar da imagem quebrada.
  document.addEventListener(
    "error",
    (e) => {
      if (e.target.tagName === "IMG") e.target.closest(".card-capa, .passo-capa")?.classList.add("sem-imagem");
    },
    true
  );

  /* ---------- Início ---------- */

  renderizarFiltros();
  renderizarTrilha();
  medias = mediasLocais();
  renderizarGrade();

  bancoPromessa.then((banco) => {
    const aviso = $("#aviso-notas");
    if (!banco) {
      aviso.textContent = "As notas que você dá ficam salvas neste navegador.";
      return;
    }
    aviso.textContent = "As médias reúnem as notas de todos que acessam esta página.";
    banco.collection("votes").onSnapshot(
      (snap) => {
        medias = mediasDoBanco(snap.docs);
        renderizarGrade();
      },
      () => {
        aviso.textContent = "Não foi possível carregar as notas de todos agora. As suas continuam salvas neste navegador.";
      }
    );
  });
})();
