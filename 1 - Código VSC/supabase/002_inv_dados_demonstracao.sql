-- Gerado por gerar-dados.js a partir de dados-demonstracao.js. Nao editar a mao.
-- Dados ficticios (Seguradora A). Repoe o estado de demonstracao.
begin;
truncate public.inv_trilho, public.inv_aprovacoes, public.inv_afetacoes, public.inv_operacoes, public.inv_lotes, public.inv_instrumentos, public.inv_emitentes, public.inv_carteiras, public.inv_entidades, public.inv_limites, public.inv_fecho_passos, public.inv_regras_contabilisticas, public.inv_pd, public.inv_lgd, public.inv_parametros;
insert into public.inv_parametros (chave, valor) values
  ('data_ref', '"2026-10-31"'),
  ('periodo', '"Outubro 2026"'),
  ('data_anterior', '"2026-09-30"'),
  ('taxa_impostos_diferidos', '0.225'),
  ('limite_vendas_deter_recolher', '{"alerta":0.05,"maximo":0.1}'),
  ('precos_anteriores', '{"I01":100.95,"I02":99.2,"I03":101.7,"I04":103.9,"I05":98.4,"I06":96.7,"I07":100.85,"I08":102.2,"I09":92.4,"I10":17.95,"I11":6.1,"I12":6.8,"I13":104.6,"I14":100}'),
  ('balancete', '{"data":"2026-10-31","saldos":{"12":0,"11 01":799332.2,"11 08":1278000,"20 23":41226407.16,"22 20":2097720,"22 25":9588455.13,"23 13":2485000,"23 20":4059290,"23 23":5880445.1},"justificacoes":{"12":"Impostos diferidos de outubro ainda não lançados.","20 23":"Juro de outubro do lote L012 lançado na classe 20 depois da transferência AF-0031 para valores livres. Correção a lançar.","23 23":"Contrapartida da diferença na conta 20 23."}}'),
  ('depositario', '{"nome":"Depositário A","data":"2026-10-31","posicoes":{"I01":9000000,"I02":3000000,"I03":5000000,"I04":7500000,"I05":7000000,"I06":3050000,"I07":6000000,"I08":7500000,"I09":3500000,"I10":150000,"I11":400000,"I13":35000},"fora":{"I12":"Participação não cotada: registo de ações nominativas na sede","I14":"Depósito a prazo: confirmação do Banco B"},"justificacoes":{"I06":"Em análise com o depositário: 50 000 de nominal a mais no extrato."},"caixa":[{"data":"2026-10-09","ref":"OP-1183","desc":"Dividendo Retalho F (líquido de imposto retido)","valor":39375},{"data":"2026-10-10","ref":"OP-1184","desc":"Venda OT 1,95% 2029","valor":996750.68},{"data":"2026-10-21","ref":"OP-1185","desc":"Compra Fundo Monetário I","valor":-209420},{"data":"2026-10-30","ref":"OP-1187","desc":"Cupão BTP 4% 2031 - Vida","valor":100000},{"data":"2026-10-30","ref":"OP-1188","desc":"Cupão BTP 4% 2031 - Fundo autónomo PPR","valor":50000}]}');
insert into public.inv_entidades (id, nome, moeda, metodo_lotes) values
  ('SA', 'Seguradora A', 'EUR', 'Custo médio ponderado');
insert into public.inv_carteiras (id, entidade_id, nome, tipo, afeto, ramo, classe_contas, modelo_negocio, carteira_sii, provisoes_tecnicas, fundo_autonomo, ordem) values
  ('VIDA', 'SA', 'Vida com participação nos resultados', 'a) Vida com participação nos resultados, sem investimento autónomo', true, 'Vida', '20', 'Deter para recolher e vender (Hold to collect and sell)', 'Life', 28600000, null, 0),
  ('NVIDA', 'SA', 'Não Vida', 'g) Restantes seguros não vida', true, 'Não Vida', '22', 'Deter para recolher (Hold to collect)', 'Non-life', 10500000, null, 1),
  ('PPR', 'SA', 'Fundo autónomo PPR', 'b) Vida com participação nos resultados, com investimento autónomo', true, 'Vida', '20', 'Deter para recolher e vender (Hold to collect and sell)', 'Ring fenced funds', 9750000, 'RFF-01', 2),
  ('LIVRES', 'SA', 'Valores livres', 'h) Valores livres', false, '-', '23', 'Deter para recolher e vender (Hold to collect and sell)', 'General', 0, null, 3);
