# Gestão de Carteiras de Investimento de Seguradoras - Especificação para desenvolvimento

Estado a 19 de novembro de 2026. Primeira versão, feita a partir do documento de requisitos do André ("Enquadramento e princípios de desenho") e de pesquisa técnica, contabilística e de mercado. A análise de mercado está em `analise-mercado.md` e o plano em `plano-gestao-investimentos.md`.

Os pontos marcados **[a confirmar]** dependem de texto normativo que não foi possível ler na íntegra nesta fase (Diário da República e site da ASF não estavam acessíveis a partir do ambiente de trabalho) ou de decisão do cliente.

---

## 0. Como usar este documento

- As secções 1 a 4 explicam o porquê: objetivo, princípios e enquadramento normativo.
- As secções 5 a 17 são o "o quê": perfis, modelo de dados, regras de cálculo e de contabilização, controlos e reporting.
- A secção 18 é o mapa de ecrãs e corresponde, página a página, a `3 - Mockups/mockup-final.html` e a `1 - Código VSC/web-pages/`.
- A secção 24 tem cenários de teste com números, para validar o motor de cálculo.
- Cada regra tem um identificador (`R-xx`) para poder ser referida em testes, issues e no trilho de auditoria.

## 1. Contexto e objetivo

A aplicação suporta a **administração, o controlo e a contabilização de carteiras de investimento de seguradoras de reduzida ou média complexidade**. O âmbito privilegia:

- obrigações (dívida pública, dívida de empresas, taxa fixa, taxa variável, cupão zero, amortizáveis);
- ações cotadas;
- participações não cotadas (incluindo filiais, associadas e participações minoritárias);
- unidades de participação em fundos (necessárias para Solvência II, mesmo que de forma simples);
- depósitos a prazo e à ordem (para o inventário e para os limites ficarem completos).

O foco é a **correta gestão dos instrumentos, posições, rendimentos, afetações, classificações contabilísticas, limites de investimento e integração com a contabilidade**. Não é uma plataforma de negociação, otimização de carteiras ou gestão avançada de derivados.

O problema que resolve: nas seguradoras pequenas e médias, a carteira vive hoje em folhas de Excel ligadas ao ERP por lançamentos manuais. As soluções de mercado (SimCorp, Clearwater, SS&C, Aladdin) estão desenhadas para grandes grupos, com custos e prazos de implementação desproporcionados. Ver `analise-mercado.md`.

## 2. Princípios de desenho

| # | Princípio | Como se traduz na aplicação |
| --- | --- | --- |
| P1 | Simplicidade para equipas pequenas | Uma pessoa consegue fazer o fecho mensal. Ecrãs com o essencial, detalhe em painéis laterais. Cálculos automáticos e explicados |
| P2 | Parametrizar em vez de programar | Regras contabilísticas, plano de contas, tipos de carteira, limites, fontes de preço e tolerâncias geridos no backoffice |
| P3 | Separar instrumento, transação, lote, posição e carteira | Cinco entidades distintas. A posição nunca é introduzida à mão: deriva dos lotes |
| P4 | Rastreabilidade integral | Nada se apaga. Correções por estorno e novo registo. Cada alteração guarda quem, quando, o valor anterior e o motivo |
| P5 | Quatro olhos | Operações, preços manuais, reafetações e alterações de parâmetros têm aprovação por uma pessoa diferente de quem registou |
| P6 | Multi-entidade desde o início | Todas as tabelas têm entidade legal, mesmo que o primeiro cliente tenha só uma |
| P7 | Integração por ficheiro primeiro, API depois | Importações com modelo, validação e pré-visualização. A API usa o mesmo motor de validação |
| P8 | Explicar cada número | Qualquer valor (custo amortizado, juro corrido, ECL, mais-valia) abre o cálculo passo a passo, com as datas e as taxas usadas |
| P9 | Bitemporalidade | Distinguir a data a que um facto diz respeito (data efetiva) da data em que foi registado. Permite reproduzir qualquer fecho passado |

## 3. Glossário

| Termo | Definição |
| --- | --- |
| Instrumento | O título em si (ex.: uma obrigação com um ISIN). Existe uma vez só no cadastro, para todas as entidades |
| Transação | Um movimento: compra, venda, cupão, amortização, reafetação, imparidade, etc. |
| Lote | Cada aquisição de um instrumento numa carteira. Tem custo, data, taxa efetiva e classificação próprios. As vendas consomem lotes |
| Posição | Soma dos lotes de um instrumento numa carteira, numa data. Calculada, nunca introduzida |
| Carteira | Agrupamento de lotes, ligado a uma entidade legal e a um tipo de afetação |
| Afetação | Ligação de um lote (ou parte) a uma carteira de ativos afetos às responsabilidades (provisões técnicas) de um ramo, produto ou fundo |
| Ativos livres | Ativos não afetos a responsabilidades |
| Custo amortizado | Valor do ativo pelo método da taxa de juro efetiva (TJE), líquido de imparidade |
| TJE | Taxa de juro efetiva: a taxa que iguala os fluxos futuros ao valor de aquisição (incluindo custos de transação) |
| Juro corrido | Juro do cupão em curso desde a última data de pagamento até à data de referência |
| ECL | Perdas de crédito esperadas (IFRS 9), em 3 estágios |
| SPPI | Teste "solely payments of principal and interest" da IFRS 9 |
| CIC | Complementary Identification Code de Solvência II (4 carateres) |
| QRT | Quantitative Reporting Templates de Solvência II |
| TPT | Tripartite Template: ficheiro normalizado com a composição de fundos para look-through |
| PCES | Plano de Contas para as Empresas de Seguros (ASF) |

## 4. Enquadramento normativo

