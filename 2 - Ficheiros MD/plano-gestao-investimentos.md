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
| Contabilidade | A aplicação mantém o inventário de investimentos e exporta lançamentos para o ERP; reconcilia-se todos os meses com o balancete. Plano de contas como dados | O PCES em vigor ainda tem de ser confirmado |
| Solvência II | Entrega o S.06.02 e o S.09.01 em Excel. Não produz XBRL | As seguradoras já têm ferramenta de reporte |
| Motor de cálculo | Biblioteca isolada (`inv-motor.js`), testável em Node | Permite levar o mesmo código para o servidor |
| Entrada e dados | Ecrã de entrada só com nome de utilizador, como no ON. Os dados vêm do Supabase (mesmo projeto do ON, tabelas `inv_`). Para já só `andreborges` tem acesso | Indicação do André, 19 de novembro de 2026 |
| Segurança no Supabase | Tabelas com RLS e sem permissões. O navegador só chama 4 funções que confirmam o utilizador: entrar, ler os dados, aprovar/rejeitar e reafetar. Quem pediu não aprova, também no servidor (R-18) | As tabelas não ficam expostas com a chave pública |
| Controlos de auditoria | Reconciliação com a contabilidade geral e com o depositário, impostos diferidos sobre a reserva de justo valor, vendas de carteiras "deter para recolher" e mapa de movimentos (R-56 a R-60). Na demonstração, o balancete, o extrato do depositário e os preços do mês anterior ficam em `inv_parametros` | Revisão do ponto de vista de um revisor oficial de contas, pontos 1, 2, 3, 4 e 8 escolhidos pelo André a 21 de novembro de 2026 |
| Terminologia | Termos de `glossario-termos.md`: termo português no texto e termo ou sigla inglesa entre parênteses quando o mercado o usa. Categorias da IFRS 9 com os nomes do PCES ("justo valor através de reservas") e siglas CA, FVOCI, FVTPL | Análise da IFRS 9 em português, do PCES (NR 9/2022-R) e de relatórios de seguradoras portuguesas, pedido do André a 19 de novembro de 2026 |
| PCES em vigor | Norma Regulamentar n.º 9/2022-R (a NR 10/2016-R foi revogada). Tipos de carteira da tabela 9, classes de contas 20/21/22/23, transferências pelo valor contabilizado e reserva repartida por carteira (R-53 a R-55) | Texto da norma |
| Gravação | Aprovar, rejeitar e submeter reafetações gravam no Supabase e ficam no trilho. Os restantes botões continuam a ser demonstração | Primeiro passo; o resto segue o mesmo padrão |

## Estado

| Área | Estado |
| --- | --- |
| Especificação v1 | Feita, com 52 regras (R-01 a R-52) e 10 cenários de teste |
| Análise de mercado | Feita, com fontes. Evidência de avaliações públicas fraca |
| Mockup | 15 páginas navegáveis com dados de demonstração e cálculo real (TJE, custo amortizado, juro corrido, reserva, ECL, lançamentos, S.06.02) |
| Testes do motor | Cenários C-01, C-02, C-05 e estágios a passar |
| Supabase | Esquema, funções e dados de demonstração aplicados. Testado com o papel `anon`: tabelas sem acesso direto, utilizador sem acesso recusado, aprovação do próprio pedido recusada |
| Power Pages | Só conteúdo (HTML, CSS, JS). Sem metadados `.yml` até haver um `pac pages download` |
| Dataverse | Por desenhar a partir da secção 6 |

## Próximos passos

1. Rever a especificação com o André e decidir as questões em aberto.
2. Confirmar o texto normativo ainda marcado **[a confirmar]**: termos de Solvência II no EUR-Lex (bloqueado ao acesso automático), artigo 152.º do RJASR, taxonomia EIOPA do S.06.02 e expressão da IFRS 17 para a opção de desagregação.
3. Validar o mockup com 3 a 5 seguradoras e com um revisor oficial de contas do setor (análise de mercado, secção 6).
4. Completar os cenários de teste C-03, C-04, C-06 a C-10 no motor (venda com custo médio, reafetação parcial, preço manual, segregação, período fechado, lançamentos equilibrados, reprodução).
5. Desenhar as tabelas Dataverse e as permissões (secções 5 e 6).
6. Decidir onde corre o motor de cálculo no servidor (secção 21).
7. Levar para o Supabase as restantes ações (nova operação, preço manual, confirmar cupão, parâmetros do backoffice).

## Questões em aberto

| # | Questão | Para quem |
| --- | --- | --- |
| Q1 | Nome definitivo da plataforma | André |
| Q2 | Interface em inglês ou em português | André |
| Q3 | Plano de contas: subcontas finais de cada seguradora dentro do PCES da NR 9/2022-R | Cliente / contabilidade |
| Q4 | Método de custeio das vendas (custo médio ponderado ou FIFO) | Cliente |
| Q5 | Fonte de preços e de ratings no MVP (ficheiro do custodiante ou fornecedor de dados) | Cliente |
| Q6 | Participações em filiais e associadas nas contas individuais: custo, equivalência patrimonial ou justo valor | Cliente |
| Q7 | Onde corre o motor de cálculo (Azure Functions, plug-in Dataverse ou JavaScript partilhado) | André / equipa técnica |
| Q8 | Âmbito do MVP: confirmar o faseamento da secção 23 | André |