insert into public.inv_emitentes (id, nome, tipo, pais, nace, rating, rating_anterior, grupo) values
  ('PT', 'República Portuguesa', 'Soberano', 'PT', 'O84.1.1', 'A', null, null),
  ('ES', 'Reino de Espanha', 'Soberano', 'ES', 'O84.1.1', 'A', null, null),
  ('IT', 'República Italiana', 'Soberano', 'IT', 'O84.1.1', 'BBB', null, null),
  ('DE', 'República Federal da Alemanha', 'Soberano', 'DE', 'O84.1.1', 'AAA', null, null),
  ('SUP', 'Supranacional E', 'Supranacional', 'EU', 'U99.0.0', 'AAA', null, null),
  ('IND', 'Emitente Industrial A', 'Empresa não financeira', 'PT', 'C24.1.0', 'BBB+', null, 'Grupo Industrial A'),
  ('BAN', 'Banco B', 'Banco', 'PT', 'K64.1.9', 'A-', null, 'Grupo Banco B'),
  ('ENE', 'Energia C', 'Empresa não financeira', 'ES', 'D35.1.1', 'BB+', 'BBB', 'Grupo Energia C'),
  ('RET', 'Retalho F', 'Empresa não financeira', 'PT', 'G47.1.1', '-', null, null),
  ('UTI', 'Utilities G', 'Empresa não financeira', 'PT', 'D35.1.4', '-', null, 'Grupo Energia C'),
  ('IMO', 'Imobiliária H', 'Empresa não financeira', 'PT', 'L68.2.0', '-', null, null),
  ('GES', 'Gestora I', 'Fundo', 'LU', 'K66.3.0', '-', null, null);
insert into public.inv_instrumentos (id, isin, codigo, nome, tipo, emitente_id, cic, taxa, frequencia, base_dias, data_emissao, data_vencimento, nominal_unitario, preco, nivel_jv, sppi, fonte_preco, excecao_preco, preco_manual, relacao, participacao, ordem) values
  ('I01', 'PT00DEMO0001', null, 'OT 2,875% 2034', 'obr', 'PT', 'PT12', 0.02875, 1, 'ACT/ACT ICMA', '2024-07-21', '2034-07-21', 1, 101.42, 1, 'Pass', 'Fecho de mercado', null, false, null, null, 0),
  ('I02', 'PT00DEMO0002', null, 'OT 1,95% 2029', 'obr', 'PT', 'PT12', 0.0195, 1, 'ACT/ACT ICMA', '2019-06-15', '2029-06-15', 1, 99.31, 1, 'Pass', 'Fecho de mercado', null, false, null, null, 1),
  ('I03', 'ES00DEMO0003', null, 'Bonos 3,15% 2033', 'obr', 'ES', 'ES12', 0.0315, 1, 'ACT/ACT ICMA', '2023-04-30', '2033-04-30', 1, 102.05, 1, 'Pass', 'Fecho de mercado', null, false, null, null, 2),
  ('I04', 'IT00DEMO0004', null, 'BTP 4% 2031', 'obr', 'IT', 'IT12', 0.04, 2, 'ACT/ACT ICMA', '2023-10-30', '2031-04-30', 1, 104.18, 1, 'Pass', 'Fecho de mercado', null, false, null, null, 3),
  ('I05', 'DE00DEMO0005', null, 'Bund 2,5% 2035', 'obr', 'DE', 'DE11', 0.025, 1, 'ACT/ACT ICMA', '2025-02-15', '2035-02-15', 1, 98.74, 1, 'Pass', 'Fecho de mercado', null, false, null, null, 4),
  ('I06', 'XS00DEMO0006', null, 'Supranacional E 0% 2028', 'obr', 'SUP', 'XL13', 0, 1, 'ACT/ACT ICMA', '2021-03-10', '2028-03-10', 1, 96.88, 2, 'Pass', 'Contribuidor', null, false, null, null, 5),
  ('I07', 'PT00DEMO0007', null, 'Industrial A 3,75% 2030', 'obr', 'IND', 'PT21', 0.0375, 1, 'ACT/ACT ICMA', '2023-11-20', '2030-11-20', 1, 101.1, 2, 'Pass', 'Contribuidor', null, false, null, null, 6),
  ('I08', 'PT00DEMO0008', null, 'Banco B 4,25% 2028 Sénior', 'obr', 'BAN', 'PT21', 0.0425, 1, 'ACT/ACT ICMA', '2023-05-25', '2028-05-25', 1, 102.35, 2, 'Pass', 'Contribuidor', null, false, null, null, 7),
  ('I09', 'ES00DEMO0009', null, 'Energia C 2,25% 2032', 'obr', 'ENE', 'ES21', 0.0225, 1, 'ACT/ACT ICMA', '2022-09-14', '2032-09-14', 1, 88.6, 2, 'Pass', 'Contribuidor', 'Variação diária −4,1% (limite 3%)', false, null, null, 8),
  ('I10', 'PT00DEMO0010', null, 'Retalho F (ações)', 'acao', 'RET', 'PT31', null, null, null, null, null, null, 18.42, 1, null, 'Fecho de mercado', null, false, null, null, 9),
  ('I11', 'PT00DEMO0011', null, 'Utilities G (ações)', 'acao', 'UTI', 'PT31', null, null, null, null, null, null, 6.215, 1, null, 'Fecho de mercado', null, false, null, null, 10),
  ('I12', null, 'NC-IMO-H', 'Imobiliária H, S.A. (35%)', 'part', 'IMO', 'XL32', null, null, null, null, null, null, 7.1, 3, null, 'Avaliação interna (DCF)', null, true, 'Associada', 0.35, 11),
  ('I13', 'LU00DEMO0013', null, 'Fundo Monetário I (UCITS)', 'fundo', 'GES', 'LU43', null, null, null, null, null, null, 104.886, 1, null, 'NAV do gestor', null, false, null, null, 12),
  ('I14', null, 'DP-BAN-2027', 'Depósito a prazo Banco B 2,6% 2027', 'dep', 'BAN', 'XT74', 0.026, 1, 'ACT/360', '2026-03-01', '2027-03-01', 1, 100, 2, 'Pass', 'Valor nominal + juro', null, false, null, null, 13);