Esta secção resume as regras que a aplicação tem de cumprir. Cada tema é ligado às regras de cálculo da secção 10.

### 4.1 IFRS 9 - Classificação e mensuração

Desde 2023 as seguradoras aplicam a IFRS 9 em conjunto com a IFRS 17 (fim da isenção temporária da IFRS 4).

| Categoria | Quando | Mensuração | Variações de justo valor | Imparidade (ECL) |
| --- | --- | --- | --- | --- |
| Custo amortizado (CA) | Dívida, modelo de negócio "deter para receber" e passa o SPPI | Custo amortizado (TJE) | Não reconhecidas (só divulgadas) | Sim, reduz o valor do ativo |
| Justo valor por outro rendimento integral (JVORI) - dívida | Dívida, modelo "deter para receber e vender" e passa o SPPI | Justo valor no balanço; juro pela TJE em resultados | Em reserva de justo valor (ORI), reciclada para resultados na venda | Sim, em ORI (não reduz o valor de balanço) |
| JVORI - capital próprio | Ações, opção irrevogável instrumento a instrumento na aquisição | Justo valor | Em ORI, **sem reciclagem** na venda (transfere para resultados transitados) | Não |
| Justo valor por resultados (JVR) | Restantes, incluindo dívida que falha o SPPI, fundos e designação para eliminar assimetria contabilística | Justo valor | Em resultados | Não |

Regras para a aplicação:

- **R-01** A classificação é atributo do **lote**, não do instrumento: a mesma obrigação pode estar em CA numa carteira e em JVR noutra.
- **R-02** O teste SPPI é registado no instrumento, com resultado, data, responsável e justificação. Casos típicos que falham: obrigações convertíveis, inverse floaters, empréstimos participativos. As alterações à IFRS 9 de maio de 2024 (em vigor a 1 de janeiro de 2026) clarificam o tratamento de cláusulas ligadas a ESG (ex.: sustainability-linked bonds). O questionário SPPI deve ter essa pergunta.
- **R-03** O modelo de negócio é atributo da **carteira** (ou subcarteira) e propõe a classificação dos lotes novos. A reclassificação entre categorias só acontece quando o modelo de negócio muda, o que é raro. Fica como operação com aprovação dupla, com efeito prospetivo a partir do primeiro dia do período seguinte.
- **R-04** A opção JVORI para ações regista-se na aquisição e não se altera.
- **R-05** A designação JVR para eliminar assimetria contabilística com passivos IFRS 17 regista-se na aquisição e não se altera.

### 4.2 IFRS 9 - Imparidade (ECL)

- **Estágio 1**: ECL a 12 meses. Juro sobre o valor bruto.
- **Estágio 2**: aumento significativo do risco de crédito desde a aquisição. ECL para toda a vida. Juro sobre o valor bruto.
- **Estágio 3**: com imparidade de crédito (incumprimento). ECL para toda a vida. Juro sobre o valor líquido.
- Simplificação de **baixo risco de crédito**: um título com rating de investment grade na data de referência pode ficar em estágio 1.

Para carteiras simples propõe-se um modelo parametrizável e explicável:

- **R-06** `ECL = EAD × PD × LGD`, com PD por rating e horizonte (12 meses ou vida residual) e LGD por tipo de emitente e senioridade, em tabelas do backoffice.
- **R-07** Critérios de passagem a estágio 2, parametrizáveis: descida de N notches face ao rating na aquisição; perda de investment grade; atraso no pagamento superior a 30 dias; lista de vigilância manual. Estágio 3: incumprimento ou atraso superior a 90 dias.
- **R-08** O estágio e o ECL calculam-se por **lote**, porque o rating de referência é o da data de aquisição de cada lote.
- **R-09** O ECL pode ser substituído por um valor manual (ex.: estudo da área de risco), com aprovação e evidência anexada.

### 4.3 IFRS 13 - Justo valor

- **R-10** Cada valorização guarda o nível de hierarquia: Nível 1 (preço cotado em mercado ativo), Nível 2 (dados observáveis, ex.: preço de contribuidor ou modelo com curva de mercado), Nível 3 (dados não observáveis, ex.: participações não cotadas avaliadas por DCF ou múltiplos).
- **R-11** Para Nível 3 guarda-se a metodologia, os principais pressupostos e o relatório de avaliação. Alimenta as divulgações da IFRS 7 e da IFRS 13.

### 4.4 Interação com a IFRS 17

A aplicação não calcula passivos, mas tem de ajudar a evitar assimetrias contabilísticas:

- **R-12** Cada carteira afeta indica o grupo de contratos ou o ramo a que está afeta. Permite cruzar a opção de ORI dos gastos financeiros de seguros (IFRS 17) com a classificação dos ativos (JVORI ou JVR).
- **R-13** Para contratos com participação direta (abordagem VFA), a carteira de "itens subjacentes" é identificável e exporta o justo valor e o rendimento por período.

### 4.5 Solvência II

- **Valorização (art. 75.º da Diretiva 2009/138/CE)**: os ativos são avaliados ao montante pelo qual poderiam ser transacionados. Na prática, justo valor, mesmo para títulos em CA no balanço IFRS. A aplicação guarda sempre dois valores por lote: **valor contabilístico IFRS** e **valor Solvência II**.
- **Princípio do gestor prudente (art. 132.º)**: os investimentos têm de garantir segurança, qualidade, liquidez e rendibilidade da carteira no seu conjunto, e os ativos que cobrem provisões técnicas têm de ser adequados à natureza e duração das responsabilidades. Fundamenta os limites da secção 13.
- **QRT S.06.02 - Lista de ativos**: lista título a título dos ativos detidos diretamente (categorias CIC 0 a 9). Campos que a aplicação tem de ter (lista de referência, a validar contra a taxonomia EIOPA em vigor **[a confirmar versão]**):
  - Posição: código e tipo de identificação do ativo (ISIN preferencial), carteira (Vida, Não Vida, fundo autónomo, outro fundo interno, fundos próprios, geral), identificação do fundo autónomo (ring-fenced), ativo de unit-linked (sim/não), ativo dado em garantia, país de custódia, custodiante, quantidade, montante nominal, método de valorização, valor de aquisição, valor total Solvência II, juro corrido.
  - Instrumento: designação, nome e código (LEI) do emitente, setor do emitente (NACE), grupo do emitente e respetivo LEI, país do emitente, moeda, CIC, participação (filial, associada), rating externo, agência (ECAI), grau de qualidade de crédito, duração modificada, preço unitário Solvência II, preço em percentagem do nominal, data de vencimento.
