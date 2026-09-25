# Anime List

Lista de animes com busca, filtro por categoria, ordenação e avaliação de 1 a 10.

## Estrutura

```
index.html          Marcação da página (inclui o <template> do card)
css/style.css       Estilos
js/
  main.js           Estado da página, renderização da lista e eventos
  card.js           Criação e atualização de cada card
  data.js           Catálogo de animes, categorias e ordem "Por onde começar"
  ratings.js        Armazenamento das avaliações (compartilhado ou localStorage)
  toast.js          Notificações
  utils.js          Funções auxiliares (busca sem acento, formatação)
assets/
  logo.svg          Logo e favicon
  posters/          Capas otimizadas (480px), nomeadas pelo id do anime
images/             Imagens originais em alta resolução
```

## Rodando localmente

O JavaScript usa ES modules, que o navegador não carrega via `file://`.
Sirva a pasta com qualquer servidor estático:

```sh
python3 -m http.server 8000
# ou
npx serve .
```

e abra http://localhost:8000.

## Avaliações

- Rodando como Artifact no claude.ai, as notas vão para o banco compartilhado
  (`window.claude.use("db")`) e todos os visitantes veem a mesma média.
- Em qualquer outro lugar (GitHub Pages, servidor local), as notas ficam salvas
  no `localStorage` do navegador.

## Adicionando um anime

1. Adicione a capa em `assets/posters/<id>.jpg` (≈480px de largura).
2. Adicione `{ id, nome, categorias }` em `ANIMES` no `js/data.js`.
3. Opcional: inclua o `id` em `START_ORDER` para aparecer em "Por onde começar".
