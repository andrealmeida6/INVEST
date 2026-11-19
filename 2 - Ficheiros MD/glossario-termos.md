# Glossário de termos técnicos (Portugal)

Estado a 19 de novembro de 2026. Fixa os termos usados na especificação, nos dados e nos relatórios da plataforma, comparando a terminologia oficial em português de Portugal com a que as seguradoras portuguesas usam na prática, muitas vezes em inglês.

## Fontes analisadas

| Fonte | O que é | Como foi lida |
| --- | --- | --- |
| **IFRS 9** em português ([OROC, 2025](https://www.oroc.pt/wp-content/uploads/2025/07/IFRS-9.pdf); [Regulamento (UE) 2016/2067, CNC](https://www.cnc.min-financas.pt/pdf/IAS_IFRS_UE/Reg_2067_2016_IFRS9.pdf)) | Texto oficial da norma adotada na UE | Texto integral (82 páginas) |
| **Norma Regulamentar n.º 9/2022-R** da ASF ([ASF](https://www.asf.com.pt/d/asset-library-114052/-norman92022rde2denovembro)) | Plano de Contas para as Empresas de Seguros (PCES) adaptado à IFRS 17, em vigor desde 2023 | Texto integral (pontos 4 e 5, quadro de contas, tabela 9) |
| Relatório e Contas 2024 da Generali Seguros ([Generali Tranquilidade](https://www.generalitranquilidade.pt/-/media/files/contas-individuais/relatorio-contas-generali-tranquilidade-2024.pdf?rev=67bfd7774954410681816849b3eed247)) | Prática de mercado (grande seguradora) | Texto integral |
| Relatório e Contas 2024 da Fidelidade Re ([Fidelidade](https://fidelidade.pt/hubfs/site-fidelidade/documentacao-institucional/relatorios-e-contas/CPR/relatorio_anual_cpr_2024.pdf)) | Prática de mercado (grupo Fidelidade) | Texto integral |
| Relatório e Contas Consolidado 2024 da Mútua dos Pescadores ([Mútua](https://www.mutuapescadores.pt/docs/R-C_Mutua_Consolidado_2024.pdf)) | Prática de mercado (seguradora pequena, o segmento-alvo) | Texto integral |
| Relatório sobre a Solvência e a Situação Financeira 2024 da Caravela ([Caravela](https://caravelaseguros.pt/wp-content/uploads/2025/04/Relatorio-de-Solvencia-2024_pt.pdf)) | Terminologia de Solvência II em português (seguradora pequena) | Texto integral |
| Textos de Solvência II em português (Diretiva 2009/138/CE, Regulamento Delegado (UE) 2015/35, Regulamento de Execução sobre os modelos de reporte) | Terminologia oficial de Solvência II | **Não lidos.** O EUR-Lex e a EIOPA bloquearam o acesso automático (respostas 202 e 429). Os termos de Solvência II vêm do relatório da Caravela, de documentos da EIOPA e do Conselho da UE em português e de pesquisa. Os que não foi possível confirmar no texto legal ficam marcados **[a confirmar]** |

## Conclusões principais

1. **O PCES da NR 10/2016-R foi revogado.** O plano em vigor é o da **Norma Regulamentar n.º 9/2022-R, de 2 de novembro**, aplicável desde o exercício de 2023. A afetação de ativos (ponto 4) e as transferências entre carteiras (ponto 5) passaram para esta norma. A especificação foi corrigida.
2. **Há dois vocabulários oficiais para as categorias da IFRS 9.** O texto da norma diz "justo valor através de outro rendimento integral". O PCES e as seguradoras dizem **"justo valor através de reservas"**: 25 a 82 ocorrências em cada relatório, contra 0 a 3 da expressão da norma. A plataforma usa o termo do PCES, porque é o das contas que a contabilidade vai ver.
3. **O mercado usa muitos termos em inglês, sobretudo siglas:** SPPI, ECL, PD, LGD, *Hold to collect*, *Hold to collect and sell*, *Stage 1/2/3*, VFA, CSM, *investment grade*, *unit-linked*, *look-through*, *rating*. A regra da plataforma: o **termo português no texto, com a sigla ou o termo inglês entre parênteses na primeira vez**. As siglas inglesas usam-se livremente em tabelas e ecrãs.
4. **A afetação está no próprio plano de contas.** As classes 20, 22 e 23 do PCES são "Investimentos afetos aos passivos de contratos de seguros do ramo Vida", "… dos ramos Não Vida" e "Investimentos não afetos". Uma reafetação muda o ativo de conta e por isso **gera sempre lançamento**. A especificação tratava-o como opcional.
5. **A transferência entre carteiras faz-se pelo valor contabilizado** (NR 9/2022-R, ponto 5, n.º 2), e não pelo justo valor. Os ajustamentos de valor até à data da transferência ficam na carteira de origem; os seguintes vão para a de destino.
6. **"Provisões técnicas" e "passivos de contratos de seguros" não são sinónimos.** Em IFRS 17 e no PCES diz-se "passivos de contratos de seguros", e é a estes que se afetam os ativos. "Provisões técnicas" é o termo de Solvência II (e do regime anterior). A plataforma usa os dois, cada um no seu contexto.
7. **"Nível 1/2/3" tem dois sentidos.** Em IFRS 13 é a hierarquia de justo valor. Em Solvência II são os níveis de fundos próprios (*tiers*): o relatório da Caravela usa "Nível 3" neste sentido. A plataforma escreve sempre "nível de justo valor" ou "nível IFRS 13".
8. **Tipos de carteira oficiais:** a tabela 9 do PCES define as carteiras de investimentos, e a última é **"Valores livres"** (não "ativos livres"). Os relatórios usam "Não afetos".

## Glossário

Legenda: **Oficial** = texto da norma em português; **PCES** = Norma Regulamentar n.º 9/2022-R; **Prática** = relatórios das seguradoras analisadas; **Plataforma** = termo a usar na especificação e nos conteúdos em português. A interface, que está em inglês, usa a coluna "Inglês".

### IFRS 9 - classificação e mensuração

| Inglês | Oficial (IFRS 9 PT) | PCES / Prática | Plataforma |
| --- | --- | --- | --- |
| Amortised cost (AC) | custo amortizado | custo amortizado | **custo amortizado** (CA) |
| Fair value through other comprehensive income (FVOCI) | justo valor através de outro rendimento integral | **justo valor através de reservas** (PCES, contas 20 23, 11 01, 11 08; prática dominante) | **justo valor através de reservas** (FVOCI) |
| Fair value through profit or loss (FVTPL) | justo valor através dos resultados | justo valor através de resultados (contas 20 11, 20 20); "através de ganhos e perdas" nos mapas | **justo valor através de resultados** (FVTPL) |
| Other comprehensive income (OCI) | outro rendimento integral | outro rendimento integral (demonstração do rendimento integral) | **outro rendimento integral** |
| Fair value reserve | — | **reservas de reavaliação**, por ajustamentos no justo valor (conta 11 0); "reserva de justo valor" na prática | **reserva de justo valor** no texto; conta **11 — Reservas de reavaliação** nos lançamentos |
| Business model | modelo de negócio | modelo de negócio | **modelo de negócio** |
| Hold to collect | modelo de negócio cujo objetivo consiste em deter ativos para recolher fluxos de caixa contratuais | **Hold to collect** | **deter para recolher** (*Hold to collect*) |
| Hold to collect and sell | … alcançado tanto através da recolha de fluxos de caixa contratuais como da venda | **Hold to collect and sell** | **deter para recolher e vender** (*Hold to collect and sell*) |
| SPPI test | fluxos de caixa que são apenas pagamentos de capital e juros sobre a quantia de capital em dívida | **SPPI** (*Solely Payments of Principal and Interest*) | **teste SPPI** (apenas pagamentos de capital e juros) |
| Effective interest rate / method | taxa de juro efetiva; método do juro efetivo | método do juro efetivo; "método da taxa de juro efetiva" | **taxa de juro efetiva (TJE)**; **método do juro efetivo** |
| Gross carrying amount | quantia escriturada bruta | — | **quantia escriturada bruta** (custo amortizado antes da provisão para perdas) |
| Transaction costs | custos de transação | — | **custos de transação** |
| Derecognition | desreconhecimento | desreconhecimento | **desreconhecimento** |
| Reclassification / reclassification adjustment (recycling) | reclassificação; ajustamento de reclassificação | reclassificação | **reclassificação** (mudança de categoria); **ajustamento de reclassificação** (passagem da reserva para resultados na venda) |
| Accounting mismatch | incoerência na mensuração ou no reconhecimento | — | **incoerência na mensuração ou no reconhecimento** (*accounting mismatch*) |
| Irrevocable election (equity at FVOCI) | escolha irrevogável | — | **opção irrevogável** de mensurar instrumentos de capital próprio ao justo valor através de reservas |

### IFRS 9 - imparidade

| Inglês | Oficial (IFRS 9 PT) | PCES / Prática | Plataforma |
| --- | --- | --- | --- |
| Expected credit losses (ECL) | perdas de crédito esperadas | **ECL**; "perdas de crédito esperadas"; PCES: "provisão para perdas de crédito previstas" (conta 11 2) | **perdas de crédito esperadas (ECL)** |
| 12-month ECL | perdas de crédito esperadas num prazo de 12 meses | ECL a 12 meses | **ECL a 12 meses** |
| Lifetime ECL | perdas de crédito esperadas ao longo da vida útil | ECL para toda a vida | **ECL ao longo da vida útil** |
| Stage 1 / 2 / 3 | (a norma não usa "estágios") | **Stage 1/2/3** (Generali); **estágio 1/2/3** (Fidelidade Re, Mútua) | **estágio 1 / 2 / 3** (*Stage*) |
| Significant increase in credit risk | aumento significativo do risco de crédito | aumento significativo do risco de crédito | **aumento significativo do risco de crédito** |
| Credit-impaired | (ativo) em imparidade de crédito | imparidade; "evidência objetiva de default" | **em imparidade de crédito** |
| Low credit risk exemption | baixo risco de crédito | "isenção de baixo risco de crédito" (grau de investimento) | **isenção de baixo risco de crédito** |
| Investment grade | — | **investment grade**; "grau de investimento" | **grau de investimento** (*investment grade*) |
| Loss allowance | provisão para perdas | provisão para perdas de crédito previstas; imparidade acumulada | **provisão para perdas** (no balanço em CA; em reservas em FVOCI) |
| Impairment loss / reversal | perda por imparidade / reversão | **66 Perdas por imparidade**; **76 Reversão de perdas por imparidade** | idem, com as contas do PCES |
| Past due (more than 30 days) | vencido há mais de 30 dias | — | **vencido há mais de 30 dias** |
| Default | incumprimento | **default**; "probabilidade de default (PD)" | **incumprimento** (*default*) |
| PD / LGD / EAD | — | **PD**, **LGD** ("severidade expectável da perda"), EAD | **PD**, **LGD**, **EAD** (siglas) |

### IFRS 13 e IFRS 17

| Inglês | Oficial / PCES | Prática | Plataforma |
| --- | --- | --- | --- |
| Fair value hierarchy, Level 1/2/3 | hierarquia de justo valor, nível 1/2/3 | nível 1/2/3 | **nível de justo valor 1/2/3** (nunca só "nível", para não confundir com os níveis de fundos próprios de Solvência II) |
| Insurance contract liabilities | passivos de contratos de seguros (PCES, classe 32) | passivos de contratos de seguro | **passivos de contratos de seguros** |
| Variable fee approach (VFA) | abordagem da comissão variável | "Abordagem de Comissão Variável (VFA)" | **abordagem da comissão variável (VFA)** |
| Underlying items | itens subjacentes | itens subjacentes | **itens subjacentes** |
| Contractual service margin (CSM) | margem de serviços contratuais | margem de serviços contratuais; **CSM** | **margem de serviços contratuais (CSM)** |
| Insurance finance income or expenses — OCI option | rendimentos ou gastos financeiros de seguros; opção de desagregação **[a confirmar a expressão no texto PT da IFRS 17]** | — | **opção de desagregar em outro rendimento integral os gastos financeiros de seguros** |

### Afetação, carteiras e plano de contas (ASF)

| Inglês (uso corrente) | Oficial (NR 9/2022-R) | Prática | Plataforma |
| --- | --- | --- | --- |
| Asset allocation (to liabilities) | **afetação de ativos aos passivos de contratos de seguros** (ponto 4) | afetação dos investimentos; investimentos afetos / não afetos | **afetação de ativos** |
| Allocated assets | **investimentos afetos** (classes 20 e 22) | afetos | **investimentos afetos** |
| Free assets | **valores livres** (tabela 9, h); **investimentos não afetos** (classe 23) | não afetos | **valores livres** (carteira); **não afetos** (conta) |
| Transfer between portfolios | **transferências de ativos entre carteiras** (ponto 5) | — | **transferência entre carteiras** (reafetação) |
| Ring-fenced / segregated fund (contabilidade) | **fundo autónomo**; "com investimento autónomo" (tabela 9) | — | **fundo autónomo** |
| Profit sharing | participação nos resultados | participação nos resultados | **participação nos resultados** |
| Investment income | **74 Rendimentos de investimentos** (juros e dividendos) | rendimentos de investimentos | idem |
| Realised gains / losses | **75 Ganhos em investimentos**; **65 Perdas em investimentos** | "mais ou menos valias" | **ganhos e perdas realizados** (mais e menos-valias) |
| Investments in subsidiaries / associates | partes de capital em filiais, associadas e empreendimentos conjuntos (20 1), mensuradas ao custo, ao justo valor ou pela equivalência patrimonial | — | idem |
| Debt securities / equity and fund units | títulos de dívida; instrumentos de capital e unidades de participação | — | idem |

### Solvência II

| Inglês | Termo em português | Fonte | Plataforma |
| --- | --- | --- | --- |
| Prudent person principle | **princípio do gestor prudente** | Orientações da EIOPA em PT; relatórios de solvência | idem |
| Look-through approach | **abordagem baseada na transparência** | Documento do Conselho da UE em PT; prática: *look-through* | **abordagem baseada na transparência** (*look-through*) |
| Ring-fenced funds | **fundos circunscritos para fins específicos** | Relatório da Caravela (modelo S.23.01) | idem. Distinto do "fundo autónomo" contabilístico, embora muitas vezes coincidam |
| Matching adjustment portfolios | carteiras de ajustamento de congruência | Relatório da Caravela | idem (fora de âmbito) |
| Technical provisions | **provisões técnicas** | Relatório da Caravela (69 ocorrências) | **provisões técnicas** só em Solvência II |
| Collective investment undertakings | **organismos de investimento coletivo (OIC)** | Relatório da Caravela | idem (categoria CIC 4) |
| Unit-linked / index-linked | **contratos ligados a índices e a unidades de participação** | Relatório da Caravela; prática: *unit-linked* | idem (*unit-linked*) |
| Solvency Capital Requirement | requisito de capital de solvência (SCR) | Relatório da Caravela | idem |
| Own funds tiers | fundos próprios de nível 1, 2 e 3 | Relatório da Caravela | ver nota sobre "nível" |
| QRT | modelos de reporte quantitativo **[a confirmar]** | — | **modelos de reporte quantitativo (QRT)** |
| S.06.02 List of assets | **Lista de ativos** **[a confirmar o título PT]** | — | idem |
| CIC | código de identificação complementar (CIC) **[a confirmar]** | — | **CIC** |
| ECAI | instituição externa de avaliação de crédito (ECAI) **[a confirmar]** | — | idem |
| Credit quality step | grau de qualidade de crédito **[a confirmar]** | — | idem |

### Operações e mercado

| Inglês | Uso em Portugal | Plataforma |
| --- | --- | --- |
| Accrued interest | **juros corridos** | **juros corridos** (no plural, como nos relatórios) |
| Coupon | cupão | idem |
| Clean / dirty price | preço limpo / preço sujo (prática: *clean* / *dirty*) | **preço limpo / preço com juros corridos** |
| Trade / settlement date | data de negociação / data de liquidação | idem |
| Custodian | **depositário** ou custodiante | **depositário** (custodiante) |
| Day count convention | convenção de contagem de dias (ACT/ACT, 30/360) | idem, com as siglas |
| Withholding tax | imposto retido na fonte | idem |
| Rating | **rating** (nunca traduzido nos relatórios) | **rating** |

## Alterações feitas por causa desta análise

- **Especificação** (`especificacao-gestao-investimentos.md`): referências à NR 9/2022-R; transferências pelo valor contabilizado e repartição dos ajustamentos por carteira (novas regras R-53 a R-55 e cenário C-11); a reafetação passa a gerar lançamento entre as classes 20, 22 e 23; tipos de carteira da tabela 9; categorias da IFRS 9 com os termos do PCES; "nível de justo valor"; "passivos de contratos de seguros" versus "provisões técnicas"; termos ingleses entre parênteses.
- **Dados de demonstração e Supabase:** "Valores livres", tipos de carteira da tabela 9, modelos de negócio, e regras contabilísticas com as contas do PCES (20, 22, 23, 11, 66, 74, 75, 76).
- **Motor e testes:** repartição dos ajustamentos de justo valor entre carteiras (R-55, C-11).

## Pendentes

- Ler os textos portugueses de Solvência II no EUR-Lex quando o acesso automático deixar de ser bloqueado, para confirmar os termos marcados **[a confirmar]**.
- Confirmar a expressão da IFRS 17 em português para a opção de desagregação em outro rendimento integral.
- Ler o artigo 152.º do RJASR (Lei n.º 147/2015), n.º 3 e 4, referido no ponto 5 da NR 9/2022-R.
