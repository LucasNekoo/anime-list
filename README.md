# AnimeList

Lista de animes para descobrir, avaliar e compartilhar, com uma ordem sugerida para quem está começando.

## Como abrir

Abra o arquivo `index.html` no navegador. Não precisa instalar nada.

Para publicar no GitHub Pages: **Settings → Pages → Branch `main` / pasta `/ (root)` → Save**. O site fica em `https://<usuario>.github.io/anime-list/`.

## Estrutura

```
index.html             página principal
AnimeList.html         redireciona o endereço antigo para o index.html
favicon.svg            ícone da aba
assets/css/style.css   estilos
assets/js/data.js      lista de animes, categorias e ordem "Por onde começar"
assets/js/app.js       busca, filtros, ordenação e avaliações
assets/capas/<id>.jpg  capas (retrato 2:3, até 520x780)
```

## Adicionar um anime

1. Salve a capa em `assets/capas/<id>.jpg`. Use um id curto, minúsculo e com hífens, por exemplo `spy-x-family`.
2. Em `assets/js/data.js`, adicione uma linha em `ANIMES`:
   ```js
   { id: "spy-x-family", nome: "Spy x Family", alt: [], categorias: ["Ação", "Comédia"] },
   ```
   `alt` guarda outros nomes usados na busca (por exemplo o título em japonês).
3. Opcional: coloque o id em `ORDEM_INICIO` para ele aparecer em "Por onde começar".

## Avaliações

- Publicada como Artifact do Claude, a página usa o banco compartilhado (`window.claude`) e as médias juntam as notas de todos os visitantes. Cada navegador conta uma vez por anime.
- Em qualquer outro lugar (GitHub Pages ou arquivo local), as notas ficam salvas no navegador de quem avaliou (`localStorage`).