insert into public.inv_lotes (id, instrumento_id, carteira_id, data_aquisicao, quantidade, quantidade_inicial, preco_aquisicao, classificacao, rating_aquisicao) values
  ('L001', 'I01', 'VIDA', '2024-09-12', 6000000, null, 99.1, 'FVOCI', 'BBB+'),
  ('L002', 'I01', 'PPR', '2025-03-04', 3000000, null, 98.2, 'FVOCI', 'A-'),
  ('L003', 'I02', 'NVIDA', '2022-02-10', 3000000, 4000000, 103.85, 'CA', 'BBB'),
  ('L004', 'I03', 'VIDA', '2023-06-20', 5000000, null, 99.4, 'FVOCI', 'A'),
  ('L005', 'I04', 'VIDA', '2024-01-15', 5000000, null, 101.95, 'FVOCI', 'BBB'),
  ('L006', 'I04', 'PPR', '2024-05-08', 2500000, null, 100.6, 'FVOCI', 'BBB'),
  ('L007', 'I05', 'VIDA', '2025-03-20', 7000000, null, 97.35, 'FVOCI', 'AAA'),
  ('L008', 'I06', 'NVIDA', '2023-03-10', 3000000, null, 91.2, 'CA', 'AAA'),
  ('L009', 'I07', 'VIDA', '2024-02-01', 4000000, null, 100.25, 'FVOCI', 'BBB+'),
  ('L010', 'I07', 'NVIDA', '2024-02-01', 2000000, null, 100.25, 'CA', 'BBB+'),
  ('L011', 'I08', 'PPR', '2023-07-12', 4500000, null, 100.8, 'FVOCI', 'BBB+'),
  ('L012', 'I08', 'LIVRES', '2024-10-03', 3000000, null, 103.1, 'FVOCI', 'A-'),
  ('L013', 'I09', 'VIDA', '2022-10-05', 3500000, null, 86.4, 'FVOCI', 'BBB'),
  ('L014', 'I10', 'LIVRES', '2021-05-17', 150000, null, 14.8, 'FVOCI-EQ', null),
  ('L015', 'I11', 'LIVRES', '2023-09-28', 400000, null, 5.62, 'FVTPL', null),
  ('L016', 'I12', 'LIVRES', '2019-12-30', 350000, null, 5, 'FVOCI-EQ', null),
  ('L017', 'I13', 'NVIDA', '2026-01-05', 20000, null, 101.95, 'FVTPL', null),
  ('L018', 'I13', 'LIVRES', '2025-06-02', 15000, null, 100.77, 'FVTPL', null),
  ('L019', 'I14', 'NVIDA', '2026-03-01', 1500000, null, 100, 'CA', 'A-');
