# Análise de mercado - ferramentas de gestão e contabilidade de investimentos de seguradoras

Estado a 19 de novembro de 2026. Serve a especificação (`especificacao-gestao-investimentos.md`) e o plano (`plano-gestao-investimentos.md`).

## Nota sobre as fontes

- As descrições das soluções vêm sobretudo de **material dos próprios fornecedores** e de agregadores de avaliações (G2, Capterra, TrustRadius, RFP.wiki). Os agregadores declaram confiança baixa (RFP.wiki indica 37 a 42%) e têm poucas avaliações. Por isso, as conclusões são **indicativas**.
- Não foram encontradas avaliações independentes no Gartner Peer Insights nem comparações diretas de funcionalidades para seguradoras.
- Para uma decisão de compra ou de posicionamento comercial, o passo seguinte seria pedir demonstrações e falar com 3 a 5 seguradoras portuguesas de pequena e média dimensão (ver secção 6).

## 1. Mapa do mercado

| Segmento | Soluções | Para quem |
| --- | --- | --- |
| Plataformas front-to-back | SimCorp One, BlackRock Aladdin (com Aladdin Accounting e eFront para privados) | Grandes seguradoras e gestoras de ativos |
| Contabilidade de investimentos para seguradoras (SaaS ou serviço) | Clearwater Analytics, SS&C (Singularity, Geneva, CAMRA), FIS (Investment Accounting Manager, Progeny) | Seguradoras médias e grandes, sobretudo nos EUA |
| Dados e operações | Arcesium (Aquata) | Grandes instituições com equipas de dados |
| Reporte regulamentar (camada por cima) | Wolters Kluwer OneSumX, CCH Tagetik, Moody's RiskIntegrity, SAS, Oracle FSAA | Produzem QRT/XBRL a partir de dados já existentes. Não gerem a carteira |
| Look-through de fundos (Solvência II) | Confluence (ex-Silverfinch), FRS Invest\|GRC | Recolha de ficheiros TPT dos gestores de fundos |
| Realidade das pequenas e médias | Excel + ERP (lançamentos manuais) + ferramenta de reporte Solvência II | É o concorrente real |
| Ferramentas pessoais e open source | Portfolio Performance, Fund Manager | Investidores particulares. Úteis para ver o que a comunidade pede |

## 2. Como as principais soluções fazem

### SimCorp One
- **Abordagem:** plataforma única para gestão, operações e contabilidade, com IBOR e ABOR (posições de investimento e contabilísticas) no mesmo modelo. O fornecedor anuncia mais de 70 referenciais contabilísticos e reporte para normas locais e internacionais.
- **Pontos fortes:** profundidade contabilística, multi-GAAP (várias bases contabilísticas em paralelo), presença forte em seguradoras europeias.
- **Problemas referidos:** configuração contabilística e processos batch exigem especialistas; curva de aprendizagem acentuada face a soluções mais leves; custos de personalização e dependência de implementadores.

### Clearwater Analytics
- **Abordagem:** SaaS com dados reconciliados diariamente com custodiantes e gestores, e contabilidade em várias bases (GAAP, STAT, IFRS) sobre o mesmo dado. Fortemente orientado para seguradoras.
- **Pontos fortes:** fecho mais rápido e menos trabalho manual (avaliações G2), dados validados pelo próprio fornecedor.
- **Problemas referidos:** migrações exigem corridas em paralelo, limpeza de reconciliações e formação; regras contabilísticas muito específicas precisam de serviços de implementação; ativos ilíquidos e privados menos maduros do que em fornecedores especializados; poucas avaliações públicas.

### SS&C (Singularity, Geneva, CAMRA)
- **Abordagem:** plataforma de contabilidade de investimentos para seguradoras com automação de operações, cadastro, dados de mercado e eventos, e opção de **serviço gerido** (o fornecedor faz a contabilidade e entrega dados reconciliados).
- **Pontos fortes:** o serviço gerido resolve a falta de pessoas.
- **Problemas referidos pelo próprio fornecedor sobre o mercado:** sistemas antigos não preparados para a complexidade atual, folhas de Excel como recurso para ativos privados, equipas sobrecarregadas, incerteza sobre a viabilidade e a integração das soluções atuais.

### FIS (Investment Accounting Manager, Progeny)
- **Abordagem:** contabilidade de investimentos para seguradoras com reporte estatutário, GAAP e IFRS.
- **Nota:** não foram encontradas avaliações nem informação técnica recente suficiente para comparar.

### BlackRock Aladdin
- **Abordagem:** ecossistema completo (risco, gestão, operações, contabilidade, privados com eFront).
- **Nota:** dimensionado para grandes grupos. Fora do alcance do segmento-alvo.

### Ferramentas de reporte (OneSumX, Tagetik, Moody's e outras)
- **Abordagem:** recebem um ficheiro de ativos e produzem os QRT e o XBRL.
- **Consequência para nós:** não competem, **complementam**. A aplicação deve entregar um S.06.02 limpo nesse formato, em vez de produzir XBRL (ver especificação, secção 15).

