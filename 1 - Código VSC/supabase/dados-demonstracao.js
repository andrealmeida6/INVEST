/* dados-demonstracao.js - dados de demonstracao (Anexo B da especificacao). Fonte do 002_inv_dados_demonstracao.sql (node gerar-dados.js).
   Entidade ficticia "Seguradora A". Emitentes de divida publica identificados pelo Estado; empresas ficticias.
   O ecra le-os do Supabase (inv_dados); na plataforma real vem do Dataverse. Os valores sao calculados pelo inv-motor.js. */
window.INV = {
  dataRef: '2026-10-31',
  periodo: 'Outubro 2026',
  /* Parametros (tabela inv_parametros). A taxa de imposto e ilustrativa */
  param: {
    data_anterior: '2026-09-30',
    taxa_impostos_diferidos: 0.225,
    limite_vendas_deter_recolher: { alerta: 0.05, maximo: 0.10 },
    precos_anteriores: { I01: 100.95, I02: 99.20, I03: 101.70, I04: 103.90, I05: 98.40, I06: 96.70, I07: 100.85, I08: 102.20, I09: 92.40, I10: 17.95, I11: 6.10, I12: 6.80, I13: 104.60, I14: 100 },
    /* Balancete da contabilidade geral a 31/10 (exportado do ERP). Duas diferencas para demonstracao */
    balancete: {
      data: '2026-10-31',
      saldos: { '11 01': 799332.20, '11 08': 1278000.00, '12': 0, '20 23': 41226407.16, '22 20': 2097720.00, '22 25': 9588455.13, '23 13': 2485000.00, '23 20': 4059290.00, '23 23': 5880445.10 },
      justificacoes: {
        '20 23': 'Juro de outubro do lote L012 lançado na classe 20 depois da transferência AF-0031 para valores livres. Correção a lançar.',
        '23 23': 'Contrapartida da diferença na conta 20 23.',
        '12': 'Impostos diferidos de outubro ainda não lançados.'
      }
    },
    /* Extrato do depositario a 31/10 */
    depositario: {
      nome: 'Depositário A', data: '2026-10-31',
      posicoes: { I01: 9000000, I02: 3000000, I03: 5000000, I04: 7500000, I05: 7000000, I06: 3050000, I07: 6000000, I08: 7500000, I09: 3500000, I10: 150000, I11: 400000, I13: 35000 },
      fora: { I12: 'Participação não cotada: registo de ações nominativas na sede', I14: 'Depósito a prazo: confirmação do Banco B' },
      justificacoes: { I06: 'Em análise com o depositário: 50 000 de nominal a mais no extrato.' },
      caixa: [
        { data: '2026-10-09', ref: 'OP-1183', desc: 'Dividendo Retalho F (líquido de imposto retido)', valor: 39375.00 },
        { data: '2026-10-10', ref: 'OP-1184', desc: 'Venda OT 1,95% 2029', valor: 996750.68 },
        { data: '2026-10-21', ref: 'OP-1185', desc: 'Compra Fundo Monetário I', valor: -209420.00 },
        { data: '2026-10-30', ref: 'OP-1187', desc: 'Cupão BTP 4% 2031 - Vida', valor: 100000.00 },
        { data: '2026-10-30', ref: 'OP-1188', desc: 'Cupão BTP 4% 2031 - Fundo autónomo PPR', valor: 50000.00 }
      ]
    }
  },
  entidade: { id: 'SA', nome: 'Seguradora A', moeda: 'EUR', metodoLotes: 'Custo médio ponderado' },

  /* Tipos de carteira e classes de contas da tabela 9 e do quadro de contas do PCES (NR 9/2022-R) */
  carteiras: [
    { id: 'VIDA', nome: 'Vida com participação nos resultados', tipo: 'a) Vida com participação nos resultados, sem investimento autónomo', classe: '20', afeto: true, ramo: 'Vida', modelo: 'Deter para recolher e vender (Hold to collect and sell)', sii: 'Life', pt: 28600000 },
    { id: 'NVIDA', nome: 'Não Vida', tipo: 'g) Restantes seguros não vida', classe: '22', afeto: true, ramo: 'Não Vida', modelo: 'Deter para recolher (Hold to collect)', sii: 'Non-life', pt: 10500000 },
    { id: 'PPR', nome: 'Fundo autónomo PPR', tipo: 'b) Vida com participação nos resultados, com investimento autónomo', classe: '20', afeto: true, ramo: 'Vida', modelo: 'Deter para recolher e vender (Hold to collect and sell)', sii: 'Ring fenced funds', pt: 9750000, rff: 'RFF-01' },
    { id: 'LIVRES', nome: 'Valores livres', tipo: 'h) Valores livres', classe: '23', afeto: false, ramo: '-', modelo: 'Deter para recolher e vender (Hold to collect and sell)', sii: 'General', pt: 0 }
  ],

  emitentes: {
    PT: { nome: 'República Portuguesa', tipo: 'Soberano', pais: 'PT', nace: 'O84.1.1', rating: 'A' },
    ES: { nome: 'Reino de Espanha', tipo: 'Soberano', pais: 'ES', nace: 'O84.1.1', rating: 'A' },
    IT: { nome: 'República Italiana', tipo: 'Soberano', pais: 'IT', nace: 'O84.1.1', rating: 'BBB' },
    DE: { nome: 'República Federal da Alemanha', tipo: 'Soberano', pais: 'DE', nace: 'O84.1.1', rating: 'AAA' },
    SUP: { nome: 'Supranacional E', tipo: 'Supranacional', pais: 'EU', nace: 'U99.0.0', rating: 'AAA' },
    IND: { nome: 'Emitente Industrial A', tipo: 'Empresa não financeira', pais: 'PT', nace: 'C24.1.0', rating: 'BBB+', grupo: 'Grupo Industrial A' },
    BAN: { nome: 'Banco B', tipo: 'Banco', pais: 'PT', nace: 'K64.1.9', rating: 'A-', grupo: 'Grupo Banco B' },
    ENE: { nome: 'Energia C', tipo: 'Empresa não financeira', pais: 'ES', nace: 'D35.1.1', rating: 'BB+', ratingAnt: 'BBB', grupo: 'Grupo Energia C' },
    RET: { nome: 'Retalho F', tipo: 'Empresa não financeira', pais: 'PT', nace: 'G47.1.1', rating: '-' },
    UTI: { nome: 'Utilities G', tipo: 'Empresa não financeira', pais: 'PT', nace: 'D35.1.4', rating: '-', grupo: 'Grupo Energia C' },
    IMO: { nome: 'Imobiliária H', tipo: 'Empresa não financeira', pais: 'PT', nace: 'L68.2.0', rating: '-' },
    GES: { nome: 'Gestora I', tipo: 'Fundo', pais: 'LU', nace: 'K66.3.0', rating: '-' }
  },

  /* tipo: obr (obrigacao), acao, part (participacao nao cotada), fundo, dep (deposito). freq = cupoes por ano; base = convencao de contagem */
  instrumentos: [
    { id: 'I01', isin: 'PT00DEMO0001', nome: 'OT 2,875% 2034', tipo: 'obr', em: 'PT', cic: 'PT12', taxa: 0.02875, freq: 1, base: 'ACT/ACT ICMA', emissao: '2024-07-21', venc: '2034-07-21', nom: 1, preco: 101.42, nivel: 1, sppi: 'Pass', fonte: 'Fecho de mercado' },
    { id: 'I02', isin: 'PT00DEMO0002', nome: 'OT 1,95% 2029', tipo: 'obr', em: 'PT', cic: 'PT12', taxa: 0.0195, freq: 1, base: 'ACT/ACT ICMA', emissao: '2019-06-15', venc: '2029-06-15', nom: 1, preco: 99.31, nivel: 1, sppi: 'Pass', fonte: 'Fecho de mercado' },
    { id: 'I03', isin: 'ES00DEMO0003', nome: 'Bonos 3,15% 2033', tipo: 'obr', em: 'ES', cic: 'ES12', taxa: 0.0315, freq: 1, base: 'ACT/ACT ICMA', emissao: '2023-04-30', venc: '2033-04-30', nom: 1, preco: 102.05, nivel: 1, sppi: 'Pass', fonte: 'Fecho de mercado' },
    { id: 'I04', isin: 'IT00DEMO0004', nome: 'BTP 4% 2031', tipo: 'obr', em: 'IT', cic: 'IT12', taxa: 0.04, freq: 2, base: 'ACT/ACT ICMA', emissao: '2023-10-30', venc: '2031-04-30', nom: 1, preco: 104.18, nivel: 1, sppi: 'Pass', fonte: 'Fecho de mercado' },
    { id: 'I05', isin: 'DE00DEMO0005', nome: 'Bund 2,5% 2035', tipo: 'obr', em: 'DE', cic: 'DE11', taxa: 0.025, freq: 1, base: 'ACT/ACT ICMA', emissao: '2025-02-15', venc: '2035-02-15', nom: 1, preco: 98.74, nivel: 1, sppi: 'Pass', fonte: 'Fecho de mercado' },
    { id: 'I06', isin: 'XS00DEMO0006', nome: 'Supranacional E 0% 2028', tipo: 'obr', em: 'SUP', cic: 'XL13', taxa: 0, freq: 1, base: 'ACT/ACT ICMA', emissao: '2021-03-10', venc: '2028-03-10', nom: 1, preco: 96.88, nivel: 2, sppi: 'Pass', fonte: 'Contribuidor' },
    { id: 'I07', isin: 'PT00DEMO0007', nome: 'Industrial A 3,75% 2030', tipo: 'obr', em: 'IND', cic: 'PT21', taxa: 0.0375, freq: 1, base: 'ACT/ACT ICMA', emissao: '2023-11-20', venc: '2030-11-20', nom: 1, preco: 101.10, nivel: 2, sppi: 'Pass', fonte: 'Contribuidor' },
    { id: 'I08', isin: 'PT00DEMO0008', nome: 'Banco B 4,25% 2028 Sénior', tipo: 'obr', em: 'BAN', cic: 'PT21', taxa: 0.0425, freq: 1, base: 'ACT/ACT ICMA', emissao: '2023-05-25', venc: '2028-05-25', nom: 1, preco: 102.35, nivel: 2, sppi: 'Pass', fonte: 'Contribuidor' },
    { id: 'I09', isin: 'ES00DEMO0009', nome: 'Energia C 2,25% 2032', tipo: 'obr', em: 'ENE', cic: 'ES21', taxa: 0.0225, freq: 1, base: 'ACT/ACT ICMA', emissao: '2022-09-14', venc: '2032-09-14', nom: 1, preco: 88.60, nivel: 2, sppi: 'Pass', fonte: 'Contribuidor', excecao: 'Variação diária −4,1% (limite 3%)' },
    { id: 'I10', isin: 'PT00DEMO0010', nome: 'Retalho F (ações)', tipo: 'acao', em: 'RET', cic: 'PT31', preco: 18.42, nivel: 1, fonte: 'Fecho de mercado' },
    { id: 'I11', isin: 'PT00DEMO0011', nome: 'Utilities G (ações)', tipo: 'acao', em: 'UTI', cic: 'PT31', preco: 6.215, nivel: 1, fonte: 'Fecho de mercado' },
    { id: 'I12', isin: '', codigo: 'NC-IMO-H', nome: 'Imobiliária H, S.A. (35%)', tipo: 'part', em: 'IMO', cic: 'XL32', preco: 7.10, nivel: 3, fonte: 'Avaliação interna (DCF)', manual: true, relacao: 'Associada', pct: 0.35 },
    { id: 'I13', isin: 'LU00DEMO0013', nome: 'Fundo Monetário I (UCITS)', tipo: 'fundo', em: 'GES', cic: 'LU43', preco: 104.886, nivel: 1, fonte: 'NAV do gestor' },
    { id: 'I14', isin: '', codigo: 'DP-BAN-2027', nome: 'Depósito a prazo Banco B 2,6% 2027', tipo: 'dep', em: 'BAN', cic: 'XT74', taxa: 0.026, freq: 1, base: 'ACT/360', emissao: '2026-03-01', venc: '2027-03-01', nom: 1, preco: 100, nivel: 2, fonte: 'Valor nominal + juro', sppi: 'Pass' }
  ],

  /* Lotes: q = nominal (obrigacoes e depositos) ou quantidade (acoes, participacoes, fundos); p = preco limpo de aquisicao (% ou por unidade);
     cl = classificacao IFRS 9 (CA, FVOCI, FVOCI-EQ = FVOCI capital proprio, FVTPL); pd/rt = rating na aquisicao */
  lotes: [
    { id: 'L001', i: 'I01', c: 'VIDA', d: '2024-09-12', q: 6000000, p: 99.10, cl: 'FVOCI', rt: 'BBB+' },
    { id: 'L002', i: 'I01', c: 'PPR', d: '2025-03-04', q: 3000000, p: 98.20, cl: 'FVOCI', rt: 'A-' },
    { id: 'L003', i: 'I02', c: 'NVIDA', d: '2022-02-10', q: 3000000, q0: 4000000, p: 103.85, cl: 'CA', rt: 'BBB' },
    { id: 'L004', i: 'I03', c: 'VIDA', d: '2023-06-20', q: 5000000, p: 99.40, cl: 'FVOCI', rt: 'A' },
    { id: 'L005', i: 'I04', c: 'VIDA', d: '2024-01-15', q: 5000000, p: 101.95, cl: 'FVOCI', rt: 'BBB' },
    { id: 'L006', i: 'I04', c: 'PPR', d: '2024-05-08', q: 2500000, p: 100.60, cl: 'FVOCI', rt: 'BBB' },
    { id: 'L007', i: 'I05', c: 'VIDA', d: '2025-03-20', q: 7000000, p: 97.35, cl: 'FVOCI', rt: 'AAA' },
    { id: 'L008', i: 'I06', c: 'NVIDA', d: '2023-03-10', q: 3000000, p: 91.20, cl: 'CA', rt: 'AAA' },
    { id: 'L009', i: 'I07', c: 'VIDA', d: '2024-02-01', q: 4000000, p: 100.25, cl: 'FVOCI', rt: 'BBB+' },
    { id: 'L010', i: 'I07', c: 'NVIDA', d: '2024-02-01', q: 2000000, p: 100.25, cl: 'CA', rt: 'BBB+' },
    { id: 'L011', i: 'I08', c: 'PPR', d: '2023-07-12', q: 4500000, p: 100.80, cl: 'FVOCI', rt: 'BBB+' },
    { id: 'L012', i: 'I08', c: 'LIVRES', d: '2024-10-03', q: 3000000, p: 103.10, cl: 'FVOCI', rt: 'A-' },
    { id: 'L013', i: 'I09', c: 'VIDA', d: '2022-10-05', q: 3500000, p: 86.40, cl: 'FVOCI', rt: 'BBB' },
    { id: 'L014', i: 'I10', c: 'LIVRES', d: '2021-05-17', q: 150000, p: 14.80, cl: 'FVOCI-EQ' },
    { id: 'L015', i: 'I11', c: 'LIVRES', d: '2023-09-28', q: 400000, p: 5.62, cl: 'FVTPL' },
    { id: 'L016', i: 'I12', c: 'LIVRES', d: '2019-12-30', q: 350000, p: 5.00, cl: 'FVOCI-EQ' },
    { id: 'L017', i: 'I13', c: 'NVIDA', d: '2026-01-05', q: 20000, p: 101.950, cl: 'FVTPL' },
    { id: 'L018', i: 'I13', c: 'LIVRES', d: '2025-06-02', q: 15000, p: 100.770, cl: 'FVTPL' },
    { id: 'L019', i: 'I14', c: 'NVIDA', d: '2026-03-01', q: 1500000, p: 100, cl: 'CA', rt: 'A-' }
  ],

  /* Tabelas de PD (12 meses) e LGD do backoffice (R-06), ilustrativas */
  pd12: { AAA: 0.0001, 'AA+': 0.0002, AA: 0.0002, 'AA-': 0.0003, 'A+': 0.0004, A: 0.0005, 'A-': 0.0007, 'BBB+': 0.0012, BBB: 0.0018, 'BBB-': 0.0028, 'BB+': 0.0060, BB: 0.0095, 'BB-': 0.0150 },
  lgd: { Soberano: 0.45, Supranacional: 0.45, Banco: 0.55, 'Empresa não financeira': 0.60 },

  limites: [
    { dim: 'Emitente (exceto soberanos UE)', alvo: 'Banco B', base: 'Total da carteira', alerta: 0.12, max: 0.15, origem: 'Interno' },
    { dim: 'Grupo de emitentes', alvo: 'Grupo Energia C', base: 'Total da carteira', alerta: 0.08, max: 0.10, origem: 'Interno' },
    { dim: 'País (soberano)', alvo: 'Itália', base: 'Total da carteira', alerta: 0.10, max: 0.15, origem: 'Interno' },
    { dim: 'Rating abaixo de investment grade', alvo: 'Rating < BBB-', base: 'Total da carteira', alerta: 0.02, max: 0.03, origem: 'Interno', justif: 'Energia C desceu para BB+ a 2026-10-14. Comité de investimentos decidiu manter até 2027-Q1.' },
    { dim: 'Ações cotadas', alvo: 'CIC 31', base: 'Total da carteira', alerta: 0.09, max: 0.12, origem: 'Interno' },
    { dim: 'Não cotados', alvo: 'CIC XL3x', base: 'Total da carteira', alerta: 0.03, max: 0.05, origem: 'Interno' },
    { dim: 'Fundo autónomo PPR - emitente único', alvo: 'Banco B', base: 'Carteira PPR', alerta: 0.40, max: 0.50, origem: 'Contratual' }
  ],

  afetacoes: [
    { id: 'AF-0031', data: '2026-10-15', lote: 'L012', q: 3000000, de: 'PPR', para: 'LIVRES', motivo: 'Excesso de cobertura do fundo autónomo PPR após resgates', por: 'Ana Ramos', em: '2026-10-15 10:42', apr: 'Pedro Lima', aprEm: '2026-10-15 16:03', estado: 'Approved' },
    { id: 'AF-0032', data: '2026-10-31', lote: 'L018', q: 15000, de: 'LIVRES', para: 'VIDA', motivo: 'Reforço da cobertura Vida no fecho de outubro', por: 'Ana Ramos', em: '2026-11-03 09:15', estado: 'Pending approval' },
    { id: 'AF-0030', data: '2026-07-01', lote: 'L010', q: 2000000, de: 'VIDA', para: 'NVIDA', motivo: 'Afetação parcial do lote L009 a Não Vida (divisão do lote)', por: 'Ana Ramos', em: '2026-07-01 11:20', apr: 'Pedro Lima', aprEm: '2026-07-01 15:47', estado: 'Approved' },
    { id: 'AF-0029', data: '2026-03-01', lote: 'L019', q: 1500000, de: '-', para: 'NVIDA', motivo: 'Afetação inicial na constituição do depósito', por: 'Ana Ramos', em: '2026-03-01 09:02', apr: 'Pedro Lima', aprEm: '2026-03-01 12:30', estado: 'Approved' }
  ],

  operacoes: [
    { id: 'OP-1189', tipo: 'Purchase', i: 'I05', c: 'LIVRES', neg: '2026-11-04', liq: '2026-11-06', q: 1000000, preco: 98.74, jc: 18082.19, valor: 1005482.19, estado: 'Pending approval', por: 'André Borges' },
    { id: 'OP-1187', tipo: 'Coupon', i: 'I04', c: 'VIDA', neg: '2026-10-30', liq: '2026-10-30', q: 5000000, valor: 100000, estado: 'Pending approval', por: 'Ana Ramos' },
    { id: 'OP-1188', tipo: 'Coupon', i: 'I04', c: 'PPR', neg: '2026-10-30', liq: '2026-10-30', q: 2500000, valor: 50000, estado: 'Pending approval', por: 'Ana Ramos' },
    { id: 'OP-1185', tipo: 'Purchase', i: 'I13', c: 'NVIDA', neg: '2026-10-20', liq: '2026-10-21', q: 2000, preco: 104.71, valor: 209420, estado: 'Approved', por: 'Ana Ramos', apr: 'Pedro Lima' },
    { id: 'OP-1184', tipo: 'Sale', i: 'I02', c: 'NVIDA', neg: '2026-10-08', liq: '2026-10-10', q: 1000000, preco: 99.05, jc: 6250.68, valor: 996750.68, estado: 'Approved', por: 'Ana Ramos', apr: 'Pedro Lima', venda: true },
    { id: 'OP-1183', tipo: 'Dividend', i: 'I10', c: 'LIVRES', neg: '2026-10-06', liq: '2026-10-09', q: 150000, valor: 52500, ret: 13125, estado: 'Approved', por: 'Ana Ramos', apr: 'Pedro Lima' },
    { id: 'OP-1182', tipo: 'Impairment', i: 'I09', c: 'VIDA', neg: '2026-10-31', liq: '2026-10-31', q: 3500000, valor: 0, estado: 'Draft', por: 'Rui Matos', nota: 'Passagem a estágio 2 por perda de investment grade' }
  ],

  aprovacoes: [
    { tipo: 'Transaction', ref: 'OP-1189', desc: 'Purchase Bund 2,5% 2035 · Valores livres · 1 000 000 nominal', por: 'André Borges', em: '2026-11-05 10:20', imp: 'Recorded by you' },
    { tipo: 'Transaction', ref: 'OP-1187', desc: 'Coupon BTP 4% 2031 · Vida · 100 000,00 EUR', por: 'Ana Ramos', em: '2026-11-02 09:10', imp: 'Matches cash-flow schedule and custodian statement' },
    { tipo: 'Transaction', ref: 'OP-1188', desc: 'Coupon BTP 4% 2031 · Fundo autónomo PPR · 50 000,00 EUR', por: 'Ana Ramos', em: '2026-11-02 09:11', imp: 'Matches cash-flow schedule and custodian statement' },
    { tipo: 'Reallocation', ref: 'AF-0032', desc: 'Fundo Monetário I · 15 000 units · Valores livres → Vida', por: 'Ana Ramos', em: '2026-11-03 09:15', imp: 'Coverage Vida +5,5 p.p. · no limits affected' },
    { tipo: 'Manual price', ref: 'PR-0412', desc: 'Imobiliária H, S.A. · 7,10 EUR/share (was 6,80) · Level 3', por: 'Ana Ramos', em: '2026-11-04 14:22', imp: 'Fair value +105 000,00 EUR in OCI · valuation report attached' },
    { tipo: 'Stage change', ref: 'ECL-0098', desc: 'Energia C 2,25% 2032 · stage 1 → 2 (lost investment grade)', por: 'Rui Matos', em: '2026-11-04 17:40', imp: 'Lifetime ECL replaces 12-month ECL' },
    { tipo: 'Parameter', ref: 'BO-0021', desc: 'Price tolerance, corporate bonds: daily change 3% → 4%', por: 'Rui Matos', em: '2026-11-05 11:05', imp: 'Would release 1 open price exception' }
  ],

  trilho: [
    { em: '2026-11-05 11:05', u: 'Rui Matos', t: 'Parameter', reg: 'BO-0021', campo: 'Tolerance (corporate bonds)', ant: '3%', novo: '4% (pending)', mot: 'Volatilidade do mercado de crédito', orig: 'Backoffice' },
    { em: '2026-11-04 17:40', u: 'Rui Matos', t: 'Impairment', reg: 'ECL-0098', campo: 'Stage', ant: '1', novo: '2 (pending)', mot: 'Rating BB+ (perda de investment grade)', orig: 'Calculation' },
    { em: '2026-11-04 14:22', u: 'Ana Ramos', t: 'Price', reg: 'PR-0412', campo: 'Price', ant: '6,80', novo: '7,10 (pending)', mot: 'Relatório de avaliação 30/09/2026', orig: 'Screen' },
    { em: '2026-11-03 09:15', u: 'Ana Ramos', t: 'Allocation', reg: 'AF-0032', campo: 'Portfolio', ant: 'Valores livres', novo: 'Vida (pending)', mot: 'Reforço da cobertura Vida', orig: 'Screen' },
    { em: '2026-11-02 08:55', u: 'Sistema', t: 'Import', reg: 'IMP-0377', campo: 'Prices 2026-10-30', ant: '-', novo: '12 prices, 1 exception', mot: 'Ficheiro do custodiante', orig: 'File import' },
    { em: '2026-10-15 16:03', u: 'Pedro Lima', t: 'Allocation', reg: 'AF-0031', campo: 'State', ant: 'Pending approval', novo: 'Approved', mot: '', orig: 'Screen' },
    { em: '2026-10-10 12:41', u: 'Pedro Lima', t: 'Transaction', reg: 'OP-1184', campo: 'State', ant: 'Pending approval', novo: 'Approved', mot: '', orig: 'Screen' },
    { em: '2026-10-08 15:30', u: 'Ana Ramos', t: 'Transaction', reg: 'OP-1184', campo: 'Accrued interest', ant: '6 250,68 (calculated)', novo: '6 250,68 (broker note)', mot: 'Diferença 0,00', orig: 'Screen' }
  ],

  fecho: [
    { t: 'FX rates loaded (ECB)', s: 'ok', d: '31/10 · 4 currencies' },
    { t: 'Prices loaded and exceptions treated', s: 'warn', d: '1 exception open: Energia C 2,25% 2032' },
    { t: 'Cash flows confirmed against custodian', s: 'warn', d: '2 coupons pending approval' },
    { t: 'Custodian reconciliation', s: 'warn', d: '3 differences open' },
    { t: 'Ratings updated and ECL approved', s: 'warn', d: '1 stage change pending approval' },
    { t: 'Limits checked and breaches justified', s: 'ok', d: '1 breach justified (rating < BBB-)' },
    { t: 'Period calculation', s: 'todo', d: 'Amortised cost, fair value, reserves, gains' },
    { t: 'Journal entries generated and exported', s: 'todo', d: 'Export to ERP' },
    { t: 'General ledger reconciliation', s: 'warn', d: '3 differences open' },
    { t: 'Period closed', s: 'todo', d: 'Needs approval' }
  ],

  /* Regras contabilisticas com as contas do PCES (NR 9/2022-R). "20/22/23" = classe da afetacao do lote (20 Vida, 22 Nao Vida, 23 nao afetos);
     as subcontas finais confirmam-se com cada seguradora */
  regras: [
    { ev: 'Purchase', cl: 'Any', cart: 'Any', at: 'Debt securities', d: '20/22/23 · Títulos de dívida (conta da classificação)', c: '51 Depósitos à ordem' },
    { ev: 'Interest (EIR)', cl: 'CA / FVOCI', cart: 'Any', at: 'Debt securities', d: '20/22/23 · Títulos de dívida (juros e amortização do prémio ou desconto)', c: '74 Rendimentos de investimentos' },
    { ev: 'Coupon received', cl: 'Any', cart: 'Any', at: 'Debt securities', d: '51 Depósitos à ordem', c: '20/22/23 · Títulos de dívida (juros corridos)' },
    { ev: 'Fair value change', cl: 'FVOCI', cart: 'Any', at: 'Debt securities', d: '20/22/23 · Ativos ao justo valor através de reservas', c: '11 01 Reservas de reavaliação (dívida ao justo valor através de reservas)' },
    { ev: 'Fair value change', cl: 'FVTPL', cart: 'Any', at: 'Any', d: '20/22/23 · Ativos ao justo valor através de resultados', c: '75 Ganhos em investimentos (65 Perdas, se negativa)' },
    { ev: 'ECL charge', cl: 'FVOCI', cart: 'Any', at: 'Debt securities', d: '66 Perdas por imparidade', c: '11 2 Provisão para perdas de crédito previstas' },
    { ev: 'ECL charge', cl: 'CA', cart: 'Any', at: 'Debt securities', d: '66 Perdas por imparidade', c: '29 Imparidade acumulada (custo amortizado)' },
    { ev: 'ECL reversal', cl: 'CA / FVOCI', cart: 'Any', at: 'Debt securities', d: '29 / 11 2', c: '76 Reversão de perdas por imparidade' },
    { ev: 'Sale - reclassification adjustment', cl: 'FVOCI', cart: 'Any', at: 'Debt securities', d: '11 01 Reservas de reavaliação', c: '75 Ganhos em investimentos (65 Perdas)' },
    { ev: 'Sale - transfer within equity', cl: 'FVOCI-EQ', cart: 'Any', at: 'Equity', d: '11 08 Reservas de reavaliação (capital próprio)', c: '19 Resultados transitados' },
    { ev: 'Dividend', cl: 'Any', cart: 'Any', at: 'Equity', d: '51 Depósitos à ordem', c: '74 Rendimentos de investimentos' },
    { ev: 'Transfer between portfolios', cl: 'Any', cart: 'Different account class', at: 'Any', d: 'Classe da carteira de destino (20/21/22/23)', c: 'Classe da carteira de origem, pelo valor contabilizado' }
  ]
};