- **S.06.03 - Look-through de fundos**: composição por categoria, país e moeda. Alimenta-se do ficheiro TPT do gestor do fundo (fora do MVP, ver secção 23).
- **S.09.01 - Rendimentos, ganhos e perdas do período**: dividendos, juros, rendas, ganhos e perdas realizados e não realizados por ativo. A aplicação tem os dados por construção (ver 10.6).
- **Revisão de Solvência II** (Diretiva (UE) 2025/2, transposição até janeiro de 2027): acompanhar as alterações aos QRT e o regime de proporcionalidade para pequenas empresas **[a acompanhar]**.

### 4.6 Regime português (ASF)

- **Norma Regulamentar n.º 10/2016-R**: aprova o regime contabilístico das empresas de seguros e o **PCES**, e trata a **afetação de ativos às provisões técnicas** (secção 5) e as **transferências de ativos entre carteiras** (secção 6). A afetação deve ser coerente com o desenho dos produtos, sobretudo nos produtos de Vida cujos benefícios dependem do retorno dos investimentos.
- **Norma Regulamentar n.º 3/2018-R**: alterou o PCES para acomodar a opção IFRS 9 / IAS 39.
- **Alterações posteriores do PCES para IFRS 17 / IFRS 9** **[a confirmar a norma em vigor e o plano de contas atual]**. Por isso o plano de contas fica **parametrizável** e não fixo no código (P2).
- **Regime Jurídico de Acesso e Exercício da Atividade Seguradora e Resseguradora (Lei n.º 147/2015)**: transpõe Solvência II, incluindo o princípio do gestor prudente **[a confirmar artigos]**.

Requisitos que daqui resultam:

- **R-14** Carteiras de ativos afetos por: Vida, Não Vida, patrimónios autónomos / fundos autónomos, produtos com participação nos resultados, unit-linked, e ativos livres.
- **R-15** Cada transferência entre carteiras regista: instrumento e lote, quantidade ou nominal, carteira de origem e destino, data efetiva, valor de transferência (justo valor na data, ou outro definido pela regra), motivo, quem registou, quando, quem aprovou e quando. Lista completa no documento de requisitos e na secção 8.
- **R-16** As transferências que envolvam patrimónios autónomos ou produtos com participação nos resultados ficam sempre sujeitas a aprovação e geram um aviso de impacto (a transferência pode mexer na participação nos resultados dos tomadores).
- **R-17** Mapa de cobertura das provisões técnicas: provisões técnicas por carteira afeta (importadas da contabilidade ou introduzidas) contra o valor dos ativos afetos, com excesso ou insuficiência.

## 5. Perfis e permissões

| Perfil | Pode | Não pode |
| --- | --- | --- |
| Backoffice de investimentos | Registar instrumentos, operações, preços manuais, reafetações; importar ficheiros; correr cálculos | Aprovar o que registou |
| Contabilidade | Ver tudo; correr e fechar o período; gerar e exportar lançamentos; aprovar operações contabilísticas (imparidade, ajustamentos) | Alterar operações aprovadas |
| Risco e conformidade | Gerir limites; ver e justificar excessos; aprovar ECL manual e passagens de estágio | Registar operações |
| Aprovador (direção financeira) | Aprovar operações, reafetações, preços manuais e alterações de parâmetros | |
| Auditor (leitura) | Ver tudo, incluindo trilho e cálculos, e exportar | Alterar seja o que for |
| Administrador | Gerir utilizadores, entidades, parâmetros e regras contabilísticas (com aprovação) | Aprovar as próprias alterações |

- **R-18** Segregação de funções: quem regista não aprova. A regra está no servidor, não só no ecrã.
- **R-19** Permissões por entidade legal e, opcionalmente, por carteira.

## 6. Modelo de dados

Todas as tabelas têm `entidade_id` (exceto o cadastro de instrumentos e emitentes, que é partilhado), `criado_por`, `criado_em`, `estado` e versão. Os valores monetários guardam-se em **decimal com 2 casas na moeda e até 10 casas nos cálculos intermédios** (nunca em vírgula flutuante).

### 6.1 Entidade legal
Nome, NIF, LEI, moeda funcional, plano de contas em uso, calendário de fecho, data de início de utilização.

### 6.2 Emitente
Nome, LEI, país, tipo (soberano, administração regional/local, supranacional, banco, empresa financeira, empresa não financeira, fundo), setor NACE, grupo (emitente-mãe e LEI do grupo), ratings (histórico, por agência), lista de vigilância.

### 6.3 Instrumento (cadastro único)
Campos do documento de requisitos, completados:

| Grupo | Campos |
| --- | --- |
| Identificação | Código interno, ISIN, outros códigos (Bloomberg, CUSIP), designação, tipo de ativo, CIC (gerado a partir de país de cotação e categoria, editável), CFI |
| Emitente | Emitente, país e tipo de emitente, senioridade (sénior, subordinada, coberta), garantias |
| Moeda e datas | Moeda de denominação, data de emissão, data de vencimento, primeira data de cupão |
| Nominal | Valor nominal unitário, nominal emitido, lote mínimo |
| Cupão | Tipo (fixo, variável, zero, step-up), taxa, indexante e spread, periodicidade, convenção de contagem de dias, convenção de dia útil, calendário |
| Reembolso | Bullet, amortizável (calendário de amortizações), call/put (datas e preços) |
| Mercado e preço | Mercado, fonte de preço preferencial, fontes alternativas, metodologia de valorização, nível IFRS 13 por omissão |
| IFRS 9 | Resultado do teste SPPI, data, responsável, justificação |
| Estado | Ativo, vencido, resgatado, inativo |
| Participações | Para não cotadas: capital social, número total de ações, tipo de relação (filial, associada, empreendimento conjunto, minoritária) |

- **R-20** Unicidade: um ISIN só pode existir uma vez. Sem ISIN, a aplicação procura duplicados por emitente, moeda, vencimento e taxa e avisa antes de gravar.
- **R-21** Os dados de posição que o documento lista no inventário (número de títulos, percentagem de participação, custo de aquisição, valor contabilístico, justo valor e data da última valorização) **não ficam no instrumento**: calculam-se a partir dos lotes e das valorizações e mostram-se na ficha do instrumento, consolidados ou por carteira.
- **R-22** Alterações ao instrumento são versionadas com data efetiva. Ex.: mudança de taxa de um cupão variável, alteração de calendário por evento societário.

### 6.4 Calendário de fluxos
Uma linha por fluxo previsto: data, tipo (cupão, amortização, reembolso final), taxa ou valor por unidade de nominal, estado (previsto, fixado, pago). É gerado a partir das condições do instrumento e pode ser importado ou corrigido (com aprovação). Os cupões variáveis ficam "previstos" até à fixação do indexante.

### 6.5 Carteira
Entidade, código, nome, carteira-mãe (hierarquia), tipo de afetação (secção 8), ramo, produto, fundo, natureza das responsabilidades, modelo de negócio IFRS 9, moeda de reporte, carteira Solvência II (campo "Portfolio" do S.06.02), fundo autónomo (sim/não e identificador), estado. Os tipos e as dimensões são listas do backoffice.

### 6.6 Transação
Tipo, instrumento, carteira, lote (quando aplicável), data de negociação, data de liquidação, data contabilística, quantidade ou nominal, preço (limpo), juro corrido, custos de transação, impostos retidos, valor total, moeda, câmbio, contraparte, corretor, custodiante, referência externa, motivo, estado (rascunho, submetida, aprovada, rejeitada, estornada), transação que estorna.

### 6.7 Lote
Transação de origem, instrumento, carteira, data de aquisição, quantidade ou nominal inicial e em vida, custo de aquisição (incluindo custos de transação, na moeda do título e na funcional), câmbio de aquisição, TJE, classificação IFRS 9, designações (JVORI ações, JVR), rating e PD na aquisição, estágio ECL atual, afetação atual.

### 6.8 Posição (vista calculada)
Por carteira, instrumento e data: quantidade, nominal, custo de aquisição, custo amortizado, juro corrido, imparidade acumulada, justo valor, reserva de justo valor, mais/menos-valia potencial, valor Solvência II. É uma vista e não uma tabela editável (P3).

### 6.9 Movimento de afetação
Lote, quantidade, carteira de origem, carteira de destino, data efetiva, valor de transferência, motivo, registo e aprovação. A afetação atual de um lote é sempre o resultado do histórico de movimentos (R-15).

### 6.10 Valorização
Instrumento, data, preço, tipo de preço (limpo, sujo, percentagem do nominal, por ação, NAV), fonte, nível IFRS 13, manual (sim/não), aprovação, comentário, anexo.

### 6.11 Câmbio
Moeda, data, taxa contra a moeda funcional, fonte (por omissão BCE).

### 6.12 Imparidade (ECL)
Lote, data, estágio, PD, LGD, EAD, ECL calculado, ECL manual, valor final, variação do período, aprovação.

### 6.13 Regra contabilística
Evento (ver 12.2), classificação IFRS 9, tipo de carteira, tipo de ativo, conta a débito, conta a crédito, descrição do lançamento, data de início e de fim. Versionada e com aprovação.

### 6.14 Lançamento contabilístico
Período, data, entidade, conta, débito, crédito, moeda, centro de custo / ramo, transação e regra de origem, lote de exportação, estado (gerado, exportado, confirmado no ERP).

### 6.15 Limite
Âmbito (entidade, carteira, tipo de afetação), dimensão (emitente, grupo, país, setor, rating, classe de ativo, moeda, duração, liquidez, não cotados), base de cálculo (valor Solvência II, valor contabilístico, percentagem de provisões técnicas ou da carteira), limite de alerta, limite máximo, origem (interno, regulamentar, contratual).

### 6.16 Trilho de auditoria
Tabela única, só de escrita: tabela, registo, campo, valor anterior, valor novo, utilizador, data e hora, motivo, origem (ecrã, importação, API, cálculo).

## 7. Inventário de instrumentos

- Cadastro único e partilhado entre entidades e carteiras (R-20).
- Ficha do instrumento com separadores: Dados, Fluxos, Preços, Ratings, Posições (consolidada e por carteira e lote), Operações, Documentos, Histórico.
- Criação a partir do ISIN com dados pré-preenchidos quando houver fonte de dados ligada (fase 2). No MVP, por formulário ou importação.
- Estado gerido automaticamente: passa a "vencido" no dia seguinte ao reembolso final, desde que não haja lotes em vida.

## 8. Carteiras, afetação e reafetação