insert into public.inv_afetacoes (id, data_efetiva, lote_id, quantidade, carteira_origem, carteira_destino, motivo, registado_por, registado_em, aprovado_por, aprovado_em, estado) values
  ('AF-0031', '2026-10-15', 'L012', 3000000, 'PPR', 'LIVRES', 'Excesso de cobertura do fundo autónomo PPR após resgates', 'Ana Ramos', '2026-10-15 10:42:00 Europe/Lisbon', 'Pedro Lima', '2026-10-15 16:03:00 Europe/Lisbon', 'Approved'),
  ('AF-0032', '2026-10-31', 'L018', 15000, 'LIVRES', 'VIDA', 'Reforço da cobertura Vida no fecho de outubro', 'Ana Ramos', '2026-11-03 09:15:00 Europe/Lisbon', null, null, 'Pending approval'),
  ('AF-0030', '2026-07-01', 'L010', 2000000, 'VIDA', 'NVIDA', 'Afetação parcial do lote L009 a Não Vida (divisão do lote)', 'Ana Ramos', '2026-07-01 11:20:00 Europe/Lisbon', 'Pedro Lima', '2026-07-01 15:47:00 Europe/Lisbon', 'Approved'),
  ('AF-0029', '2026-03-01', 'L019', 1500000, null, 'NVIDA', 'Afetação inicial na constituição do depósito', 'Ana Ramos', '2026-03-01 09:02:00 Europe/Lisbon', 'Pedro Lima', '2026-03-01 12:30:00 Europe/Lisbon', 'Approved');
insert into public.inv_operacoes (id, tipo, instrumento_id, carteira_id, data_negociacao, data_liquidacao, quantidade, preco, juro_corrido, valor, imposto_retido, estado, registado_por, aprovado_por, nota) values
  ('OP-1189', 'Purchase', 'I05', 'LIVRES', '2026-11-04', '2026-11-06', 1000000, 98.74, 18082.19, 1005482.19, null, 'Pending approval', 'André Borges', null, null),
  ('OP-1187', 'Coupon', 'I04', 'VIDA', '2026-10-30', '2026-10-30', 5000000, null, null, 100000, null, 'Pending approval', 'Ana Ramos', null, null),
  ('OP-1188', 'Coupon', 'I04', 'PPR', '2026-10-30', '2026-10-30', 2500000, null, null, 50000, null, 'Pending approval', 'Ana Ramos', null, null),
  ('OP-1185', 'Purchase', 'I13', 'NVIDA', '2026-10-20', '2026-10-21', 2000, 104.71, null, 209420, null, 'Approved', 'Ana Ramos', 'Pedro Lima', null),
  ('OP-1184', 'Sale', 'I02', 'NVIDA', '2026-10-08', '2026-10-10', 1000000, 99.05, 6250.68, 996750.68, null, 'Approved', 'Ana Ramos', 'Pedro Lima', null),
  ('OP-1183', 'Dividend', 'I10', 'LIVRES', '2026-10-06', '2026-10-09', 150000, null, null, 52500, 13125, 'Approved', 'Ana Ramos', 'Pedro Lima', null),
  ('OP-1182', 'Impairment', 'I09', 'VIDA', '2026-10-31', '2026-10-31', 3500000, null, null, 0, null, 'Draft', 'Rui Matos', null, 'Passagem a estágio 2 por perda de investment grade');
