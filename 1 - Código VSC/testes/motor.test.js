/* Cenarios de aceitacao da secao 24 da especificacao, contra o motor de calculo. Correr: node testes/motor.test.js */
const M = require('../web-files/inv-motor.js');
const INV = { instrumentos: [], emitentes: { X: { tipo: 'Soberano', rating: 'A' } }, pd12: { A: 0.0005 }, lgd: { Soberano: 0.45 } };
let falhas = 0;
const perto = (nome, v, esperado, tol = 0.005) => { const ok = Math.abs(v - esperado) <= tol; if (!ok) falhas++; console.log((ok ? 'ok   ' : 'FALHA') + ' ' + nome + ': ' + v.toFixed(6) + (ok ? '' : ' (esperado ' + esperado + ')')); };

const obr = { id: 'T1', tipo: 'obr', em: 'X', taxa: 0.03, freq: 1, base: 'ACT/ACT ICMA', emissao: '2026-01-01', venc: '2029-01-01', preco: 99 };
INV.instrumentos.push(obr);
const l1 = { id: 'C01', i: 'T1', c: 'A', d: '2026-01-01', q: 1000000, p: 97.224909, cl: 'CA', rt: 'A' };

// C-01 custo amortizado com desconto
perto('C-01 TJE', M.tje(obr, l1), 0.04, 0.0000005);
perto('C-01 custo amortizado 2027-01-01', M.lote(INV, l1, '2027-01-01').ca, 981139.05, 0.05);
perto('C-01 custo amortizado 2028-01-01', M.lote(INV, l1, '2028-01-01').ca, 990384.62, 0.05);
perto('C-01 custo amortizado apos o vencimento', M.lote(INV, l1, '2029-01-01').ca, 0, 0.01);

// C-02 juro corrido ACT/ACT ICMA
perto('C-02 juro corrido 2026-07-02', 1000000 * M.juroCorrido(obr, '2026-07-02'), 14958.90, 0.005);

// C-05 FVOCI: reserva = justo valor - custo amortizado + ECL
const l5 = Object.assign({}, l1, { cl: 'FVOCI' });
const r5 = M.lote(INV, l5, '2027-01-01');
perto('C-05 reserva (sem o ECL)', r5.reserva - r5.ecl, 990000 - 981139.05, 0.05);
perto('C-05 valor de balanco = justo valor', r5.contab, 990000, 0.001);

// Estagios (R-07)
const ok = (nome, cond) => { if (!cond) falhas++; console.log((cond ? 'ok   ' : 'FALHA') + ' ' + nome); };
ok('Estagio 2 ao perder investment grade (BBB -> BB+)', M.estagio('BBB', 'BB+') === 2);
ok('Estagio 1 com baixo risco de credito (A -> BBB)', M.estagio('A', 'BBB') === 1);

// C-11 repartição da reserva entre carteiras (R-55): +30 000 na carteira A até à transferência, −5 000 depois em B
const rep = M.repartirReserva([{ carteira: 'A', ajustamento: 30000 }, { carteira: 'B', ajustamento: -5000 }]);
perto('C-11 ajustamento de reclassificação total', rep.total, 25000, 0.001);
perto('C-11 parte da carteira A', rep.porCarteira.A, 30000, 0.001);
perto('C-11 parte da carteira B', rep.porCarteira.B, -5000, 0.001);

// R-53 transferência pelo valor contabilizado (quantia escriturada + juros corridos), sem ganho nem perda
const t53 = M.valorTransferencia(INV, l5, '2026-07-02', 300000), r53 = M.lote(INV, l5, '2026-07-02');
perto('R-53 valor de transferência de 300 000 = 30% do valor contabilizado', t53.valor, 0.3 * (r53.contab + r53.jc), 0.001);

// C-12 impostos diferidos sobre a reserva de justo valor: reserva 10 060,95 a 22,5% = −2 263,71
perto('C-12 impostos diferidos', M.impostoDiferido(10060.95, 0.225), -2263.71, 0.005);

// C-13 e C-14 com os dados de demonstração
const vm = require('vm'), fs = require('fs'), path = require('path');
const cx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../supabase/dados-demonstracao.js'), 'utf8'), cx);
const D = cx.window.INV, ant = D.param.data_anterior;
const mm = M.mapaMovimentos(D, ant, D.dataRef, D.param.precos_anteriores);
const linhas = mm.linhas.filter((l) => l !== 'final');
let fim = 0;
Object.keys(mm.carteiras).forEach((c) => { const x = mm.carteiras[c]; perto('C-13 mapa de movimentos fecha · ' + c, linhas.reduce((s, l) => s + x[l], 0) - x.final, 0, 0.001); fim += x.final; });
const inventario = M.lotes(D, D.dataRef).reduce((s, r) => s + r.contab + r.jc, 0);
perto('C-13 saldo final do mapa = inventário', fim - inventario, 0, 0.001);
perto('C-13 transferências: entradas = saídas', Object.values(mm.carteiras).reduce((s, x) => s + x.transfEntrada + x.transfSaida, 0), 0, 0.001);
const inicial = Object.values(mm.carteiras).reduce((s, x) => s + x.inicial, 0);
perto('C-13 saldo inicial', inicial, 65933763.82, 0.01);
const sc = M.saldosPorConta(D, D.dataRef, 0.225), soma = sc.filter((x) => /^2/.test(x.conta)).reduce((s, x) => s + x.valor, 0);
perto('C-13 contas 20/22/23 = inventário', soma - inventario, 0, 0.001);
const v = M.vendasDeterRecolher(D, D.dataRef)[0];
perto('C-14 vendas da carteira Não Vida em 12 meses', v.valor, 990500, 0.01);
ok('C-14 peso das vendas acima do alerta de 5% e abaixo do máximo de 10%', v.peso > 0.05 && v.peso < 0.10);

console.log(falhas ? falhas + ' falha(s)' : 'Todos os cenarios passam');
process.exit(falhas ? 1 : 0);