### Excel + ERP (o concorrente real)
- **Como funciona:** uma folha por carteira ou por título, juros e amortizações calculados por fórmulas, lançamentos introduzidos à mão no ERP, inventário montado para o fecho.
- **Problemas referidos:** sem controlo de alterações, sem maker-checker, sem linhagem do dado nem bitemporalidade; dependência de uma pessoa-chave; erros de fórmula; dificuldade em reproduzir um fecho passado; ativos complexos e privados tratados à parte.

## 3. O que a comunidade identifica como problemas

Junta os problemas referidos em avaliações, fóruns e documentação. Cada um tem a resposta prevista na especificação.

| # | Problema identificado | Onde | Resposta na especificação |
| --- | --- | --- | --- |
| 1 | Implementação longa, cara e dependente de especialistas | SimCorp, Clearwater (agregadores) | Âmbito limitado ao segmento simples; parametrização no backoffice (P2); MVP faseado (secção 23) |
| 2 | Regras contabilísticas específicas exigem serviços do fornecedor | Clearwater, SimCorp | Matriz de regras evento × classificação × carteira × ativo editável pelo cliente, com aprovação (R-42) |
| 3 | Curva de aprendizagem acentuada | SimCorp | Ecrãs do ON, fecho guiado por lista de tarefas (12.4), cálculo explicado em cada número (P8) |
| 4 | Migração exige corridas em paralelo e limpeza de dados | Clearwater | Importação de saldo inicial por lote com recálculo da TJE e mapa de diferenças (R-52) |
| 5 | Folhas de Excel sem controlo de alterações, aprovação, linhagem e bitemporalidade | Material de fornecedores sobre o mercado | Trilho único (6.16), quatro olhos (P5), drill-down do lançamento ao título (R-43), bitemporalidade (P9) |
| 6 | Dependência de uma pessoa-chave | Consultores do setor | Processo documentado na própria aplicação (lista de fecho), cálculos determinísticos e explicados |
| 7 | Obrigações mal suportadas: amortizações de capital não representadas, saldos e rendibilidades errados | Fórum e ajuda do Portfolio Performance | Calendário de fluxos com amortizações (6.4), lote com nominal em vida, catch-up (R-35) |
| 8 | Juro corrido pago na compra lido como ganho de desempenho | Fórum do Portfolio Performance | Juro corrido separado e incluído no custo do lote (R-36); comparação com a nota de corretagem (R-26) |
| 9 | Prémio/desconto (accretion) só em versões pagas ou ausente | Fund Manager, Portfolio Performance | Custo amortizado pela TJE é o núcleo do MVP (10.2) |
| 10 | Ativos privados e ilíquidos menos maduros | Clearwater, SS&C | Participações não cotadas com valorização manual aprovada, nível 3, metodologia e anexo (10.7, R-11) |
| 11 | Look-through de fundos e S.06.02 trabalhosos | Material de Silverfinch/Confluence e FRS | Todos os campos do S.06.02 no modelo desde o início (4.5). TPT na fase 3 |
| 12 | Reconciliações com o custodiante manuais | SS&C | Reconciliação de posições e caixa (secção 14), com diferenças a bloquear o fecho |
| 13 | Incerteza sobre integração das soluções atuais | SS&C | Ficheiro primeiro, API com as mesmas validações depois (P7) |

## 4. Onde a solução se diferencia

1. **Feita para o segmento esquecido:** seguradoras pequenas e médias em Portugal, com carteiras de obrigações, ações e participações, e equipas de 1 a 3 pessoas.
2. **Regulamentação portuguesa nativa:** afetação de ativos e transferências entre carteiras (NR 10/2016-R), PCES parametrizável, cobertura das provisões técnicas.
3. **Cálculo explicado:** qualquer número abre o cálculo com datas, taxas e fluxos. É o que os auditores pedem e o que falta nas folhas de Excel.
4. **Quatro olhos e trilho por construção,** não como módulo extra.
5. **Complementa as ferramentas de reporte** em vez de as substituir: entrega o S.06.02 e os mapas de movimentos já reconciliados.
6. **Mesma experiência do ON:** a equipa já conhece os padrões (tarefas, aprovações, trilho, backoffice).

## 5. Riscos

| Risco | Mitigação |
| --- | --- |
| Erro de cálculo com impacto contabilístico | Cenários de teste com números (secção 24 da especificação) como testes de regressão; motor de cálculo isolado e testável |
| Alterações normativas (revisão de Solvência II, alterações ao PCES) | Plano de contas, CIC e campos de reporte como dados e não como código |
| Dados de mercado (preços, ratings) com licenças caras | MVP com importação de ficheiro do custodiante; fontes pagas só na fase 3 |
| Comparação com soluções completas | Posicionamento claro de âmbito (secção 23 da especificação) |

## 6. Validação recomendada com a comunidade