insert into public.inv_aprovacoes (ref, tipo, descricao, pedido_por, pedido_em, impacto) values
  ('OP-1189', 'Transaction', 'Purchase Bund 2,5% 2035 · Valores livres · 1 000 000 nominal', 'André Borges', '2026-11-05 10:20:00 Europe/Lisbon', 'Recorded by you'),
  ('OP-1187', 'Transaction', 'Coupon BTP 4% 2031 · Vida · 100 000,00 EUR', 'Ana Ramos', '2026-11-02 09:10:00 Europe/Lisbon', 'Matches cash-flow schedule and custodian statement'),
  ('OP-1188', 'Transaction', 'Coupon BTP 4% 2031 · Fundo autónomo PPR · 50 000,00 EUR', 'Ana Ramos', '2026-11-02 09:11:00 Europe/Lisbon', 'Matches cash-flow schedule and custodian statement'),
  ('AF-0032', 'Reallocation', 'Fundo Monetário I · 15 000 units · Valores livres → Vida', 'Ana Ramos', '2026-11-03 09:15:00 Europe/Lisbon', 'Coverage Vida +5,5 p.p. · no limits affected'),
  ('PR-0412', 'Manual price', 'Imobiliária H, S.A. · 7,10 EUR/share (was 6,80) · Level 3', 'Ana Ramos', '2026-11-04 14:22:00 Europe/Lisbon', 'Fair value +105 000,00 EUR in OCI · valuation report attached'),
  ('ECL-0098', 'Stage change', 'Energia C 2,25% 2032 · stage 1 → 2 (lost investment grade)', 'Rui Matos', '2026-11-04 17:40:00 Europe/Lisbon', 'Lifetime ECL replaces 12-month ECL'),
  ('BO-0021', 'Parameter', 'Price tolerance, corporate bonds: daily change 3% → 4%', 'Rui Matos', '2026-11-05 11:05:00 Europe/Lisbon', 'Would release 1 open price exception');
insert into public.inv_trilho (em, utilizador, objeto, registo, campo, valor_anterior, valor_novo, motivo, origem) values
  ('2026-10-08 15:30:00 Europe/Lisbon', 'Ana Ramos', 'Transaction', 'OP-1184', 'Accrued interest', '6 250,68 (calculated)', '6 250,68 (broker note)', 'Diferença 0,00', 'Screen'),
  ('2026-10-10 12:41:00 Europe/Lisbon', 'Pedro Lima', 'Transaction', 'OP-1184', 'State', 'Pending approval', 'Approved', null, 'Screen'),
  ('2026-10-15 16:03:00 Europe/Lisbon', 'Pedro Lima', 'Allocation', 'AF-0031', 'State', 'Pending approval', 'Approved', null, 'Screen'),
  ('2026-11-02 08:55:00 Europe/Lisbon', 'Sistema', 'Import', 'IMP-0377', 'Prices 2026-10-30', '-', '12 prices, 1 exception', 'Ficheiro do custodiante', 'File import'),
  ('2026-11-03 09:15:00 Europe/Lisbon', 'Ana Ramos', 'Allocation', 'AF-0032', 'Portfolio', 'Valores livres', 'Vida (pending)', 'Reforço da cobertura Vida', 'Screen'),
  ('2026-11-04 14:22:00 Europe/Lisbon', 'Ana Ramos', 'Price', 'PR-0412', 'Price', '6,80', '7,10 (pending)', 'Relatório de avaliação 30/09/2026', 'Screen'),
  ('2026-11-04 17:40:00 Europe/Lisbon', 'Rui Matos', 'Impairment', 'ECL-0098', 'Stage', '1', '2 (pending)', 'Rating BB+ (perda de investment grade)', 'Calculation'),
  ('2026-11-05 11:05:00 Europe/Lisbon', 'Rui Matos', 'Parameter', 'BO-0021', 'Tolerance (corporate bonds)', '3%', '4% (pending)', 'Volatilidade do mercado de crédito', 'Backoffice');
insert into public.inv_limites (id, dimensao, alvo, base, alerta, maximo, origem, justificacao) values
  (1, 'Emitente (exceto soberanos UE)', 'Banco B', 'Total da carteira', 0.12, 0.15, 'Interno', null),
  (2, 'Grupo de emitentes', 'Grupo Energia C', 'Total da carteira', 0.08, 0.1, 'Interno', null),
  (3, 'País (soberano)', 'Itália', 'Total da carteira', 0.1, 0.15, 'Interno', null),
  (4, 'Rating abaixo de investment grade', 'Rating < BBB-', 'Total da carteira', 0.02, 0.03, 'Interno', 'Energia C desceu para BB+ a 2026-10-14. Comité de investimentos decidiu manter até 2027-Q1.'),
  (5, 'Ações cotadas', 'CIC 31', 'Total da carteira', 0.09, 0.12, 'Interno', null),
  (6, 'Não cotados', 'CIC XL3x', 'Total da carteira', 0.03, 0.05, 'Interno', null),
  (7, 'Fundo autónomo PPR - emitente único', 'Banco B', 'Carteira PPR', 0.4, 0.5, 'Contratual', null);
