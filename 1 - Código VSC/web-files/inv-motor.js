/* inv-motor.js - motor de calculo (especificacao, secao 10). Sem dependencias do ecra, para poder ser testado sozinho
   (node: require('./inv-motor.js')) e reutilizado no servidor.
   Nota: o mockup usa Number (virgula flutuante). A plataforma real usa decimal (secao 6 da especificacao). */
(function (raiz) {
  'use strict';
  var DIA = 86400000;
  function d(s) { var p = s.split('-'); return Date.UTC(+p[0], +p[1] - 1, +p[2]); }
  function iso(t) { return new Date(t).toISOString().slice(0, 10); }
  function dias(a, b) { return Math.round((d(b) - d(a)) / DIA); }
  function addMeses(s, n) {
    var x = new Date(d(s)), dia = x.getUTCDate();
    x.setUTCDate(1); x.setUTCMonth(x.getUTCMonth() + n);
    var fim = new Date(Date.UTC(x.getUTCFullYear(), x.getUTCMonth() + 1, 0)).getUTCDate();
    x.setUTCDate(Math.min(dia, fim)); return iso(x.getTime());
  }
  /* Tempo em anos: ACT/365 (depositos, vida residual) */
  function anos(a, b) { return dias(a, b) / 365; }
  /* Tempo para descontar na TJE (R-31): em periodos de cupao (ACT/ACT ICMA) a dividir pela frequencia,
     para que um ano bissexto nao altere a taxa de uma obrigacao com cupoes regulares */
  function posicao(ins, data) {
    var fl = fluxos(ins);
    for (var k = 0; k < fl.length; k++) if (data <= fl[k].data) return k + dias(fl[k].ini, data) / dias(fl[k].ini, fl[k].data);
    return fl.length + dias(fl[fl.length - 1].data, data) / 365 * ins.freq;
  }
  function tempo(ins, a, b) { return ins.tipo === 'obr' && ins.taxa ? (posicao(ins, b) - posicao(ins, a)) / ins.freq : anos(a, b); }

  /* Calendario de fluxos por unidade de nominal (6.4): datas de cupao para tras a partir do vencimento */
  function fluxos(ins) {
    if (ins.tipo === 'dep') return [{ data: ins.venc, cupao: ins.taxa * dias(ins.emissao, ins.venc) / 360, capital: 1, ini: ins.emissao }];
    if (ins.tipo !== 'obr') return [];
    if (!ins.taxa) return [{ data: ins.venc, cupao: 0, capital: 1, ini: ins.emissao }];
    var m = 12 / ins.freq, datas = [ins.venc], k = 1, x;
    while ((x = addMeses(ins.venc, -m * k)) > ins.emissao) { datas.unshift(x); k++; }
    return datas.map(function (dt, j) {
      return { data: dt, cupao: ins.taxa / ins.freq, capital: j === datas.length - 1 ? 1 : 0, ini: j ? datas[j - 1] : addMeses(dt, -m) };
    });
  }

  /* Juro corrido por unidade de nominal (10.1). ACT/ACT ICMA: cupao x dias decorridos / dias do periodo. ACT/360 para depositos */
  function juroCorrido(ins, data) {
    if (ins.tipo === 'dep') return data <= ins.emissao || data >= ins.venc ? 0 : ins.taxa * dias(ins.emissao, data) / 360;
    if (ins.tipo !== 'obr' || !ins.taxa) return 0;
    var f = fluxos(ins).filter(function (x) { return x.data > data; })[0];
    if (!f) return 0;
    return f.cupao * dias(f.ini, data) / dias(f.ini, f.data);
  }

  /* Valor presente dos fluxos futuros (estritamente depois de 'data') a taxa r */
  function vp(ins, data, r, q) {
    return fluxos(ins).filter(function (x) { return x.data > data; })
      .reduce(function (s, x) { return s + q * (x.cupao + x.capital) / Math.pow(1 + r, tempo(ins, data, x.data)); }, 0);
  }

  /* TJE (R-31): bisseccao entre -50% e 100%. O custo inclui o juro corrido pago (R-36) */
  function tje(ins, lote) {
    var custo = lote.q * (lote.p / 100 + juroCorrido(ins, lote.d)) + (lote.custos || 0);
    var lo = -0.5, hi = 1, m = 0;
    for (var k = 0; k < 200; k++) { m = (lo + hi) / 2; if (vp(ins, lote.d, m, lote.q) > custo) lo = m; else hi = m; }
    return m;
  }

  /* Rating: escala para notches e investment grade */
  var ESC = ['AAA', 'AA+', 'AA', 'AA-', 'A+', 'A', 'A-', 'BBB+', 'BBB', 'BBB-', 'BB+', 'BB', 'BB-', 'B+', 'B', 'B-', 'CCC'];
  function notch(r) { return ESC.indexOf(r); }
  function ig(r) { return notch(r) >= 0 && notch(r) <= notch('BBB-'); }

  /* Estagio (R-07): estagio 2 se perdeu investment grade desde a aquisicao ou desceu 3 ou mais notches; baixo risco de credito fica em 1 */
  function estagio(rtAq, rtHoje) {
    if (!rtAq || !rtHoje || notch(rtHoje) < 0) return 1;
    if (ig(rtAq) && !ig(rtHoje)) return 2;
    if (notch(rtHoje) - notch(rtAq) >= 3 && !ig(rtHoje)) return 2;
    return 1;
  }

  /* Posicao de um lote na data de referencia (6.8 e secao 10) */
  /* precos (opcional): { idInstrumento: preco } para avaliar noutra data (ex.: precos do fecho anterior) */
  function lote(INV, l, ref, precos) {
    var ins = INV.instrumentos.filter(function (x) { return x.id === l.i; })[0];
    var preco = precos && precos[ins.id] != null ? precos[ins.id] : ins.preco;
    var em = INV.emitentes[ins.em];
    var r = { lote: l, ins: ins, em: em, cart: l.c, cl: l.cl, q: l.q };
    var divida = ins.tipo === 'obr' || ins.tipo === 'dep';
    r.custoAq = divida ? l.q * l.p / 100 : l.q * l.p;
    if (divida) {
      r.tje = tje(ins, l);
      r.jc = l.q * juroCorrido(ins, ref);
      r.caSujo = vp(ins, ref, r.tje, l.q);
      r.ca = r.caSujo - r.jc;
      r.jv = l.q * preco / 100;
      /* ECL (R-06): EAD x PD x LGD. Estagio 2 usa PD para a vida residual */
      r.estagio = estagio(l.rt, em.rating);
      var pd = INV.pd12[em.rating] || 0, vida = Math.max(anos(ref, ins.venc), 0);
      r.pd = r.estagio === 1 ? pd * Math.min(1, vida) : 1 - Math.pow(1 - pd, vida);
      r.lgd = INV.lgd[em.tipo] || 0.6;
      r.ead = r.caSujo;
      r.ecl = r.ead * r.pd * r.lgd;
      r.ecl1 = r.ead * pd * Math.min(1, vida) * r.lgd;
    } else {
      r.ca = r.custoAq; r.jc = 0; r.jv = l.q * preco; r.ecl = 0;
    }
    if (l.cl === 'CA') { r.contab = r.ca - r.ecl; r.reserva = 0; }
    else if (l.cl === 'FVOCI') { r.contab = r.jv; r.reserva = r.jv - r.ca + r.ecl; }
    else if (l.cl === 'FVOCI-EQ') { r.contab = r.jv; r.reserva = r.jv - r.custoAq; }
    else { r.contab = r.jv; r.reserva = 0; }
    r.potencial = r.jv - (divida ? r.ca : r.custoAq);
    r.sii = r.jv + r.jc;
    return r;
  }

  function lotes(INV, ref, precos) { return INV.lotes.map(function (l) { return lote(INV, l, ref || INV.dataRef, precos); }); }

  var carteira = function (INV, id) { return INV.carteiras.filter(function (c) { return c.id === id; })[0] || {}; };

  /* Conta do PCES de cada lote: classe da carteira (20, 21, 22, 23) e subconta da classificacao (20 25 custo amortizado,
     20 23 justo valor atraves de reservas, 20 20 justo valor atraves de resultados, 20 13 partes de capital ao justo valor atraves de reservas) */
  var SUBCONTA = { CA: ['25', 'Ativos financeiros ao custo amortizado'], FVOCI: ['23', 'Ativos financeiros ao justo valor através de reservas'], 'FVOCI-EQ': ['23', 'Ativos financeiros ao justo valor através de reservas'], FVTPL: ['20', 'Ativos financeiros ao justo valor através de resultados'] };
  function contaDoLote(INV, r) {
    var k = carteira(INV, r.cart).classe || '23', sc = r.ins.tipo === 'part' ? ['13', 'Partes de capital ao justo valor através de reservas'] : SUBCONTA[r.cl];
    return { conta: k + ' ' + sc[0], descricao: sc[1] };
  }

  /* Impostos diferidos sobre a reserva de justo valor (conta 12 do PCES): reserva x taxa, com o sinal contrario */
  function impostoDiferido(reserva, taxa) { return -reserva * taxa; }

  /* Saldos do inventario por conta do PCES, para reconciliar com o balancete da contabilidade geral.
     Investimentos pelo valor contabilistico com juros corridos; reservas 11 01 (divida) e 11 08 (capital proprio); 12 impostos diferidos */
  function saldosPorConta(INV, ref, taxa, precos) {
    var saldos = {}, add = function (conta, descricao, v) { (saldos[conta] = saldos[conta] || { conta: conta, descricao: descricao, valor: 0 }).valor += v; };
    var resDiv = 0, resCap = 0;
    lotes(INV, ref, precos).forEach(function (r) {
      var c = contaDoLote(INV, r); add(c.conta, c.descricao, r.contab + r.jc);
      if (r.cl === 'FVOCI') resDiv += r.reserva; else if (r.cl === 'FVOCI-EQ') resCap += r.reserva;
    });
    add('11 01', 'Reservas de reavaliação - instrumentos de dívida', resDiv);
    add('11 08', 'Reservas de reavaliação - instrumentos de capital próprio', resCap);
    add('12', 'Reserva por impostos diferidos', impostoDiferido(resDiv + resCap, taxa));
    return Object.keys(saldos).sort().map(function (k) { return saldos[k]; });
  }

  /* Vendas de carteiras com modelo "deter para recolher" nos ultimos 12 meses, face ao valor da carteira */
  function vendasDeterRecolher(INV, ref) {
    var desde = addMeses(ref, -12), ls = lotes(INV, ref);
    return INV.carteiras.filter(function (c) { return /Hold to collect\)/.test(c.modelo); }).map(function (c) {
      var vendas = (INV.operacoes || []).filter(function (o) { return o.tipo === 'Sale' && o.c === c.id && o.estado === 'Approved' && o.neg > desde && o.neg <= ref; });
      var valorVendas = vendas.reduce(function (s, o) { return s + (o.valor || 0) - (o.jc || 0); }, 0);
      var valorCarteira = ls.filter(function (r) { return r.cart === c.id; }).reduce(function (s, r) { return s + r.contab; }, 0) + valorVendas;
      return { carteira: c, vendas: vendas, numero: vendas.length, valor: valorVendas, peso: valorCarteira ? valorVendas / valorCarteira : 0 };
    });
  }

  /* Mapa de movimentos do periodo (ant, ref] por carteira: saldo inicial + movimentos = saldo final, pelo valor contabilistico
     com juros corridos. Precos: precosAnt no inicio, precos atuais no fim e nas datas intermedias (transferencias, compras, vendas).
     Linhas: inicial, compras, vendas, juro TJE, cupoes e reembolsos recebidos, transferencias, imparidade (custo amortizado),
     variacao de justo valor e outros, final */
  function mapaMovimentos(INV, ant, ref, precosAnt) {
    var linhas = ['inicial', 'compras', 'vendas', 'juro', 'fluxos', 'transfEntrada', 'transfSaida', 'imparidade', 'justoValor', 'final'];
    var m = {}, ops = (INV.operacoes || []).filter(function (o) { return o.estado === 'Approved' && o.neg > ant && o.neg <= ref; });
    var afs = (INV.afetacoes || []).filter(function (a) { return a.estado === 'Approved' && a.de !== '-' && a.data > ant && a.data <= ref; });
    var col = function (c) { return m[c] = m[c] || linhas.reduce(function (o, k) { o[k] = 0; return o; }, {}); };
    var valor = function (l, q, data, precos) { var r = lote(INV, Object.assign({}, l, { q: q }), data, precos); return { v: r.contab + r.jc, r: r }; };
    /* Um troco do lote: quantidade q na carteira c entre a e b; abre e fecha pelo valor contabilistico e reparte a variacao */
    var troco = function (l, q, c, a, b, pa, pb, abre, fecha) {
      var A = valor(l, q, a, pa), B = valor(l, q, b, pb), x = col(c), juro = 0, fl = 0, imp = 0;
      if (A.r.tje != null) {
        fluxos(A.r.ins).forEach(function (f) { if (f.data > a && f.data <= b) fl += q * (f.cupao + f.capital); });
        juro = B.r.caSujo - A.r.caSujo + fl;
        if (l.cl === 'CA') imp = -(B.r.ecl - A.r.ecl);
      }
      x[abre] += A.v; x.juro += juro; x.fluxos -= fl; x.imparidade += imp;
      x.justoValor += (B.v - A.v) - juro + fl - imp;
      x[fecha] -= (fecha === 'final' ? -B.v : B.v);
    };
    INV.lotes.forEach(function (l) {
      var compra = ops.filter(function (o) { return o.tipo === 'Purchase' && o.i === l.i && o.c === l.c; })[0];
      var venda = ops.filter(function (o) { return o.tipo === 'Sale' && o.i === l.i && o.c === l.c; })[0];
      var af = afs.filter(function (a) { return a.lote === l.id && a.q >= l.q; })[0];
      var qNova = compra ? compra.q : 0, qIni = l.q - qNova;
      if (l.d > ant) { qIni = 0; qNova = l.q; }
      if (qIni > 0) {
        if (af) { troco(l, qIni, af.de, ant, af.data, precosAnt, null, 'inicial', 'transfSaida'); troco(l, qIni, af.para, af.data, ref, null, null, 'transfEntrada', 'final'); }
        else troco(l, qIni, l.c, ant, ref, precosAnt, null, 'inicial', 'final');
      }
      if (qNova > 0) troco(l, qNova, l.c, compra ? compra.liq : l.d, ref, null, null, 'compras', 'final');
      if (venda) troco(l, venda.q, l.c, ant, venda.liq, precosAnt, null, 'inicial', 'vendas');
    });
    return { linhas: linhas, carteiras: m };
  }


  /* Detalhe do calculo (P8): passos com datas e taxas */
  function explicar(INV, l, ref) {
    var r = lote(INV, l, ref), ins = r.ins, passos = [];
    if (r.tje == null) return { r: r, passos: [['Valuation', 'Quantity ' + l.q + ' × price ' + ins.preco + ' = fair value']], fluxos: [] };
    var jcAq = l.q * juroCorrido(ins, l.d);
    passos.push(['Acquisition cost', 'Nominal × clean price + accrued interest paid', l.q * l.p / 100 + jcAq]);
    passos.push(['Accrued interest paid at purchase', ins.base + ' on ' + l.d, jcAq]);
    passos.push(['Effective interest rate', 'Rate that discounts the contractual cash flows to the acquisition cost (time in coupon periods)', r.tje, 'pct']);
    passos.push(['Amortised cost (dirty) at ' + ref, 'Remaining cash flows discounted at the EIR', r.caSujo]);
    passos.push(['Accrued interest at ' + ref, ins.base, r.jc]);
    passos.push(['Amortised cost (clean)', 'Dirty − accrued interest', r.ca]);
    passos.push(['Fair value (clean)', 'Nominal × ' + ins.preco + '% (' + ins.fonte + ', level ' + ins.nivel + ')', r.jv]);
    passos.push(['ECL', 'EAD × PD × LGD = ' + Math.round(r.ead) + ' × ' + (r.pd * 100).toFixed(4) + '% × ' + (r.lgd * 100) + '% · stage ' + r.estagio, r.ecl]);
    if (l.cl === 'FVOCI') passos.push(['Fair value reserve (account 11)', 'Fair value − amortised cost + ECL', r.reserva]);
    var fl = fluxos(ins).filter(function (x) { return x.data > ref; }).map(function (x) {
      var v = l.q * (x.cupao + x.capital), t = tempo(ins, ref, x.data);
      return { data: x.data, cupao: l.q * x.cupao, capital: l.q * x.capital, t: t, fd: 1 / Math.pow(1 + r.tje, t), vp: v / Math.pow(1 + r.tje, t) };
    });
    return { r: r, passos: passos, fluxos: fl };
  }

  /* Transferencia entre carteiras pelo valor contabilizado (R-53, NR 9/2022-R ponto 5 n.º 2): quantia escriturada mais juros corridos */
  function valorTransferencia(INV, l, data, q) {
    var r = lote(INV, l, data), f = (q == null ? l.q : q) / l.q;
    return { valor: (r.contab + r.jc) * f, reserva: r.reserva * f };
  }

  /* Reserva de justo valor por carteira (R-55, NR 9/2022-R ponto 5 n.os 5 a 7). movimentos = [{ carteira, ajustamento }] pela ordem em que
     o lote passou pelas carteiras. Cada carteira fica com os ajustamentos reconhecidos enquanto teve o ativo; na venda, o ajustamento de
     reclassificacao para resultados reparte-se pelo mesmo montante */
  function repartirReserva(movimentos) {
    var porCarteira = {}, total = 0;
    movimentos.forEach(function (m) { porCarteira[m.carteira] = (porCarteira[m.carteira] || 0) + m.ajustamento; total += m.ajustamento; });
    return { total: total, porCarteira: porCarteira };
  }

  var M = { contaDoLote: contaDoLote, impostoDiferido: impostoDiferido, saldosPorConta: saldosPorConta, vendasDeterRecolher: vendasDeterRecolher, mapaMovimentos: mapaMovimentos, valorTransferencia: valorTransferencia, repartirReserva: repartirReserva, d: d, iso: iso, dias: dias, addMeses: addMeses, fluxos: fluxos, juroCorrido: juroCorrido, tje: tje, vp: vp, estagio: estagio, ig: ig, lote: lote, lotes: lotes, explicar: explicar };
  if (typeof module !== 'undefined' && module.exports) module.exports = M; else raiz.MOTOR = M;
})(this);