- Entrevistas a 3 a 5 seguradoras pequenas e médias (direção financeira e contabilidade) com o mockup aberto: o que fazem hoje no fecho, quanto tempo demora, onde erram.
- Revisão técnica por um revisor oficial de contas do setor segurador: regras de custo amortizado, ECL simplificado, afetação e mapa de cobertura.
- Confirmar com a ASF ou com o texto em vigor: plano de contas atual para IFRS 17 / IFRS 9 e regras de transferência entre carteiras.
- Recolher pedidos de melhoria num quadro público (GitHub Issues do repositório) com etiquetas por módulo, para manter a lista da secção 3 atualizada.

## Fontes

- [Clearwater Analytics - avaliações G2](https://www.g2.com/products/clearwater-analytics/reviews)
- [Clearwater Analytics - pontos fortes e lacunas (RFP.wiki)](https://www.rfp.wiki/investment/investment-management-software/clearwater-analytics)
- [Clearwater Analytics vs SimCorp (RFP.wiki)](https://www.rfp.wiki/investment/investment-management-software/clearwater-analytics/simcorp)
- [SimCorp vs Clearwater (RFP.wiki)](https://www.rfp.wiki/investment/investment-management-software/simcorp/clearwater-analytics)
- [Clearwater Analytics vs SimCorp One (TrustRadius)](https://www.trustradius.com/compare-products/clearwater-analytics-vs-simcorp-one)
- [SimCorp - soluções para seguradoras](https://simcorp.com/1/flexible-solutions-for-modern-insurance-operations)
- [SS&C - 5 lessons learned from insurers migrating](https://www.ssctech.com/blog/5-lessons-learned-from-insurers-migrating-to-modern-investment-technology)
- [SS&C - 3 ways to optimize insurance investment operations](https://www.ssctech.com/blog/3-ways-to-optimize-insurance-investment-operations)
- [SS&C - Can your insurance investment accounting platform scale](https://d10staging.insuranceaum.com/can-your-insurance-investment-accounting-platform-scale-as-you-grow)
- [Arcesium - insurance investment data management](https://www.arcesium.com/blog/insurance-transform-investment-data-management)
- [Arcesium - data organization for insurance reporting](https://www.arcesium.com/blog/insurance-regulatory-reporting-data-management)
- [Top insurance investment accounting software (ZipDo)](https://zipdo.co/best/insurance-investment-accounting-software/)
- [Solvency II reporting software (Gitnux)](https://gitnux.org/best/solvency-ii-reporting-software/)
- [Simplifying Solvency II reporting for SPIRE repacks (Confluence)](https://content.confluence.com/simplifying-solvency-2)
- [FRS - GRC technology provider of the year (Risk.net)](https://www.risk.net/asset-management/2478740/grc-technology-provider-of-the-year-financial-risk-solutions)
- [Portfolio Performance - ajuda sobre obrigações](https://help.portfolio-performance.info/en/getting-started/manage-portfolio/bonds/)
- [Portfolio Performance - fórum, cost basis modification](https://forum.portfolio-performance.info/t/cost-basis-modification-transaction-type/28187?page=2)
- [Portfolio Performance - fórum, juros em contas de depósito](https://forum.portfolio-performance.info/t/inaccurate-performance-for-deposit-accounts-with-interest-payment/31246)
- [Fund Manager - bond accretion and amortization](https://www.fundmanagersoftware.com/help/dlg_bond_accretion.html)
- [Bank of England - instruções do IR.06.02 (lista de ativos)](https://bankofengland.co.uk/-/media/boe/files/prudential-regulation/regulatory-reporting/insurance/ir0602-instructions-list-of-assets-29-02-2024)
- [NBB - anexo sobre a lista de ativos de Solvência II](https://nbb.be/doc/cp/eng/2016/20160104_nbb_2016_01_annex1.pdf)
- [EIOPA Q&A - fundos na categoria CIC 4](https://www.eiopa.europa.eu/qa-regulation/questions-and-answers-database/141_en)
- [PwC - IFRS 9 impact on insurers and IFRS 17 interaction](https://www.pwc.co.uk/audit-assurance/assets/pdf/ifrs-9-impact-insurers-ifrs-17-interaction.pdf)
- [KPMG - IFRS 9 classification, measurement and impairment, insurance sector](https://assets.kpmg.com/content/dam/kpmg/pdf/2016/06/ifrs-9-classification-measurement-and-impairment-insurance-sector-initial-considerations.pdf)
- [J.P. Morgan AM - adopting IFRS 9, a case study for insurers](https://am.jpmorgan.com/pt/en/asset-management/institutional/investment-strategies/insurance/insights/adopting-ifrs-9-a-case-study-for-insurers)
- [Amundi - IFRS 9 and 17 post-implementation review](https://research-center.amundi.com/article/ifrs-9-and-17-ongoing-iasb-post-implementation-review-investment-implications-insurers)
- [ASF - Norma Regulamentar n.º 10/2016-R (vLex)](https://vlex.pt/vid/norma-regulamentar-da-autoridade-760480753)
- [ASF - Norma Regulamentar n.º 3/2018-R (vLex)](https://vlex.pt/vid/norma-regulamentar-da-autoridade-760541769)