### 8.1 Tipos de carteira (lista parametrizável, com estes valores iniciais)
- Ativos afetos - Vida (com e sem participação nos resultados)
- Ativos afetos - Não Vida
- Ativos afetos - patrimónios / fundos autónomos
- Ativos afetos - unit-linked
- Ativos não afetos (livres)
- Outras carteiras ou subcarteiras configuráveis

### 8.2 Dimensões
Ramo, produto, fundo, natureza das responsabilidades, grupo de contratos IFRS 17, ou outra dimensão definida pela seguradora.

### 8.3 Operações de afetação
- Afetação inicial (na aquisição, a carteira de destino é a afetação).
- Afetação total ou parcial de um lote. Parcial divide o lote em dois, ambos com o mesmo custo unitário, TJE e data de aquisição (R-23).
- Reafetação entre carteiras.
- Libertação (passa para livres).
- **R-23** Uma reafetação **não é uma venda**: mantém custo, TJE, classificação e estágio do lote, salvo se a carteira de destino tiver outro modelo de negócio. Nesse caso a aplicação avisa e exige a operação de reclassificação (R-03), com aprovação dupla.
- **R-24** Antes de aprovar, a aplicação mostra o impacto da reafetação: valor que sai e entra em cada carteira, cobertura das provisões técnicas antes e depois (R-17) e limites afetados (pré-verificação, secção 13).
- **R-25** Nada se substitui nem se apaga. Para corrigir uma reafetação faz-se uma reafetação inversa, ligada à primeira.

### 8.4 Consultas
Posições afetas e não afetas em separado e consolidadas, por instrumento, carteira, ramo e entidade, em qualquer data (P9).

## 9. Registo e processamento de operações

### 9.1 Tipos
Aquisição; venda total ou parcial; pagamento de cupão; amortização de capital; vencimento; resgate antecipado (call/put); transferência ou reafetação; dividendo; aumento de capital, cisão, fusão, desdobramento (eventos societários); registo de imparidade; ajustamento de justo valor; reclassificação IFRS 9; movimentos manuais identificados e aprovados.

### 9.2 Campos
Ver 6.6. Obrigatórios: data de negociação, data de liquidação, quantidade ou nominal, preço, valor total, juro corrido (em dívida), custos de transação, moeda e câmbio, contraparte, carteira e afetação.

### 9.3 Regras
- **R-26** O juro corrido na compra e na venda é calculado pela aplicação segundo a convenção do instrumento e comparado com o da nota de corretagem. Uma diferença acima da tolerância (parametrizável, por omissão 0,01 na moeda) bloqueia a submissão até ser justificada.
- **R-27** Vendas consomem lotes pelo método parametrizado por entidade: **custo médio ponderado** (por omissão, prática comum em Portugal), FIFO ou identificação específica do lote. O método escolhido é o mesmo para todos os títulos da entidade, por coerência da política contabilística.
- **R-28** Cupões e amortizações são **propostos automaticamente** a partir do calendário de fluxos, com o valor esperado. O utilizador confirma com o valor recebido (do extrato do custodiante). Diferenças ficam assinaladas.
- **R-29** Estados: rascunho → submetida → aprovada (gera lançamentos) → estornada (opcional). Uma operação aprovada não se edita: estorna-se e regista-se de novo.
- **R-30** Operações com data contabilística num período fechado não são aceites. Exigem reabertura do período, com aprovação.

## 10. Motor de cálculo

Todos os cálculos são determinísticos, reproduzíveis numa data passada (P9) e mostram o detalhe (P8).

### 10.1 Contagem de dias e juro corrido
Convenções suportadas: ACT/ACT (ICMA), ACT/360, ACT/365 Fixed, 30/360 (Bond Basis), 30E/360.

`Juro corrido = Nominal × Taxa do cupão × Fração de ano(última data de cupão, data de liquidação)`

Na ACT/ACT ICMA: `Fração = dias decorridos / (dias do período de cupão × frequência)`.

### 10.2 Taxa de juro efetiva e custo amortizado
- **R-31** Na aquisição calcula-se a TJE: a taxa `r` que verifica `Custo de aquisição (preço limpo × nominal + juro corrido pago + custos de transação) = Σ Fluxo_i / (1 + r)^(t_i)`, com `t_i` em anos medidos em períodos de cupão (número de períodos, com a fração do período em curso pela ACT/ACT ICMA, a dividir pela frequência), para que um ano bissexto não altere a taxa de uma obrigação com cupões regulares, e os fluxos contratuais (cupões, amortizações, reembolso). Resolve-se numericamente (Newton-Raphson com bissecção de recurso).
- **R-32** Juro do período pela TJE = `Custo amortizado bruto no início × ((1 + r)^(Δt) − 1)`. A diferença entre o juro TJE e o cupão vencido no período é a amortização do prémio ou desconto.
- **R-33** Custo amortizado bruto = valor inicial + juro TJE acumulado − fluxos recebidos. Custo amortizado líquido = bruto − ECL (só em CA).
- **R-34** Taxa variável: a TJE é recalculada a cada fixação do indexante, mantendo o prémio/desconto inicial (IFRS 9 B5.4.5).
- **R-35** Alteração de estimativa dos fluxos (ex.: amortização antecipada parcial): ajuste de catch-up ao custo amortizado, descontando os novos fluxos à TJE original, com o ajuste em resultados (IFRS 9 B5.4.6).
- **R-36** O juro corrido na compra faz parte do custo do lote e é "devolvido" no primeiro cupão. A aplicação mostra-o separado para controlo, mas o cálculo da TJE já o inclui.

