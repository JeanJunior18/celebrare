# Identidade visual — Arca do Davi

Referência de design pra qualquer componente em `src/components/`. Tema:
Arca de Noé / safari de bebê, em aquarela, paleta terrosa e suave.

Mockup de referência (desktop + mobile) foi fornecido pelo usuário em
2026-06-19. Se o arquivo de imagem for adicionado ao repo, colocar em
`docs/design/` e linkar aqui.

## Paleta de cores

| Uso | Cor aproximada | Onde aparece |
|---|---|---|
| Fundo principal | creme / off-white quente (`#F7F1E3` aprox.) | background de toda a página |
| Acento primário | verde oliva escuro (`#5C6E3F` aprox.) | títulos, texto de nav, botões, faixa do "1 ANINHO", ícones de linha |
| Acento secundário | terracota / marrom claro (`#C8956D` aprox.) | madeira da arca, detalhes ilustrados |
| Texto de corpo | marrom-acinzentado (`#6B6256` aprox.) | parágrafos, descrições |
| Pastel decorativo | arco-íris suave (rosa, amarelo, azul, verde claro) | arco-íris atrás da arca, nuvens |

Botões: fundo verde oliva sólido, texto creme, cantos arredondados (pill ou
border-radius grande), ícone opcional ao lado do texto (♡, 📍, 📱, ✎).

## Tipografia

- **Display/script** (apenas a palavra "Davi" e frases de destaque em itálico
  no mobile, ex: "Vai ser uma grande aventura com você!"): fonte cursiva
  manuscrita (estilo Caveat / Dancing Script / Allura).
- **Títulos de seção e nav**: caixa alta, letter-spacing largo, peso médio —
  serve tanto pra nav ("INÍCIO", "PRESENÇA"...) quanto pra headings
  ("CONFIRME SUA PRESENÇA", "LISTA DE PRESENTES").
- **Corpo**: sans-serif limpa, line-height generoso, sem caixa alta.

## Iconografia

Ícones de linha (outline), traço fino, cor verde oliva: calendário, relógio,
pin de localização, caixa de presente, coração, camiseta, smartphone, lápis.
Coração (♡) é usado como divisor decorativo entre título e subtítulo em
quase toda seção.

## Ilustração

Aquarela do tema Arca de Noé: arca de madeira com elefante, leão, zebra,
girafas, macaco, pombo, arco-íris ao fundo. Mesma arte é reaproveitada no
hero desktop, no topo do mobile e numa faixa decorativa no rodapé do mobile.

## Estrutura de seções (mapeia pra `components/sections/`)

O projeto é **mobile-first** (ver `CLAUDE.md`): o layout mobile é a base de
implementação e o que define o conteúdo/ordem de cada seção; o desktop é uma
progressão (`md:`/`lg:`) que reorganiza esse mesmo conteúdo em colunas e
cartões mais largos, nunca o contrário. Construa e valide cada seção no
viewport mobile primeiro, só depois adicione os breakpoints de desktop.

1. **NavBar** — sticky no topo em todas as larguras (decisão da Etapa 10 do
   build plan, que prioriza a maioria dos visitantes abrindo pelo WhatsApp no
   celular sobre a fidelidade ao mockup estático, que não mostrava nav
   mobile). Desktop (`md:` e acima): ícone de âncora + links horizontais.
   Mobile: mesmo ícone + botão de hambúrguer que abre um menu vertical.
2. **Hero** — mobile (base): empilhado — intro → título → faixa "1 ANINHO"
   → ilustração → subtítulo em itálico. Desktop (`lg:`): duas colunas
   (texto + ilustração da arca lado a lado).
3. **EventInfo** — mobile (base): lista vertical de data / horário / local,
   sem botão (não aparece no card mobile do mockup). Desktop (`md:`): vira
   cartão horizontal com os 3 itens + botão "Ver localização" ao lado.
4. **RsvpSection** — heading + subtítulo + form (nome, quantidade de
   acompanhantes, whatsapp) + botão "Confirmar presença". Form de coluna
   única em mobile; mesmo form, só com mais respiro horizontal, em desktop.
   Campos mapeiam 1:1 com `rsvps` (`guest_name`, `companion_count`,
   `whatsapp_number`) — ver @docs/domain-model.md.
5. **GiftSection** — heading + subtítulo + 3 cards (Lista de Presentes / Pix
   Presente / Item em quantidade), cada um com ícone, título, descrição curta
   e botão próprio. Mobile: cards empilhados em coluna única. Desktop: grid
   de 3 colunas. Os 3 cards mapeiam pra duas origens de dados diferentes:
   "Lista de Presentes" e "Item em quantidade" são `gift_items` filtrados por
   `category` (`REGISTRY_ITEM` / `BULK_ITEM`); "Pix Presente" é conteúdo
   estático de `config/event.config.ts` (não é um gift_item — regra de
   negócio #3 do domain model).
6. **GallerySection** — heading + carousel horizontal de fotos com legenda
   abaixo de cada uma, com swipe/scroll nativo no mobile. A legenda é um
   texto livre digitado pelo host (campo `description`), não mais um enum
   fixo de fases do bebê — o mockup original mostrava RECÉM-NASCIDO,
   3 MESES, 6 MESES, 9 MESES, 1 ANO, mas isso é só um exemplo de conteúdo,
   não uma lista fixa de opções.
7. **GuestbookSection** — heading + subtítulo + botão "Deixar mensagem"
   (abre form/modal pra escrever no mural).
8. **Footer** — ilustração pequena da arca + citação bíblica (Gênesis 7:9)
   em itálico.
9. **Mobile-only: ShareQrCode** — bloco com QR code (moldura branca
   arredondada com cantos em verde oliva) + botão "Escaneie-me". É a versão
   mobile do convite compartilhável, aponta pra mesma URL da página; não tem
   equivalente em desktop.

## Notas de implementação

- O carousel da galeria e os cards de presente devem ser primitivos sem
  lógica de negócio em `components/ui/` (ex: `Card`, `Carousel`, `Button`,
  `SectionHeading` com o divisor de coração), compostos pelas seções em
  `components/sections/`.
- Mobile e desktop reaproveitam o mesmo conteúdo/dados — a diferença é só de
  layout (stack vs. colunas, lista vertical vs. card horizontal). Escreva o
  markup e as classes Tailwind sem prefixo (mobile) primeiro, e adicione
  `md:`/`lg:` por cima pra reorganizar em telas maiores — nunca o caminho
  inverso. Não criar componentes de dados duplicados por breakpoint;
  resolver com CSS responsivo (Tailwind) num único componente sempre que
  possível.
