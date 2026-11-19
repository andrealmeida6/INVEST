# Plano do Investment Hub

Estado a 19 de novembro de 2026. A especificação funcional está em `especificacao-gestao-investimentos.md` e a análise de mercado em `analise-mercado.md`.

## Como ver e alterar

- **Ver:** abrir `3 - Mockups/mockup-final.html` no navegador. Depende dos ficheiros de `1 - Código VSC/web-files/`, por isso a pasta do projeto tem de ir completa.
- **Alterar:** mudar as web pages, os snippets, os templates ou os web files e correr `node gerar-mockup.js` dentro de `1 - Código VSC/`. O mockup é gerado e não se edita à mão.
- **Testar o motor de cálculo:** `node testes/motor.test.js` dentro de `1 - Código VSC/`.

## Decisões

| Tema | Decisão | Motivo |
| --- | --- | --- |
| Ponto de partida | Documento de requisitos do André ("Enquadramento e princípios de desenho") | Indicação do André, 19 de novembro de 2026 |
| Layout e método | Os do ON: Power Pages, mockup gerado, `global.css` único, snippets e templates, cabeçalho numa linha, hero azul com KPIs em vidro, tabelas que viram cartões no telemóvel | Indicação do André |
| CSS | Cópia do `global.css` do ON, com uma secção 15 própria (prefixo `.iv-`) | Mesmo aspeto, sem mexer no ON |
| Nome | "Investment Hub" (provisório) | Por decidir com o André |
| Língua | Interface em inglês, conteúdos geridos em português, como no ON | Coerência com o ON. A confirmar |
| Empresas nos dados de exemplo | Fictícias ("Emitente Industrial A", "Banco B"). Dívida pública identificada pelo Estado | Mesma regra do ON |
| Modelo | Instrumento, transação, lote, posição e carteira separados; a posição é sempre calculada | Requisito do documento |
| Classificação IFRS 9 | Atributo do lote, proposta pelo modelo de negócio da carteira | Permite a mesma emissão em carteiras com classificações diferentes |
| Reafetação | Mantém custo, TJE, classificação e estágio. Não é uma venda | Coerência contabilística; a mudança de modelo de negócio é uma reclassificação à parte |
| Venda de lotes | Custo médio ponderado por omissão, parametrizável | Prática comum em Portugal |
| TJE | Tempo em períodos de cupão (ACT/ACT ICMA), não ACT/365 | Com ACT/365 um ano bissexto alterava a taxa de uma obrigação regular (detetado no teste C-01) |
| ECL | Modelo simples EAD × PD × LGD com tabelas do backoffice e critérios de estágio parametrizáveis | Adequado ao segmento e explicável ao auditor |
| Contabilidade | A aplicação é o subrazão de investimentos e exporta lançamentos para o ERP. Plano de contas como dados | O PCES em vigor ainda tem de ser confirmado |
| Solvência II | Entrega o S.06.02 e o S.09.01 em Excel. Não produz XBRL | As seguradoras já têm ferramenta de reporte |
| Motor de cálculo | Biblioteca isolada (`inv-motor.js`), testável em Node | Permite levar o mesmo código para o servidor |

## Estado

| Área | Estado |
| --- | --- |
| Especificação v1 | Feita, com 52 regras (R-01 a R-52) e 10 cenários de teste |
| Análise de mercado | Feita, com fontes. Evidência de avaliações públicas fraca |
| Mockup | 15 páginas navegáveis com dados de demonstração e cálculo real (TJE, custo amortizado, juro corrido, reserva, ECL, lançamentos, S.06.02) |
| Testes do motor | Cenários C-01, C-02, C-05 e estágios a passar |
| Power Pages | Só conteúdo (HTML, CSS, JS). Sem metadados `.yml` até haver um `pac pages download` |
| Dataverse | Por desenhar a partir da secção 6 |

## Próximos passos

1. Rever a especificação com o André e decidir as questões em aberto.
2. Confirmar o texto normativo marcado **[a confirmar]** (NR 10/2016-R secções 5 e 6, PCES em vigor para IFRS 17 / IFRS 9, artigos do RJASR, taxonomia EIOPA do S.06.02).
3. Validar o mockup com 3 a 5 seguradoras e com um revisor oficial de contas do setor (análise de mercado, secção 6).
4. Completar os cenários de teste C-03, C-04, C-06 a C-10 no motor (venda com custo médio, reafetação parcial, preço manual, segregação, período fechado, lançamentos equilibrados, reprodução).
5. Desenhar as tabelas Dataverse e as permissões (secções 5 e 6).
6. Decidir onde corre o motor de cálculo no servidor (secção 21).

## Questões em aberto

| # | Questão | Para quem |
| --- | --- | --- |
| Q1 | Nome definitivo da plataforma | André |
| Q2 | Interface em inglês ou em português | André |
| Q3 | Plano de contas: PCES em vigor e contas concretas por evento | Cliente / contabilidade |
| Q4 | Método de custeio das vendas (custo médio ponderado ou FIFO) | Cliente |
| Q5 | Fonte de preços e de ratings no MVP (ficheiro do custodiante ou fornecedor de dados) | Cliente |
| Q6 | Participações em filiais e associadas nas contas individuais: custo, equivalência patrimonial ou justo valor | Cliente |
| Q7 | Onde corre o motor de cálculo (Azure Functions, plug-in Dataverse ou JavaScript partilhado) | André / equipa técnica |
| Q8 | Âmbito do MVP: confirmar o faseamento da secção 23 | André |