### 10.3 Justo valor e reserva
- JVORI dívida: `Reserva de justo valor = Justo valor (limpo) − Custo amortizado bruto (limpo)`, com o ECL do lote registado na reserva e não no valor do ativo.
- JVORI ações: `Reserva = Justo valor − Custo de aquisição`. Na venda transfere para resultados transitados.
- JVR: variação de justo valor do período em resultados.
- **R-37** Para dívida em moeda estrangeira separa-se a variação cambial (IAS 21): em JVORI dívida, a diferença cambial sobre o custo amortizado vai a resultados e o resto a reserva. Em JVORI ações, tudo a reserva.

### 10.4 Mais e menos-valias realizadas
`Mais-valia = Valor de venda (limpo, líquido de custos) − Custo amortizado (ou custo, em ações) dos lotes consumidos`. Em JVORI dívida, recicla-se a reserva do lote para resultados. Valores na moeda do título e na funcional.

### 10.5 Imparidade
R-06 a R-09. Cálculo mensal, por lote, com movimento do período (dotação, reversão, utilização na venda ou abate).

### 10.6 Rendimentos do período (base do S.09.01)
Por lote e período: juro TJE, dividendos, mais/menos-valias realizadas, variações de justo valor em resultados e em ORI, ECL, diferenças cambiais.

### 10.7 Participações não cotadas
- Nas contas individuais, filiais e associadas podem ficar ao custo (IAS 27), por equivalência patrimonial ou ao justo valor. É parâmetro por participação.
- Valorização Solvência II pela hierarquia do art. 13.º do Regulamento Delegado (UE) 2015/35: preço cotado, método da equivalência patrimonial ajustado e, por fim, métodos alternativos **[a confirmar artigo]**.
- Valorização manual sempre com aprovação, metodologia, data do relatório e anexo (R-11).

## 11. Valorização e preços

- **R-38** Fonte de preço por instrumento com hierarquia (ex.: preço de fecho do mercado → contribuidor → manual). O motor usa a primeira fonte disponível e regista qual usou.
- **R-39** Controlos automáticos em cada carregamento: preço em falta, preço não atualizado há mais de N dias (preço "parado"), variação diária acima de X% (por classe de ativo), preço fora de [0; 200]% do nominal em dívida. Os casos ficam numa fila de exceções e não seguem para o fecho até serem tratados.
- **R-40** Preços manuais exigem aprovação, comentário e anexo, e mantêm histórico completo (requisito do documento).
- **R-41** Fecho de preços por data: depois de fechado, uma alteração de preço exige reabertura aprovada.

## 12. Contabilização e integração com a contabilidade

### 12.1 Princípio
A aplicação é o **subrazão de investimentos**. Gera os lançamentos de cada evento, por regra parametrizada, e exporta-os para o ERP. O razão geral continua no ERP.

### 12.2 Eventos contabilísticos
Aquisição; juro TJE do período (acréscimo); cupão recebido; amortização e reembolso; venda (custo, mais/menos-valia, reciclagem da reserva); variação de justo valor (resultados ou reserva); diferença cambial; ECL (dotação e reversão); dividendo atribuído e recebido; imposto retido; reafetação (quando o plano de contas distingue contas por afetação); reclassificação.

### 12.3 Regras
- **R-42** Matriz de regras: evento × classificação IFRS 9 × tipo de carteira × tipo de ativo → contas a débito e crédito (6.13). Ex.: "Juro TJE, CA, afetos Vida, obrigações" → débito "Juros a receber / Investimentos ao custo amortizado"; crédito "Rendimentos de investimentos". As contas concretas do PCES carregam-se como dados **[a confirmar plano de contas em vigor]**.
- **R-43** Cada lançamento guarda a regra, a transação e o lote de origem (drill-down do ERP até ao título).
- **R-44** Validação antes de exportar: débitos iguais a créditos por entidade, período e moeda; todas as contas existem no plano ativo; nenhum evento sem regra.
- **R-45** Exportação por ficheiro (CSV/Excel no formato do ERP, configurável por coluna) e, na fase 2, por API. Cada exportação tem número, totais e estado, e não pode ser exportada duas vezes sem estorno.

### 12.4 Fecho do período
Lista de verificação guiada (padrão de tarefas do ON):
1. Câmbios do período carregados.
2. Preços carregados e exceções tratadas (R-39).
3. Fluxos do período confirmados (cupões, amortizações, dividendos) (R-28).
4. Reconciliação com o custodiante sem diferenças por justificar (secção 14).
5. Ratings atualizados e ECL calculado e aprovado.
6. Limites verificados e excessos justificados.
7. Cálculo do período (custo amortizado, justo valor, reservas, mais-valias).
8. Lançamentos gerados, validados e exportados.
9. Período fechado (com aprovação). Fica uma imagem do fecho para reprodução.

## 13. Limites de investimento e conformidade

- **R-46** Limites por emitente, grupo de emitentes, país, setor, rating, classe de ativo, moeda, duração, não cotados e liquidez, por entidade, carteira ou tipo de afetação (6.15).
- **R-47** Verificação **antes** (na submissão da operação ou reafetação: mostra o efeito) e **depois** (diária ou no fecho). A verificação antes não bloqueia por omissão, mas obriga a justificar.
- **R-48** Excessos: estado (aberto, justificado, regularizado), responsável, prazo, comentário e histórico.
- **R-49** Agregação por grupo de emitentes usa o grupo do emitente (6.2), para cumprir a lógica de concentração do gestor prudente.

## 14. Reconciliação com o custodiante

- Importação do extrato de posições e de movimentos de caixa do custodiante (CSV/Excel, formatos parametrizados por banco).
- **R-50** Comparação por ISIN e conta de custódia: quantidade ou nominal, e movimentos de caixa (cupões, amortizações, dividendos, liquidações). Diferenças classificadas (em trânsito, por registar, erro) e justificadas antes do fecho.

## 15. Reporting

