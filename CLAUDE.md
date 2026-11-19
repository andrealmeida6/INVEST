# Projeto Investment Hub

Plataforma de administração, controlo e contabilização de carteiras de investimento de seguradoras de reduzida ou média complexidade. Segue o mesmo método e o mesmo layout do projeto ON (ESG Data Hub): o projeto é desenhado primeiro em mockups e depois implementado em Power Pages. Cada mockup é construído em paralelo com o código Power Pages correspondente.

## Regras de trabalho

1. Começa todas as mensagens com "André,".
2. Coloca os mockups em `3 - Mockups/`.
3. Coloca os agentes em `4 - Agentes/`.
4. Para cada plano, atualiza o ficheiro `.md` de `2 - Ficheiros MD/` relacionado com o tema. Cria um novo apenas se não existir nenhum relacionado.
5. Qualquer regra de cálculo nova ou alterada tem um cenário com números na secção 24 da especificação e um teste em `1 - Código VSC/testes/`. Corre `node testes/motor.test.js` dentro de `1 - Código VSC/` antes de terminar.
6. Usa os termos de `2 - Ficheiros MD/glossario-termos.md`. Termo novo: acrescenta-o lá com a fonte portuguesa.
7. Pontos normativos que não foi possível confirmar no texto em vigor ficam marcados **[a confirmar]** na especificação. Não os dês como certos.

## Estrutura

| Pasta | Conteúdo |
| --- | --- |
| `1 - Código VSC/web-pages/` | Páginas Power Pages |
| `1 - Código VSC/content-snippets/` | Conteúdo reutilizável, sem parâmetros |
| `1 - Código VSC/web-templates/` | Layouts e blocos Liquid, incluindo blocos com parâmetros |
| `1 - Código VSC/web-files/` | CSS global, JavaScript, imagens e outros ficheiros |
| `1 - Código VSC/testes/` | Testes do motor de cálculo (cenários da secção 24) |
| `1 - Código VSC/supabase/` | Esquema, funções e dados de demonstração no Supabase (tabelas `inv_`) |
| `2 - Ficheiros MD/` | Especificação, plano e análise de mercado |
| `3 - Mockups/` | Mockups HTML que abrem diretamente no browser |
| `4 - Agentes/` | Definições de agentes |

## Ficheiros JavaScript

| Ficheiro | Função |
| --- | --- |
| `inv-motor.js` | Motor de cálculo: fluxos, juro corrido, TJE, custo amortizado, justo valor, reservas, ECL. Não depende do ecrã, para ser testado e reutilizado no servidor |
| `inv-app.js` | Núcleo do ecrã: navegação, formatos, tabelas, painel lateral, avisos |
| `inv-paginas.js` | Blocos dinâmicos de cada página (`bloco-dinamico` com o id do bloco) |
| `inv-acesso.js` | Ecrã de entrada só com nome de utilizador (como o `portal-acesso.js` do ON) e carregamento dos dados do Supabase |

## Supabase

- Mesmo projeto do ON, tabelas com o prefixo `inv_`. RLS ligado e sem permissões diretas: o navegador só chama as funções `inv_acesso_entrar`, `inv_dados`, `inv_decidir` e `inv_reafetar`, que confirmam o utilizador em `inv_acessos`.
- `supabase/001_inv_esquema.sql`: tabelas, funções e acessos. `supabase/002_inv_dados_demonstracao.sql`: dados de demonstração, gerado por `node gerar-dados.js` a partir de `supabase/dados-demonstracao.js`. Não se edita à mão.
- Acessos: só `andreborges` (administrador). Para acrescentar ou retirar pessoas, ver o fim do `001_inv_esquema.sql`.
- Entrar só com o nome não é segurança forte. Serve para limitar quem abre a demonstração. Não pôr dados reais.

## Do mockup para o Power Pages

O mockup final é um único ficheiro, `3 - Mockups/mockup-final.html`, navegável e com todas as páginas do projeto. É gerado por `node gerar-mockup.js` dentro de `1 - Código VSC/` e não se edita à mão. Tem de corresponder sempre a `1 - Código VSC/web-pages/`, com uma secção por cada web page e os mesmos nomes.

Sempre que criares ou alterares um mockup, alinha o código em `1 - Código VSC/` na mesma tarefa:

- **CSS global:** existe um único ficheiro, `1 - Código VSC/web-files/global.css`, herdado do ON. Os componentes próprios deste projeto ficam na secção 15 (prefixo `.iv-`). Evita CSS inline ou específico de uma página.
- **Web pages:** cria uma por cada página do mockup. A página só organiza os blocos; o conteúdo fica nos snippets.
- **Content snippets:** coloca aqui textos e blocos de HTML, um por bloco reutilizável.
- **Web templates:** usa-os para header, footer, layout e blocos que precisem de parâmetros ou lógica Liquid, porque os snippets não recebem parâmetros.
- **Marcação no mockup:** identifica cada bloco com a sua origem, por exemplo `<!-- snippet: Inicio/Hero -->`, para o mapeamento ser rastreável.
- **Referências no código:** usa `{{ snippets['Inicio/Hero'] }}` para snippets e `{% include 'nome-template' %}` para templates.

Antes de criar um bloco novo, verifica se já existe um snippet ou template que possa ser reutilizado.

## Metadados Power Pages

Não inventes GUIDs nem campos nos ficheiros `.yml` de metadados. Segue o formato de um `pac pages download` real do site. Enquanto não houver um, cria apenas os ficheiros de conteúdo (HTML, CSS, JS).
