-- Investment Hub: atualiza os dados de demonstracao para o PCES em vigor (NR 9/2022-R), depois do 003.
-- Carteiras com os tipos da tabela 9 e as classes de contas, regras com as contas do PCES e "Valores livres".
update public.inv_carteiras c set nome = v.nome, tipo = v.tipo, classe_contas = v.classe, modelo_negocio = v.modelo
from (values
  ('VIDA', 'Vida com participação nos resultados', 'a) Vida com participação nos resultados, sem investimento autónomo', '20', 'Deter para recolher e vender (Hold to collect and sell)'),
  ('NVIDA', 'Não Vida', 'g) Restantes seguros não vida', '22', 'Deter para recolher (Hold to collect)'),
  ('PPR', 'Fundo autónomo PPR', 'b) Vida com participação nos resultados, com investimento autónomo', '20', 'Deter para recolher e vender (Hold to collect and sell)'),
  ('LIVRES', 'Valores livres', 'h) Valores livres', '23', 'Deter para recolher e vender (Hold to collect and sell)')
) as v(id, nome, tipo, classe, modelo) where c.id = v.id;
delete from public.inv_regras_contabilisticas;
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
update public.inv_aprovacoes set descricao = replace(descricao, '· Livres', '· Valores livres') where descricao like '%· Livres%';
update public.inv_trilho set valor_anterior = 'Valores livres' where valor_anterior = 'Livres';
select (select string_agg(id || '=' || classe_contas, ' ' order by ordem) from public.inv_carteiras) carteiras,
       (select count(*) from public.inv_regras_contabilisticas) regras;