| Saída | Conteúdo | Formato |
| --- | --- | --- |
| Inventário de investimentos | Todos os campos do inventário do documento, por carteira e afetação, numa data | Excel / PDF |
| Mapa de afetação e cobertura | Provisões técnicas vs ativos afetos (R-17) | Excel / PDF |
| S.06.02 | Lista de ativos (4.5) | Excel no formato EIOPA. XBRL fora do âmbito: o ficheiro alimenta a ferramenta de reporte que a seguradora já use |
| S.09.01 | Rendimentos, ganhos e perdas | Excel |
| Mapa de movimentos | Saldo inicial, compras, vendas, amortizações, juro TJE, justo valor, ECL, câmbio, saldo final, por classificação | Excel (base das notas IFRS 7) |
| Hierarquia de justo valor | Totais por nível 1/2/3 e movimentos do nível 3 | Excel |
| ECL | Por estágio, com movimentos do período | Excel |
| Calendário de fluxos | Cupões, amortizações e vencimentos previstos | Excel, calendário na home |
| Excessos de limites | Abertos e histórico | Excel / PDF |

- **R-51** Todos os relatórios são reproduzíveis em qualquer data de fecho passado (P9) e mostram data de geração, utilizador e parâmetros.

## 16. Aprovações e trilho de auditoria

- Fila única de aprovações (padrão Approvals do ON) com tipo, quem pediu, quando, valor e impacto.
- Aprovar ou rejeitar com comentário obrigatório na rejeição.
- O trilho (6.16) é consultável por registo, utilizador, tabela e período e exportável para o auditor.

## 17. Importação de ficheiros

| Ficheiro | Uso |
| --- | --- |
| Instrumentos | Carga inicial e novos títulos |
| Operações | Notas de corretagem / confirmações |
| Preços | Fecho diário ou mensal |
| Câmbios | Se não vierem do BCE |
| Extrato do custodiante | Reconciliação (secção 14) |
| Ratings | Atualização periódica |
| Provisões técnicas | Cobertura (R-17) |
| Saldo inicial (migração) | Lotes em vida com custo, TJE e afetação à data de início |

Ordem de validação (igual ao ON): formato → colunas obrigatórias → tipos e domínios → existência de referências (ISIN, carteira, emitente) → regras de negócio → pré-visualização com erros por linha → submissão para aprovação.

- **R-52** Migração: o saldo inicial entra por lote com o custo amortizado e a TJE do sistema anterior. A aplicação recalcula a TJE e mostra as diferenças, para a equipa decidir se aceita o valor herdado.

## 18. Mapa de ecrãs

Corresponde a `1 - Código VSC/web-pages/` e ao mockup.

| Página | Conteúdo |
| --- | --- |
| Inicio | Hero com valor da carteira (contabilístico, justo valor, Solvência II), afetos vs livres, cobertura das provisões técnicas e alertas. Tarefas do fecho, aprovações pendentes e calendário de fluxos |
| Instrumentos | Cadastro com pesquisa e filtros. Abre a ficha |
| Instrumento | Ficha com separadores (secção 7) e cálculo explicado |
| Carteiras | Árvore de carteiras por entidade e tipo de afetação, com totais e cobertura |
| Posicoes | Posições por carteira e instrumento, com lotes ao expandir, em qualquer data |
| Afetacoes | Histórico de movimentos de afetação e formulário de reafetação com impacto (R-24) |
| Operacoes | Lista de operações por estado, registo de nova operação e fluxos propostos (R-28) |
| Valorizacoes | Preços por data, exceções (R-39) e preços manuais |
| Imparidade | ECL por lote e estágio, com movimentos |
| Limites | Utilização dos limites e excessos |
| Contabilidade | Fecho do período (12.4), lançamentos e exportações |
| Relatorios | Saídas da secção 15 |
| Aprovacoes | Fila de aprovações |
| Trilho | Trilho de auditoria |
| Backoffice | Entidades, tipos de carteira, dimensões, regras contabilísticas, plano de contas, tabelas de PD/LGD, limites, fontes de preço e tolerâncias, utilizadores |

## 19. API e integrações (fase 2)

- API REST com os mesmos objetos e validações da importação.
- Integrações previstas: dados de mercado (preços, ratings, dados de referência), BCE (câmbios), custodiante (SWIFT MT535/MT950 ou ficheiro), ERP (lançamentos), ferramenta de reporte Solvência II (S.06.02).

## 20. Requisitos não funcionais

- Precisão decimal (secção 6). Arredondamento só na apresentação e no lançamento, com o resto a ser acertado no último lote.
- Desempenho de referência: 2 000 lotes e 10 anos de histórico com fecho mensal em menos de 2 minutos.
- Disponibilidade em horário de expediente; cópias de segurança diárias; retenção de dados de pelo menos 10 anos **[a confirmar prazo legal]**.
- Segurança: autenticação da organização, segregação de funções no servidor (R-18), RGPD (só dados de utilizadores e contrapartes).
- Acessibilidade e telemóvel como no ON (tabelas viram cartões).
- Língua: interface em inglês e conteúdos geridos em português, como no ON **[a confirmar]**.

## 21. Arquitetura

Opção por omissão, igual ao ON: **Power Pages + Dataverse** para ecrãs, dados e permissões, com o mockup em HTML a servir de desenho.

