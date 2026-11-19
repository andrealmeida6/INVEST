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

// C-05 JVORI: reserva = justo valor - custo amortizado + ECL
const l5 = Object.assign({}, l1, { cl: 'JVORI' });
const r5 = M.lote(INV, l5, '2027-01-01');
perto('C-05 reserva (sem o ECL)', r5.reserva - r5.ecl, 990000 - 981139.05, 0.05);
perto('C-05 valor de balanco = justo valor', r5.contab, 990000, 0.001);

// Estagios (R-07)
const ok = (nome, cond) => { if (!cond) falhas++; console.log((cond ? 'ok   ' : 'FALHA') + ' ' + nome); };
ok('Estagio 2 ao perder investment grade (BBB -> BB+)', M.estagio('BBB', 'BB+') === 2);
ok('Estagio 1 com baixo risco de credito (A -> BBB)', M.estagio('A', 'BBB') === 1);

console.log(falhas ? falhas + ' falha(s)' : 'Todos os cenarios passam');
process.exit(falhas ? 1 : 0);