insert into public.inv_fecho_passos (ordem, titulo, estado, detalhe) values
  (1, 'FX rates loaded (ECB)', 'ok', '31/10 · 4 currencies'),
  (2, 'Prices loaded and exceptions treated', 'warn', '1 exception open: Energia C 2,25% 2032'),
  (3, 'Cash flows confirmed against custodian', 'warn', '2 coupons pending approval'),
  (4, 'Custodian reconciliation', 'warn', '3 differences open'),
  (5, 'Ratings updated and ECL approved', 'warn', '1 stage change pending approval'),
  (6, 'Limits checked and breaches justified', 'ok', '1 breach justified (rating < BBB-)'),
  (7, 'Period calculation', 'todo', 'Amortised cost, fair value, reserves, gains'),
  (8, 'Journal entries generated and exported', 'todo', 'Export to ERP'),
  (9, 'General ledger reconciliation', 'warn', '3 differences open'),
  (10, 'Period closed', 'todo', 'Needs approval');
insert into public.inv_regras_contabilisticas (id, evento, classificacao, carteira, tipo_ativo, conta_debito, conta_credito) values
  (1, 'Purchase', 'Any', 'Any', 'Debt securities', '20/22/23 · Títulos de dívida (conta da classificação)', '51 Depósitos à ordem'),
  (2, 'Interest (EIR)', 'CA / FVOCI', 'Any', 'Debt securities', '20/22/23 · Títulos de dívida (juros e amortização do prémio ou desconto)', '74 Rendimentos de investimentos'),
  (3, 'Coupon received', 'Any', 'Any', 'Debt securities', '51 Depósitos à ordem', '20/22/23 · Títulos de dívida (juros corridos)'),
  (4, 'Fair value change', 'FVOCI', 'Any', 'Debt securities', '20/22/23 · Ativos ao justo valor através de reservas', '11 01 Reservas de reavaliação (dívida ao justo valor através de reservas)'),
  (5, 'Fair value change', 'FVTPL', 'Any', 'Any', '20/22/23 · Ativos ao justo valor através de resultados', '75 Ganhos em investimentos (65 Perdas, se negativa)'),
  (6, 'ECL charge', 'FVOCI', 'Any', 'Debt securities', '66 Perdas por imparidade', '11 2 Provisão para perdas de crédito previstas'),
  (7, 'ECL charge', 'CA', 'Any', 'Debt securities', '66 Perdas por imparidade', '29 Imparidade acumulada (custo amortizado)'),
  (8, 'ECL reversal', 'CA / FVOCI', 'Any', 'Debt securities', '29 / 11 2', '76 Reversão de perdas por imparidade'),
  (9, 'Sale - reclassification adjustment', 'FVOCI', 'Any', 'Debt securities', '11 01 Reservas de reavaliação', '75 Ganhos em investimentos (65 Perdas)'),
  (10, 'Sale - transfer within equity', 'FVOCI-EQ', 'Any', 'Equity', '11 08 Reservas de reavaliação (capital próprio)', '19 Resultados transitados'),
  (11, 'Dividend', 'Any', 'Any', 'Equity', '51 Depósitos à ordem', '74 Rendimentos de investimentos'),
  (12, 'Transfer between portfolios', 'Any', 'Different account class', 'Any', 'Classe da carteira de destino (20/21/22/23)', 'Classe da carteira de origem, pelo valor contabilizado');
insert into public.inv_pd (rating, pd_12m, ordem) values
  ('AAA', 0.0001, 0),
  ('AA+', 0.0002, 1),
  ('AA', 0.0002, 2),
  ('AA-', 0.0003, 3),
  ('A+', 0.0004, 4),
  ('A', 0.0005, 5),
  ('A-', 0.0007, 6),
  ('BBB+', 0.0012, 7),
  ('BBB', 0.0018, 8),
  ('BBB-', 0.0028, 9),
  ('BB+', 0.006, 10),
  ('BB', 0.0095, 11),
  ('BB-', 0.015, 12);
insert into public.inv_lgd (tipo_emitente, lgd) values
  ('Soberano', 0.45),
  ('Supranacional', 0.45),
  ('Banco', 0.55),
  ('Empresa não financeira', 0.6);
commit;