O motor de cálculo (TJE, custo amortizado, ECL, lançamentos) precisa de precisão decimal, de cálculo em lote e de testes automáticos. Propõe-se mantê-lo **fora das páginas**, numa biblioteca única testável (Azure Functions ou plug-in Dataverse em C#, ou JavaScript partilhado pelo mockup e pelo servidor), com os cenários da secção 24 como testes de regressão **[a decidir]**.

## 22. Design

Herda o ON: mesmo `global.css` (tokens de cor, Instrument Sans e JetBrains Mono, cabeçalho numa linha, hero azul escuro com KPIs em vidro, tabelas com cabeçalho azul que viram cartões no telemóvel, calendário à direita). Os componentes novos (árvore de carteiras, barra de utilização de limite, detalhe de cálculo) ficam numa secção própria do `global.css`.

## 23. Faseamento e fora de âmbito

| Fase | Âmbito |
| --- | --- |
| MVP | Cadastro, carteiras e afetação, operações (compra, venda, cupão, amortização, vencimento, reafetação), custo amortizado e juro corrido, justo valor e reserva, preços manuais e por ficheiro, lançamentos por regra e exportação, fecho do período, aprovações e trilho, inventário e mapa de cobertura |
| Fase 2 | ECL completo, limites, reconciliação com o custodiante, S.06.02 e S.09.01, eventos societários, multi-moeda completo, API |
| Fase 3 | Look-through de fundos (TPT e S.06.03), fontes de dados de mercado, multi-entidade com consolidação, ligação a ferramentas de IFRS 17 |

Fora de âmbito: negociação e ordens, otimização de carteiras, derivados complexos (só registo simples de forwards cambiais, se necessário), cálculo de passivos IFRS 17, cálculo do SCR, produção do XBRL.

Decisões em aberto: ver `plano-gestao-investimentos.md`.

## 24. Critérios de aceitação (cenários de teste)

**C-01 Custo amortizado com desconto.** Compra a 2026-01-01 de 1 000 000 de nominal de uma obrigação a taxa fixa de 3%, cupão anual a 1 de janeiro, vencimento 2029-01-01, preço 97,224909%, sem juro corrido nem custos. Custo 972 249,09. Fluxos: 30 000 em 2027 e 2028 e 1 030 000 em 2029. TJE = 4,0000%. Juro TJE do 1.º ano = 38 889,96; cupão 30 000,00; amortização do desconto 8 889,96; custo amortizado a 2027-01-01 = 981 139,05; a 2028-01-01 = 990 384,62. No vencimento, depois do reembolso, o custo amortizado é exatamente 0 (diferença de arredondamento acertada no último período).

**C-02 Juro corrido na compra.** Mesma obrigação comprada a 2026-07-02 (ACT/ACT ICMA): juro corrido = 1 000 000 × 3% × 182/365 = 14 958,90. A diferença face à nota de corretagem acima de 0,01 bloqueia a submissão (R-26).

**C-03 Venda parcial com custo médio.** Dois lotes de 500 000 do mesmo título com custos amortizados de 490 000 e 505 000. Venda de 400 000 a 99%: custo médio 99,5%; custo consumido 398 000; mais/menos-valia = 396 000 − 398 000 = −2 000. Sobram 600 000 de nominal ao custo de 597 000.

**C-04 Reafetação parcial.** Lote de 1 000 000 em "Livres", reafetação de 300 000 para "Afetos Vida" a 2026-06-30. Resultado: dois lotes (700 000 e 300 000) com a mesma TJE e data de aquisição, histórico com origem, destino, utilizador e aprovador, e nenhuma linha anterior alterada.

**C-05 JVORI dívida.** O lote de C-01 classificado em JVORI, a 2027-01-01: custo amortizado bruto 981 139,05; justo valor 990 000,00; ECL 1 200,00. Reserva de justo valor = 8 860,95 + 1 200,00 (o ECL vai a resultados por contrapartida de ORI) = 10 060,95; valor de balanço = 990 000,00.

**C-06 Preço manual.** Um preço manual sem aprovação não entra no cálculo. Ao aprovar, a aplicação guarda quem e quando, e o preço anterior fica no histórico.

**C-07 Segregação.** O utilizador que submeteu uma operação não vê o botão Aprovar nessa operação, e a API recusa a aprovação.

**C-08 Período fechado.** Uma operação com data contabilística num período fechado é recusada com a mensagem "Period closed".

**C-09 Lançamentos equilibrados.** A exportação não é permitida se débitos e créditos diferirem em 0,01 ou mais, ou se houver eventos sem regra.

**C-10 Reprodução.** O inventário a 2026-03-31, gerado depois de operações retroativas aprovadas em abril, é igual ao gerado no fecho de março (o fecho é uma imagem) e mostra à parte as alterações posteriores.

## Anexo A. Categorias CIC (3.º e 4.º carateres: o primeiro dígito é a categoria)

| Código | Categoria |
| --- | --- |
| 1 | Obrigações de dívida pública |
| 2 | Obrigações de empresas |
| 3 | Ações |
| 4 | Organismos de investimento coletivo (fundos) |
| 5 | Produtos estruturados |
| 6 | Títulos com garantia (colateralizados) |
| 7 | Caixa e depósitos |
| 8 | Hipotecas e empréstimos |
| 9 | Imóveis |
| 0 | Outros investimentos |
| A a F | Derivados (futuros, opções call, opções put, swaps, forwards, derivados de crédito) - fora de âmbito |

Os dois primeiros carateres são o código ISO do país de cotação, `XL` se não cotado ou `XT` se não negociável em mercado **[a confirmar tabela CIC em vigor]**.

## Anexo B. Dados de demonstração

O mockup usa uma seguradora fictícia, **Seguradora A**, com carteiras Vida (afetos), Não Vida (afetos), Fundo autónomo PPR (afetos) e Livres, cerca de 20 instrumentos (dívida pública portuguesa, espanhola, italiana e alemã, dívida de empresas europeias, duas ações cotadas, uma participação não cotada e um fundo). Os emitentes de dívida pública são identificados pelo Estado. As empresas são fictícias ("Emitente Industrial A", "Banco B") seguindo a regra do ON de não usar nomes de empresas.
