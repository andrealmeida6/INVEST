/* inv-paginas.js - blocos dinamicos de cada pagina (web template 'bloco-dinamico', id = nome do bloco).
   Usa INV (carregado do Supabase por inv-acesso.js), MOTOR (inv-motor.js) e APP (inv-app.js).
   APP.preparar() recalcula tudo sempre que os dados chegam ou mudam. */
(function () {
  'use strict';
  var e = APP.e, eur = APP.eur, B = APP.blocos, A = APP.acoes;
  var USER, REF, L, TOT;
  var cart = function (id) { return INV.carteiras.filter(function (c) { return c.id === id; })[0] || { nome: id }; };
  var insP = function (id) { return INV.instrumentos.filter(function (x) { return x.id === id; })[0]; };
  var soma = function (arr, k) { return arr.reduce(function (s, x) { return s + (typeof k === 'function' ? k(x) : x[k]) || 0; }, 0); };
  var TIPO = { obr: 'Bond', acao: 'Listed equity', part: 'Unlisted participation', fundo: 'Investment fund', dep: 'Term deposit' };
  var divida = function (i) { return i.tipo === 'obr' || i.tipo === 'dep'; };
  var qtd = function (i, q) { return divida(i) ? eur(q) : APP.int(q) + ' units'; };
  var link = function (i) { return '<a href="/instrumento/?id=' + i.id + '">' + e(i.nome) + '</a><span class="ps-mut ps-small ps-mono" style="display:block">' + e(i.isin || i.codigo) + '</span>'; };
  var porCart = function (id) { return L.filter(function (r) { return r.cart === id; }); };

  /* ---------------- Inicio ---------------- */
  B['inicio-estado'] = function () {
    var ola = document.querySelector('[data-campo="hero-ola"]'); if (ola) ola.textContent = 'Good morning, ' + USER;
    var cores = { VIDA: 'a', NVIDA: 'c', PPR: 'v', LIVRES: 'f' };
    var afeto = soma(L.filter(function (r) { return cart(r.cart).afeto; }), 'sii');
    return '<div class="ps-est-c"><div class="ps-est-t"><div><span class="ps-est-l">Portfolio at ' + APP.dt(REF) + ' · Solvency II value</span><div class="ps-est-v">' + APP.mi(TOT) + '<small>' + APP.pct(afeto / TOT, 0) + ' allocated</small></div></div>' +
      '<a class="ps-gk-cta" href="/carteiras/">Open portfolios →</a></div>' +
      '<div class="ps-est-bar">' + INV.carteiras.map(function (c) { return '<i class="' + cores[c.id] + '" style="width:' + (soma(porCart(c.id), 'sii') / TOT * 100).toFixed(2) + '%"></i>'; }).join('') + '</div>' +
      '<div class="ps-est-n iv-est-4">' + INV.carteiras.map(function (c) {
        var v = soma(porCart(c.id), 'sii');
        return '<a class="ps-est-i" href="/carteiras/" style="text-decoration:none"><span><i class="' + cores[c.id] + '" style="display:inline-block;margin-right:6px"></i>' + e(c.id === 'LIVRES' ? 'Livres' : c.nome) + '</span><b>' + APP.mi(v) + '</b>' + (c.pt ? '<span>Coverage ' + APP.pct(v / c.pt, 0) + '</span>' : '<span>Not allocated</span>') + '</a>';
      }).join('') + '</div>' +
      '<span class="ps-est-s">Book value ' + APP.mi(soma(L, 'contab')) + ' · fair value ' + APP.mi(soma(L, 'jv')) + ' · ' + L.length + ' lots in ' + INV.instrumentos.length + ' instruments</span></div>';
  };

  B['inicio-fecho'] = function () {
    var ic = { ok: '✓', warn: '!', todo: '·' };
    var feitos = INV.fecho.filter(function (x) { return x.s === 'ok'; }).length;
    return APP.card('<span class="ps-row-ico" style="width:30px;height:30px">✓</span>Close ' + e(INV.periodo), '<div class="ps-list">' + INV.fecho.map(function (f, n) {
      return '<a class="ps-row" href="/contabilidade/"><span class="ps-row-ico ' + (f.s === 'warn' ? 'warn' : '') + '">' + (f.s === 'ok' ? ic.ok : f.s === 'warn' ? ic.warn : n + 1) + '</span><span class="ps-row-txt"><b>' + e(f.t) + '</b><span>' + e(f.d) + '</span></span>' + APP.estado(f.s === 'ok' ? 'Done' : f.s === 'warn' ? 'Open' : 'To do') + '</a>';
    }).join('') + '</div>', '<span class="ps-chip info semponto">' + feitos + ' of ' + INV.fecho.length + ' done</span><a class="ps-btn pri peq" href="/contabilidade/">Open close</a>');
  };

  B['inicio-alertas'] = function () {
    var itens = [
      ['rev', INV.aprovacoes.length + ' items waiting for approval', 'Transactions, reallocations, manual prices, stage changes', '/aprovacoes/'],
      ['err', 'Limit breach: rating below BBB-', 'Energia C 2,25% 2032 downgraded to BB+ · justified, owner Rui Matos', '/limites/'],
      ['warn', 'Price exception', 'Energia C 2,25% 2032: daily change −4,1% (tolerance 3%)', '/valorizacoes/'],
      ['warn', 'Stage 2 proposed', 'Energia C 2,25% 2032 lost investment grade: lifetime ECL', '/imparidade/']
    ];
    return APP.card('Needs attention', '<div class="ps-list">' + itens.map(function (x) {
      return '<a class="ps-row" href="' + x[3] + '"><span class="ps-row-ico ' + (x[0] === 'rev' ? '' : x[0]) + '">!</span><span class="ps-row-txt"><b>' + e(x[1]) + '</b><span>' + e(x[2]) + '</span></span><span class="ps-row-cta">Open</span></a>';
    }).join('') + '</div>');
  };

  function proximosFluxos(de, ate) {
    var out = [];
    L.forEach(function (r) {
      MOTOR.fluxos(r.ins).forEach(function (f) {
        if (f.data > de && f.data <= ate) out.push({ data: f.data, r: r, cupao: r.q * f.cupao, capital: r.q * f.capital });
      });
    });
    return out.sort(function (a, b) { return a.data < b.data ? -1 : 1; });
  }
  B['inicio-fluxos'] = function () {
    var fl = proximosFluxos(REF, MOTOR.addMeses(REF, 6));
    return '<section class="ps-card iv-cal ps-fundo-marca"><div class="ps-card-head"><h2>Cash-flow calendar</h2><span class="ps-small">Next 6 months</span></div><div class="ps-card-body"><ul class="iv-flx">' + fl.map(function (f) {
      return '<li><span class="iv-flx-d"><b>' + f.data.slice(8) + '</b>' + ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][+f.data.slice(5, 7) - 1] + '</span><span class="iv-flx-t"><b>' + e(f.r.ins.nome) + '</b><small>' + e(cart(f.r.cart).nome) + ' · ' + (f.capital ? 'Coupon + redemption' : 'Coupon') + '</small></span><span class="iv-flx-v">' + eur(f.cupao + f.capital) + '</span></li>';
    }).join('') + '</ul><p class="ps-small iv-flx-n">Proposed automatically from the schedule and confirmed against the custodian (R-28).</p></div></section>';
  };

  /* ---------------- Instrumentos ---------------- */
  var fI = { txt: '', tipo: '' };
  function linhasInstr() {
    return INV.instrumentos.filter(function (i) {
      return (!fI.tipo || i.tipo === fI.tipo) && (!fI.txt || (i.nome + ' ' + i.isin + ' ' + (i.codigo || '') + ' ' + INV.emitentes[i.em].nome + ' ' + i.cic).toLowerCase().indexOf(fI.txt.toLowerCase()) >= 0);
    });
  }
  function tabInstr() {
    return APP.tabela([
      { t: 'Instrument', k: link },
      { t: 'Type', k: function (i) { return e(TIPO[i.tipo]); } },
      { t: 'Issuer', k: function (i) { var m = INV.emitentes[i.em]; return e(m.nome) + '<span class="ps-mut ps-small" style="display:block">' + e(m.tipo) + ' · ' + e(m.pais) + '</span>'; } },
      { t: 'CIC', k: function (i) { return '<span class="ps-mono">' + e(i.cic) + '</span>'; } },
      { t: 'Coupon', k: function (i) { return i.taxa != null ? APP.pct(i.taxa, i.taxa ? 3 : 0) + (i.freq === 2 ? ' semi' : '') : '-'; } },
      { t: 'Maturity', k: function (i) { return APP.dt(i.venc); } },
      { t: 'Rating', k: function (i) { return e(INV.emitentes[i.em].rating); } },
      { t: 'Held', dir: 1, k: function (i) { return qtd(i, soma(L.filter(function (r) { return r.ins === i; }), 'q')); } },
      { t: 'Fair value', dir: 1, k: function (i) { return eur(soma(L.filter(function (r) { return r.ins === i; }), 'jv')); } },
      { t: 'Level', k: function (i) { return APP.chip('L' + i.nivel, i.nivel === 3 ? 'warn' : i.nivel === 2 ? 'info' : 'ok'); } }
    ], linhasInstr());
  }
  B['instrumentos'] = function () {
    return '<div class="ps-filtros"><label class="ps-campo" style="flex:1"><span class="ps-lab">Search</span><input class="ps-in" data-on="fInstrTxt" placeholder="Name, ISIN, issuer, CIC…" value="' + e(fI.txt) + '"></label>' +
      '<label class="ps-campo"><span class="ps-lab">Type</span><select class="ps-sel" data-on="fInstrTipo"><option value="">All types</option>' + Object.keys(TIPO).map(function (k) { return '<option value="' + k + '"' + (fI.tipo === k ? ' selected' : '') + '>' + TIPO[k] + '</option>'; }).join('') + '</select></label>' +
      '<button class="ps-btn pri" data-a="novoInstr">New instrument</button><button class="ps-btn" data-a="importar" data-v="Instruments">Import file</button></div>' +
      '<section class="ps-card"><div class="ps-card-body" data-lista-instr>' + tabInstr() + '</div></section>';
  };
  A.fInstrTxt = function (v) { fI.txt = v; document.querySelector('[data-lista-instr]').innerHTML = tabInstr(); };
  A.fInstrTipo = function (v) { fI.tipo = v; document.querySelector('[data-lista-instr]').innerHTML = tabInstr(); };
  A.novoInstr = function () {
    APP.painel('New instrument', '<p class="ps-mut">One register for every portfolio and entity (R-20). Typing an ISIN that already exists opens that instrument instead.</p>' +
      '<div class="ps-form2"><label class="ps-campo"><span class="ps-lab">ISIN</span><input class="ps-in" data-on="isinDup" placeholder="PT00…"></label><label class="ps-campo"><span class="ps-lab">Type</span><select class="ps-sel">' + Object.keys(TIPO).map(function (k) { return '<option>' + TIPO[k] + '</option>'; }).join('') + '</select></label>' +
      '<label class="ps-campo"><span class="ps-lab">Name</span><input class="ps-in"></label><label class="ps-campo"><span class="ps-lab">Issuer</span><select class="ps-sel">' + Object.keys(INV.emitentes).map(function (k) { return '<option>' + e(INV.emitentes[k].nome) + '</option>'; }).join('') + '</select></label>' +
      '<label class="ps-campo"><span class="ps-lab">Coupon rate</span><input class="ps-in" placeholder="0,000%"></label><label class="ps-campo"><span class="ps-lab">Frequency</span><select class="ps-sel"><option>Annual</option><option>Semi-annual</option><option>Quarterly</option><option>Zero coupon</option></select></label>' +
      '<label class="ps-campo"><span class="ps-lab">Day count</span><select class="ps-sel"><option>ACT/ACT ICMA</option><option>ACT/360</option><option>ACT/365 Fixed</option><option>30/360</option><option>30E/360</option></select></label><label class="ps-campo"><span class="ps-lab">Maturity</span><input class="ps-in" type="date"></label>' +
      '<label class="ps-campo"><span class="ps-lab">SPPI test</span><select class="ps-sel"><option>Pass</option><option>Fail</option><option>Not assessed</option></select></label><label class="ps-campo"><span class="ps-lab">Price source</span><select class="ps-sel"><option>Fecho de mercado</option><option>Contribuidor</option><option>Manual</option></select></label></div>' +
      '<p class="ps-small" data-dup></p><div class="ps-sp"><button class="ps-btn pri" data-a="ok" data-v="Instrument submitted for approval">Submit for approval</button></div>');
  };
  A.isinDup = function (v) {
    var i = INV.instrumentos.filter(function (x) { return x.isin && x.isin.toUpperCase() === v.trim().toUpperCase(); })[0];
    document.querySelector('[data-dup]').innerHTML = i ? '<span class="ps-txt-err">This ISIN already exists: <a href="/instrumento/?id=' + i.id + '">' + e(i.nome) + '</a></span>' : '';
  };
  A.ok = function (msg) { APP.fecharPan(); APP.aviso(msg, 'ok'); };
  A.importar = function (tipo) {
    APP.painel('Import file · ' + e(tipo), '<p class="ps-mut">Validation order: format → mandatory columns → types and lists → references (ISIN, portfolio, issuer) → business rules → preview with errors by row → submit for approval (section 17).</p>' +
      '<div class="ps-fic"><b>Drop a CSV or Excel file</b><span class="ps-mut ps-small">or download the template first</span></div><div class="ps-sp"><button class="ps-btn" data-a="ok" data-v="Template downloaded">Download template</button></div>');
  };

  /* ---------------- Instrumento ---------------- */
  var abaI = 'dados';
  B['instrumento'] = function () {
    var i = insP(APP.q.id) || INV.instrumentos[0], m = INV.emitentes[i.em], ls = L.filter(function (r) { return r.ins === i; });
    var abas = [['dados', 'Data'], ['fluxos', 'Cash flows'], ['posicoes', 'Positions & lots'], ['precos', 'Prices'], ['hist', 'History']];
    var corpo;
    if (abaI === 'dados') {
      var campos = [['ISIN / code', i.isin || i.codigo], ['Type', TIPO[i.tipo]], ['CIC', i.cic], ['Issuer', m.nome], ['Issuer type', m.tipo], ['Country', m.pais], ['NACE', m.nace], ['Issuer group', m.grupo || '-'], ['Currency', 'EUR'], ['Issue date', APP.dt(i.emissao)], ['Maturity', APP.dt(i.venc)], ['Unit nominal', i.nom ? '1,00' : '-'],
        ['Coupon', i.taxa != null ? APP.pct(i.taxa, 3) : '-'], ['Frequency', i.freq ? (i.freq === 1 ? 'Annual' : 'Semi-annual') : '-'], ['Day count', i.base || '-'], ['Rating', m.rating + (m.ratingAnt ? ' (was ' + m.ratingAnt + ')' : '')], ['SPPI test', i.sppi || 'n/a (equity)'], ['Price source', i.fonte], ['IFRS 13 level', 'Level ' + i.nivel], ['Status', 'Active']];
      if (i.tipo === 'part') campos.push(['Relationship', i.relacao], ['Participation', APP.pct(i.pct, 0)]);
      corpo = '<dl class="iv-dl">' + campos.map(function (c) { return '<div><dt>' + e(c[0]) + '</dt><dd>' + e(c[1]) + '</dd></div>'; }).join('') + '</dl>';
    } else if (abaI === 'fluxos') {
      var fl = MOTOR.fluxos(i), q = soma(ls, 'q');
      corpo = fl.length ? APP.tabela([
        { t: 'Date', k: function (f) { return APP.dt(f.data); } },
        { t: 'Type', k: function (f) { return f.capital ? 'Coupon + redemption' : 'Coupon'; } },
        { t: 'Rate per 100', dir: 1, k: function (f) { return (f.cupao * 100).toFixed(4).replace('.', ','); } },
        { t: 'Amount (held)', dir: 1, k: function (f) { return eur(q * (f.cupao + f.capital)); } },
        { t: 'Status', k: function (f) { return f.data <= REF ? APP.chip('Paid', 'ok') : APP.chip('Expected', 'info'); } }
      ], fl) : '<p class="ps-mut">No contractual cash flows: income comes from dividends or distributions.</p>';
    } else if (abaI === 'posicoes') {
      corpo = tabLotes(ls, true);
    } else if (abaI === 'precos') {
      corpo = APP.tabela([{ t: 'Date', k: function (p) { return APP.dt(p[0]); } }, { t: 'Price', dir: 1, k: function (p) { return String(p[1]).replace('.', ','); } }, { t: 'Source', k: function (p) { return e(p[2]); } }, { t: 'Status', k: function (p) { return p[3]; } }],
        [[REF, i.preco, i.fonte, i.manual ? APP.chip('Manual · pending approval', 'rev') : i.excecao ? APP.chip('Exception', 'warn') : APP.chip('Validated', 'ok')], [MOTOR.addMeses(REF, -1), +(i.preco * (i.excecao ? 1.043 : 0.996)).toFixed(3), i.fonte, APP.chip('Closed', '')], [MOTOR.addMeses(REF, -2), +(i.preco * 0.991).toFixed(3), i.fonte, APP.chip('Closed', '')]]);
    } else {
      corpo = APP.tabela([{ t: 'When', k: function (h) { return APP.dt(h[0]); } }, { t: 'Who', k: function (h) { return e(h[1]); } }, { t: 'Change', k: function (h) { return e(h[2]); } }],
        [['2026-10-14 09:12', 'Sistema', 'Rating ' + (m.ratingAnt || m.rating) + ' → ' + m.rating + ' (import)'], [i.emissao + ' 10:00', 'Ana Ramos', 'Instrument created'], [i.emissao + ' 15:20', 'Pedro Lima', 'Approved']]);
    }
    return '<p><a class="ps-btn liga" href="/instrumentos/">← All instruments</a></p><div class="ps-sp-b"><div><h2 class="iv-h2">' + e(i.nome) + '</h2><div class="ps-sp ps-mt"><span class="ps-mono">' + e(i.isin || i.codigo) + '</span>' + APP.chip(TIPO[i.tipo], 'info') + APP.chip('Level ' + i.nivel, i.nivel === 3 ? 'warn' : '') + (i.excecao ? APP.chip(i.excecao, 'warn') : '') + '</div></div></div>' +
      '<div class="ps-kpis iv-kpis">' + APP.kpi('Held', qtd(i, soma(ls, 'q')), ls.length + ' lot(s) in ' + ls.map(function (r) { return r.cart; }).filter(function (v, n, a) { return a.indexOf(v) === n; }).length + ' portfolio(s)') + APP.kpi('Book value', eur(soma(ls, 'contab'))) + APP.kpi('Fair value', eur(soma(ls, 'jv')), 'Price ' + String(i.preco).replace('.', ',')) + APP.kpi('Accrued interest', eur(soma(ls, 'jc'))) + '</div>' +
      '<div class="ps-seg iv-abas">' + abas.map(function (a) { return '<button type="button" class="' + (a[0] === abaI ? 'on' : '') + '" data-a="abaI" data-v="' + a[0] + '">' + a[1] + '</button>'; }).join('') + '</div>' +
      '<section class="ps-card"><div class="ps-card-body">' + corpo + '</div></section>';
  };
  A.abaI = function (v) { abaI = v; APP.render(); };

  function tabLotes(ls, comCart) {
    return APP.tabela([
      { t: 'Lot', k: function (r) { return '<b class="ps-mono">' + r.lote.id + '</b><span class="ps-mut ps-small" style="display:block">' + APP.dt(r.lote.d) + ' @ ' + String(r.lote.p).replace('.', ',') + '</span>'; } },
      { t: 'Portfolio', k: function (r) { return e(cart(r.cart).nome); } },
      { t: 'Class', k: function (r) { return APP.clChip(r.cl); } },
      { t: 'Nominal / qty', dir: 1, k: function (r) { return qtd(r.ins, r.q); } },
      { t: 'EIR', dir: 1, k: function (r) { return r.tje != null ? APP.pct(r.tje, 4) : '-'; } },
      { t: 'Amortised cost', dir: 1, k: function (r) { return eur(r.ca); } },
      { t: 'Fair value', dir: 1, k: function (r) { return eur(r.jv); } },
      { t: 'Book value', dir: 1, k: function (r) { return eur(r.contab); } },
      { t: '', k: function (r) { return '<button class="ps-btn peq" data-a="calc" data-v="' + r.lote.id + '">Calculation</button>'; } }
    ], ls);
  }

  /* Detalhe do calculo (P8) */
  A.calc = function (id) {
    var l = INV.lotes.filter(function (x) { return x.id === id; })[0], x = MOTOR.explicar(INV, l, REF);
    APP.painel('Calculation · ' + e(x.r.ins.nome) + ' · ' + id, '<p class="ps-mut">Every figure is recalculated from the lot, the cash-flow schedule and the price at ' + APP.dt(REF) + '. The same steps are used by the period close and exported to the auditor.</p>' +
      '<table class="ps-t iv-calc"><tbody>' + x.passos.map(function (p) { return '<tr><td><b>' + e(p[0]) + '</b><span class="ps-mut ps-small" style="display:block">' + e(p[1]) + '</span></td><td class="dir ps-num">' + (p[3] === 'pct' ? APP.pct(p[2], 6) : p[2] == null ? '' : eur(p[2])) + '</td></tr>'; }).join('') + '</tbody></table>' +
      (x.fluxos.length ? '<h3 class="iv-h3">Remaining cash flows discounted at the EIR</h3>' + APP.tabela([
        { t: 'Date', k: function (f) { return APP.dt(f.data); } }, { t: 'Coupon', dir: 1, k: function (f) { return eur(f.cupao); } }, { t: 'Principal', dir: 1, k: function (f) { return eur(f.capital); } },
        { t: 'Years', dir: 1, k: function (f) { return f.t.toFixed(4).replace('.', ','); } }, { t: 'Discount factor', dir: 1, k: function (f) { return f.fd.toFixed(6).replace('.', ','); } }, { t: 'Present value', dir: 1, k: function (f) { return eur(f.vp); } }
      ], x.fluxos, { rodape: '<tr><td colspan="5"><b>Amortised cost (dirty)</b></td><td class="dir ps-num"><b>' + eur(x.r.caSujo) + '</b></td></tr>' }) : ''));
  };

  /* ---------------- Carteiras ---------------- */
  B['carteiras'] = function () {
    return '<div class="ps-grid2">' + INV.carteiras.map(function (c) {
      var ls = porCart(c.id), v = soma(ls, 'sii'), classes = {};
      ls.forEach(function (r) { var k = TIPO[r.ins.tipo]; classes[k] = (classes[k] || 0) + r.sii; });
      var cob = c.pt ? v / c.pt : null;
      return APP.card(e(c.nome), '<div class="ps-sp">' + APP.chip(c.tipo, c.afeto ? 'info' : '') + '<span class="ps-tag">' + e(c.modelo) + '</span><span class="ps-tag">S.06.02: ' + e(c.sii) + '</span>' + (c.rff ? '<span class="ps-tag">' + e(c.rff) + '</span>' : '') + '</div>' +
        '<div class="ps-kpis iv-kpis3 ps-mt">' + APP.kpi('Solvency II value', APP.mi(v)) + APP.kpi('Book value', APP.mi(soma(ls, 'contab'))) + (c.pt ? APP.kpi('Coverage', APP.pct(cob, 1), 'Technical provisions ' + APP.mi(c.pt), cob < 1 ? 'k-err' : 'k-ok') : APP.kpi('Lots', ls.length)) + '</div>' +
        (c.pt ? '<div class="ps-mt"><span class="ps-small ps-mut">Allocated assets vs technical provisions (R-17)</span>' + APP.barra(v, c.pt * 1.25, c.pt) + '</div>' : '') +
        '<ul class="iv-comp">' + Object.keys(classes).map(function (k) { return '<li><span>' + e(k) + '</span><b>' + APP.pct(classes[k] / v, 1) + '</b></li>'; }).join('') + '</ul>',
        '<a class="ps-btn peq" href="/posicoes/?c=' + c.id + '">Positions</a>');
    }).join('') + '</div>';
  };

  /* ---------------- Posicoes ---------------- */
  var abertas = {};
  B['posicoes'] = function () {
    var fc = APP.q.c || '';
    var ls = L.filter(function (r) { return !fc || r.cart === fc; });
    var grupos = {};
    ls.forEach(function (r) { var k = r.cart + '|' + r.ins.id; (grupos[k] = grupos[k] || []).push(r); });
    var cols = ['Instrument', 'Portfolio', 'Nominal / qty', 'Amortised cost', 'Accrued int.', 'Fair value', 'Book value', 'OCI reserve', 'ECL'];
    var linhas = Object.keys(grupos).map(function (k) {
      var g = grupos[k], r0 = g[0], ab = abertas[k];
      var tr = '<tr class="liga" data-a="abrirPos" data-v="' + k + '"><td class="prim"><span class="iv-seta">' + (ab ? '▾' : '▸') + '</span> ' + link(r0.ins) + '</td><td data-l="Portfolio">' + e(cart(r0.cart).nome) + '</td>' +
        [qtd(r0.ins, soma(g, 'q')), eur(soma(g, 'ca')), eur(soma(g, 'jc')), eur(soma(g, 'jv')), eur(soma(g, 'contab')), eur(soma(g, 'reserva')), eur(soma(g, 'ecl'))].map(function (v, n) { return '<td class="dir ps-num" data-l="' + cols[n + 2] + '">' + v + '</td>'; }).join('') + '</tr>';
      if (ab) tr += g.map(function (r) {
        return '<tr class="iv-sub"><td class="prim"><span class="ps-mono">' + r.lote.id + '</span> · ' + APP.dt(r.lote.d) + ' ' + APP.clChip(r.cl) + (r.tje != null ? ' <span class="ps-small ps-mut">EIR ' + APP.pct(r.tje, 4) + '</span>' : '') + '</td><td><button class="ps-btn peq" data-a="calc" data-v="' + r.lote.id + '">Calculation</button></td>' +
          [qtd(r.ins, r.q), eur(r.ca), eur(r.jc), eur(r.jv), eur(r.contab), eur(r.reserva), eur(r.ecl)].map(function (v, n) { return '<td class="dir ps-num" data-l="' + cols[n + 2] + '">' + v + '</td>'; }).join('') + '</tr>';
      }).join('');
      return tr;
    }).join('');
    var tot = '<tr class="iv-tot"><td class="prim">Total</td><td></td><td></td>' + ['ca', 'jc', 'jv', 'contab', 'reserva', 'ecl'].map(function (k) { return '<td class="dir ps-num">' + eur(soma(ls, k)) + '</td>'; }).join('') + '</tr>';
    return '<div class="ps-filtros"><label class="ps-campo"><span class="ps-lab">Portfolio</span><select class="ps-sel" data-on="fPosCart"><option value="">All portfolios</option>' + INV.carteiras.map(function (c) { return '<option value="' + c.id + '"' + (fc === c.id ? ' selected' : '') + '>' + e(c.nome) + '</option>'; }).join('') + '</select></label>' +
      '<label class="ps-campo"><span class="ps-lab">Date</span><input class="ps-in" type="date" value="' + REF + '" data-on="fPosData"></label><button class="ps-btn" data-a="ok" data-v="Inventory exported to Excel">Export inventory</button></div>' +
      '<section class="ps-card"><div class="ps-card-body"><div class="ps-tw"><table class="ps-t"><thead><tr>' + cols.map(function (c, n) { return '<th' + (n > 1 ? ' class="dir"' : '') + '>' + c + '</th>'; }).join('') + '</tr></thead><tbody>' + linhas + tot + '</tbody></table></div></div></section>';
  };
  A.abrirPos = function (k, el, ev) { if (ev.target.closest('a,button')) return; abertas[k] = !abertas[k]; APP.render(); };
  A.fPosCart = function (v) { APP.ir('/posicoes/' + (v ? '?c=' + v : '')); };
  A.fPosData = function () { APP.aviso('In the platform the positions are rebuilt at any date (P9). The mockup has one reference date.'); };

  /* ---------------- Afetacoes ---------------- */
  var nf = { lote: 'L012', q: 1000000, para: 'PPR' };
  function impacto() {
    var r = L.filter(function (x) { return x.lote.id === nf.lote; })[0];
    var q = Math.min(+nf.q || 0, r.q), v = r.sii * q / r.q;
    var de = cart(r.cart), para = cart(nf.para);
    var linha = function (c, delta) {
      var a = soma(porCart(c.id), 'sii');
      return '<tr><td class="prim">' + e(c.nome) + '</td><td class="dir ps-num">' + eur(a) + '</td><td class="dir ps-num">' + eur(a + delta) + '</td><td class="dir ps-num">' + (c.pt ? APP.pct(a / c.pt, 1) + ' → <b>' + APP.pct((a + delta) / c.pt, 1) + '</b>' : '-') + '</td></tr>';
    };
    var avisos = [];
    if (de.modelo !== para.modelo) avisos.push('Business model changes (' + e(de.modelo) + ' → ' + e(para.modelo) + '): needs an IFRS 9 reclassification with double approval (R-23, R-03).');
    if (para.rff || de.rff) avisos.push('Ring-fenced fund involved: always needs approval and may affect policyholders\' profit sharing (R-16).');
    if (nf.para === 'PPR' && r.em.nome === 'Banco B') { var pp = soma(porCart('PPR'), 'sii'), bb = soma(porCart('PPR').filter(function (x) { return x.em.nome === 'Banco B'; }), 'sii'); var lim = INV.limites.filter(function (x) { return x.base === 'Carteira PPR'; })[0], dep = (bb + v) / (pp + v); avisos.push('Limit "' + e(lim.dim) + '": Banco B goes from ' + APP.pct(bb / pp, 1) + ' to ' + APP.pct(dep, 1) + ' (alert ' + APP.pct(lim.alerta, 0) + ', max ' + APP.pct(lim.max, 0) + ').'); }
    if (r.cart === nf.para) avisos = ['Origin and destination are the same portfolio.'];
    return '<table class="ps-t"><thead><tr><th>Portfolio</th><th class="dir">Before</th><th class="dir">After</th><th class="dir">Coverage</th></tr></thead><tbody>' + linha(de, -v) + (r.cart !== nf.para ? linha(para, v) : '') + '</tbody></table>' +
      '<p class="ps-small ps-mut ps-mt">Moves ' + qtd(r.ins, q) + ' at Solvency II value ' + eur(v) + '. Cost, EIR, classification and stage of the lot are kept: a reallocation is not a sale (R-23).</p>' +
      avisos.map(function (a) { return '<div class="ps-aviso warn">' + a + '</div>'; }).join('');
  }
  B['afetacoes'] = function () {
    var form = '<div class="ps-form2">' +
      '<label class="ps-campo"><span class="ps-lab">Lot</span><select class="ps-sel" data-on="afLote">' + L.map(function (r) { return '<option value="' + r.lote.id + '"' + (r.lote.id === nf.lote ? ' selected' : '') + '>' + r.lote.id + ' · ' + e(r.ins.nome) + ' · ' + e(cart(r.cart).nome) + '</option>'; }).join('') + '</select></label>' +
      '<label class="ps-campo"><span class="ps-lab">Nominal or quantity to move</span><input class="ps-in" type="number" value="' + nf.q + '" data-on="afQ"></label>' +
      '<label class="ps-campo"><span class="ps-lab">Destination</span><select class="ps-sel" data-on="afPara">' + INV.carteiras.map(function (c) { return '<option value="' + c.id + '"' + (c.id === nf.para ? ' selected' : '') + '>' + e(c.nome) + '</option>'; }).join('') + '</select></label>' +
      '<label class="ps-campo"><span class="ps-lab">Effective date</span><input class="ps-in" type="date" value="' + REF + '" data-af-data></label>' +
      '<label class="ps-campo ps-form-1" style="grid-column:1/-1"><span class="ps-lab">Reason</span><textarea class="ps-ta" rows="2" placeholder="Mandatory" data-af-motivo></textarea></label></div>' +
      '<h3 class="iv-h3">Impact before approval (R-24)</h3><div data-impacto>' + impacto() + '</div>' +
      '<div class="ps-sp ps-mt"><button class="ps-btn pri" data-a="reafetar">Submit for approval</button><span class="ps-small ps-mut">Recorded by ' + USER + '. Another person approves.</span></div>';
    var hist = APP.tabela([
      { t: 'ID', k: function (a) { return '<span class="ps-mono">' + a.id + '</span>'; } },
      { t: 'Effective', k: function (a) { return APP.dt(a.data); } },
      { t: 'Lot / instrument', k: function (a) { var r = L.filter(function (x) { return x.lote.id === a.lote; })[0]; return '<span class="ps-mono">' + a.lote + '</span> · ' + e(r.ins.nome); } },
      { t: 'Quantity', dir: 1, k: function (a) { return eur(a.q); } },
      { t: 'From → to', k: function (a) { return e(a.de === '-' ? 'New' : cart(a.de).nome) + ' → ' + e(cart(a.para).nome); } },
      { t: 'Reason', k: function (a) { return e(a.motivo); } },
      { t: 'Recorded', k: function (a) { return e(a.por) + '<span class="ps-mut ps-small" style="display:block">' + APP.dt(a.em) + '</span>'; } },
      { t: 'Approved', k: function (a) { return a.apr ? e(a.apr) + '<span class="ps-mut ps-small" style="display:block">' + APP.dt(a.aprEm) + '</span>' : '-'; } },
      { t: 'Status', k: function (a) { return APP.estado(a.estado); } }
    ], INV.afetacoes);
    return '<div class="ps-col">' + APP.card('New allocation movement', form, '<div class="ps-seg"><button class="on">Reallocate</button><button>Partial allocation</button><button>Release to free</button></div>') + APP.card('Allocation history', hist + '<p class="ps-small ps-mut ps-mt">History is never overwritten. To correct a movement, record the reverse movement, linked to the first one (R-25).</p>') + '</div>';
  };
  var refazImp = function () { document.querySelector('[data-impacto]').innerHTML = impacto(); };
  A.afLote = function (v) { nf.lote = v; refazImp(); };
  A.afQ = function (v) { nf.q = v; refazImp(); };
  A.afPara = function (v) { nf.para = v; refazImp(); };

  /* ---------------- Operacoes ---------------- */
  var fOp = '';
  B['operacoes'] = function () {
    var est = ['', 'Draft', 'Pending approval', 'Approved'];
    var ops = INV.operacoes.filter(function (o) { return !fOp || o.estado === fOp; });
    var prox = proximosFluxos(REF, MOTOR.addMeses(REF, 1));
    return '<div class="ps-filtros"><div class="ps-seg">' + est.map(function (s) { return '<button type="button" class="' + (s === fOp ? 'on' : '') + '" data-a="fOp" data-v="' + s + '">' + (s || 'All') + ' <span class="n">' + INV.operacoes.filter(function (o) { return !s || o.estado === s; }).length + '</span></button>'; }).join('') + '</div>' +
      '<button class="ps-btn pri" data-a="novaOp">New transaction</button><button class="ps-btn" data-a="importar" data-v="Transactions">Import broker notes</button></div>' +
      '<div class="ps-col">' + APP.card('Proposed from the cash-flow schedule · next 30 days', prox.length ? APP.tabela([
        { t: 'Date', k: function (f) { return APP.dt(f.data); } }, { t: 'Instrument', k: function (f) { return link(f.r.ins); } }, { t: 'Portfolio', k: function (f) { return e(cart(f.r.cart).nome); } },
        { t: 'Type', k: function (f) { return f.capital ? 'Coupon + redemption' : 'Coupon'; } }, { t: 'Expected', dir: 1, k: function (f) { return eur(f.cupao + f.capital); } },
        { t: '', k: function () { return '<button class="ps-btn peq" data-a="ok" data-v="Coupon confirmed and submitted for approval">Confirm received</button>'; } }
      ], prox) : '<p class="ps-mut">No cash flows due in the next 30 days.</p>') +
      APP.card('Transactions', APP.tabela([
        { t: 'ID', k: function (o) { return '<span class="ps-mono">' + o.id + '</span>'; } }, { t: 'Type', k: function (o) { return e(o.tipo); } },
        { t: 'Instrument', k: function (o) { return link(insP(o.i)); } }, { t: 'Portfolio', k: function (o) { return e(cart(o.c).nome); } },
        { t: 'Trade / settlement', k: function (o) { return APP.dt(o.neg) + '<span class="ps-mut ps-small" style="display:block">' + APP.dt(o.liq) + '</span>'; } },
        { t: 'Nominal / qty', dir: 1, k: function (o) { return qtd(insP(o.i), o.q); } }, { t: 'Price', dir: 1, k: function (o) { return o.preco ? String(o.preco).replace('.', ',') : '-'; } },
        { t: 'Accrued', dir: 1, k: function (o) { return o.jc ? eur(o.jc) : '-'; } }, { t: 'Amount', dir: 1, k: function (o) { return o.valor ? eur(o.valor) + (o.ret ? '<span class="ps-mut ps-small" style="display:block">WHT ' + eur(o.ret) + '</span>' : '') : '-'; } },
        { t: 'Status', k: function (o) { return APP.estado(o.estado) + (o.nota ? '<span class="ps-mut ps-small" style="display:block">' + e(o.nota) + '</span>' : ''); } }
      ], ops) + '<p class="ps-small ps-mut ps-mt">Approved transactions are never edited: reverse and record again (R-29). Dates in a closed period are refused (R-30).</p>') + '</div>';
  };
  A.fOp = function (v) { fOp = v || ''; APP.render(); };
  var op = { i: 'I07', liq: '2026-11-04', q: 1000000, p: 100.85, jcN: 0 };
  function calcOp() {
    var i = insP(op.i), jc = (+op.q || 0) * MOTOR.juroCorrido(i, op.liq), dif = (+op.jcN || 0) - jc;
    var bloq = Math.abs(dif) > 0.01;
    return '<table class="ps-t iv-calc"><tbody><tr><td>Clean amount</td><td class="dir ps-num">' + eur(op.q * op.p / 100) + '</td></tr><tr><td>Accrued interest calculated (' + e(i.base || '-') + ')</td><td class="dir ps-num">' + eur(jc) + '</td></tr><tr><td>Accrued interest on broker note</td><td class="dir ps-num">' + eur(+op.jcN || 0) + '</td></tr><tr><td><b>Difference</b></td><td class="dir ps-num"><b>' + eur(dif) + '</b></td></tr><tr><td><b>Total to settle</b></td><td class="dir ps-num"><b>' + eur(op.q * op.p / 100 + jc) + '</b></td></tr></tbody></table>' +
      (bloq ? '<div class="ps-aviso err">The difference is above the 0,01 tolerance: justify it before submitting (R-26).</div>' : '<p class="ps-txt-ok ps-small ps-mt">Accrued interest matches the broker note.</p>') +
      '<div class="ps-sp ps-mt"><button class="ps-btn pri" data-a="ok" data-v="Transaction submitted for approval"' + (bloq ? ' disabled' : '') + '>Submit for approval</button></div>';
  }
  A.novaOp = function () {
    op.jcN = +(op.q * MOTOR.juroCorrido(insP(op.i), op.liq)).toFixed(2) + 25;
    APP.painel('New transaction', '<div class="ps-form2"><label class="ps-campo"><span class="ps-lab">Type</span><select class="ps-sel"><option>Purchase</option><option>Sale</option><option>Coupon</option><option>Redemption</option><option>Early redemption</option><option>Dividend</option><option>Corporate event</option><option>Manual movement</option></select></label>' +
      '<label class="ps-campo"><span class="ps-lab">Instrument</span><select class="ps-sel" data-on="opI">' + INV.instrumentos.filter(function (i) { return i.tipo === 'obr'; }).map(function (i) { return '<option value="' + i.id + '"' + (i.id === op.i ? ' selected' : '') + '>' + e(i.nome) + '</option>'; }).join('') + '</select></label>' +
      '<label class="ps-campo"><span class="ps-lab">Portfolio</span><select class="ps-sel">' + INV.carteiras.map(function (c) { return '<option>' + e(c.nome) + '</option>'; }).join('') + '</select></label>' +
      '<label class="ps-campo"><span class="ps-lab">IFRS 9 class</span><select class="ps-sel"><option>FVOCI (proposed by business model)</option><option>Amortised cost</option><option>FVTPL</option></select></label>' +
      '<label class="ps-campo"><span class="ps-lab">Trade date</span><input class="ps-in" type="date" value="2026-11-02"></label><label class="ps-campo"><span class="ps-lab">Settlement date</span><input class="ps-in" type="date" value="' + op.liq + '" data-on="opLiq"></label>' +
      '<label class="ps-campo"><span class="ps-lab">Nominal</span><input class="ps-in" type="number" value="' + op.q + '" data-on="opQ"></label><label class="ps-campo"><span class="ps-lab">Clean price (%)</span><input class="ps-in" type="number" step="0.001" value="' + op.p + '" data-on="opP"></label>' +
      '<label class="ps-campo"><span class="ps-lab">Accrued interest (broker note)</span><input class="ps-in" type="number" step="0.01" value="' + op.jcN + '" data-on="opJ"></label><label class="ps-campo"><span class="ps-lab">Counterparty</span><input class="ps-in" value="Banco B"></label></div>' +
      '<div data-calc-op>' + calcOp() + '</div>');
  };
  var refazOp = function () { document.querySelector('[data-calc-op]').innerHTML = calcOp(); };
  A.opI = function (v) { op.i = v; refazOp(); }; A.opLiq = function (v) { op.liq = v; refazOp(); }; A.opQ = function (v) { op.q = v; refazOp(); }; A.opP = function (v) { op.p = v; refazOp(); }; A.opJ = function (v) { op.jcN = v; refazOp(); };

  /* ---------------- Valorizacoes ---------------- */
  B['valorizacoes'] = function () {
    var exc = INV.instrumentos.filter(function (i) { return i.excecao || i.manual; });
    return '<div class="ps-col">' + APP.card('Exceptions and manual prices · ' + APP.dt(REF), APP.tabela([
      { t: 'Instrument', k: link }, { t: 'Price', dir: 1, k: function (i) { return String(i.preco).replace('.', ','); } }, { t: 'Source', k: function (i) { return e(i.fonte); } },
      { t: 'Issue', k: function (i) { return i.manual ? APP.chip('Manual price · pending approval', 'rev') : APP.chip(i.excecao, 'warn'); } },
      { t: '', k: function (i) { return i.manual ? '<a class="ps-btn peq" href="/aprovacoes/">Open approval</a>' : '<button class="ps-btn peq" data-a="ok" data-v="Price confirmed with justification">Confirm with justification</button>'; } }
    ], exc) + '<p class="ps-small ps-mut ps-mt">Checks on every load: missing price, stale price (more than 5 days), daily change above tolerance, bond price outside 0–200% (R-39). Exceptions block the close.</p>', '<button class="ps-btn" data-a="importar" data-v="Prices">Import prices</button>') +
      APP.card('Prices at ' + APP.dt(REF), APP.tabela([
        { t: 'Instrument', k: link }, { t: 'Price', dir: 1, k: function (i) { return String(i.preco).replace('.', ','); } }, { t: 'Quote', k: function (i) { return divida(i) ? '% of nominal (clean)' : i.tipo === 'fundo' ? 'NAV per unit' : 'Per share'; } },
        { t: 'Source', k: function (i) { return e(i.fonte); } }, { t: 'IFRS 13', k: function (i) { return APP.chip('Level ' + i.nivel, i.nivel === 3 ? 'warn' : i.nivel === 2 ? 'info' : 'ok'); } },
        { t: 'Status', k: function (i) { return i.manual ? APP.chip('Pending approval', 'rev') : i.excecao ? APP.chip('Exception', 'warn') : APP.chip('Validated', 'ok'); } }
      ], INV.instrumentos)) + '</div>';
  };

  /* ---------------- Imparidade ---------------- */
  B['imparidade'] = function () {
    var ls = L.filter(function (r) { return divida(r.ins) && r.cl !== 'JVR'; });
    var s1 = ls.filter(function (r) { return r.estagio === 1; }), s2 = ls.filter(function (r) { return r.estagio === 2; });
    return '<div class="ps-kpis iv-kpis">' + APP.kpi('Stage 1 · 12-month ECL', eur(soma(s1, 'ecl')), s1.length + ' lots') + APP.kpi('Stage 2 · lifetime ECL', eur(soma(s2, 'ecl')), s2.length + ' lot(s) · pending approval', 'k-warn') + APP.kpi('Stage 3 · credit-impaired', eur(0), '0 lots') + APP.kpi('Movement of the period', eur(soma(s2, function (r) { return r.ecl - r.ecl1; })), 'Stage transfer Energia C', 'k-err') + '</div>' +
      APP.card('ECL by lot · ' + APP.dt(REF), APP.tabela([
        { t: 'Instrument', k: function (r) { return link(r.ins); } }, { t: 'Lot', k: function (r) { return '<span class="ps-mono">' + r.lote.id + '</span>'; } }, { t: 'Class', k: function (r) { return APP.clChip(r.cl); } },
        { t: 'Rating at purchase → now', k: function (r) { return e(r.lote.rt || '-') + ' → ' + e(r.em.rating); } },
        { t: 'Stage', k: function (r) { return r.estagio === 2 ? APP.chip('2 · proposed', 'warn') : APP.chip('1', 'ok'); } },
        { t: 'PD', dir: 1, k: function (r) { return APP.pct(r.pd, 4); } }, { t: 'LGD', dir: 1, k: function (r) { return APP.pct(r.lgd, 0); } },
        { t: 'EAD', dir: 1, k: function (r) { return eur(r.ead); } }, { t: 'ECL', dir: 1, k: function (r) { return eur(r.ecl); } },
        { t: 'Booked in', k: function (r) { return r.cl === 'CA' ? 'Asset (allowance)' : 'OCI reserve'; } }
      ], ls) + '<p class="ps-small ps-mut ps-mt">ECL = EAD × PD × LGD with the PD and LGD tables of the backoffice (R-06). Stage 2 when investment grade is lost since purchase or the rating falls 3 notches; investment grade stays in stage 1 (low credit risk, R-07). A manual override needs approval and evidence (R-09).</p>');
  };

  /* ---------------- Limites ---------------- */
  function exposicao(lim) {
    var base = lim.base === 'Carteira PPR' ? porCart('PPR') : L, tot = soma(base, 'sii'), f;
    if (lim.alvo === 'Banco B') f = function (r) { return r.em.nome === 'Banco B'; };
    else if (lim.alvo === 'Grupo Energia C') f = function (r) { return r.em.grupo === 'Grupo Energia C'; };
    else if (lim.alvo === 'Itália') f = function (r) { return r.ins.em === 'IT'; };
    else if (lim.alvo === 'Rating < BBB-') f = function (r) { return divida(r.ins) && r.em.rating !== '-' && !MOTOR.ig(r.em.rating); };
    else if (lim.alvo === 'CIC 31') f = function (r) { return r.ins.cic.slice(2) === '31'; };
    else f = function (r) { return r.ins.cic.slice(0, 3) === 'XL3'; };
    return soma(base.filter(f), 'sii') / tot;
  }
  B['limites'] = function () {
    return APP.card('Use of limits · ' + APP.dt(REF) + ' · base Solvency II value', APP.tabela([
      { t: 'Limit', k: function (l) { return '<b>' + e(l.dim) + '</b><span class="ps-mut ps-small" style="display:block">' + e(l.alvo) + ' · ' + e(l.base) + '</span>'; } },
      { t: 'Use', dir: 1, k: function (l) { return '<b>' + APP.pct(exposicao(l), 1) + '</b>'; } },
      { t: '', k: function (l) { return APP.barra(exposicao(l), l.max, l.alerta); } },
      { t: 'Alert', dir: 1, k: function (l) { return APP.pct(l.alerta, 0); } }, { t: 'Max', dir: 1, k: function (l) { return APP.pct(l.max, 0); } },
      { t: 'Source', k: function (l) { return e(l.origem); } },
      { t: 'Status', k: function (l) { var x = exposicao(l); return x > l.max ? APP.chip(l.justif ? 'Breach · justified' : 'Breach · to justify', 'err') + '<span class="ps-mut ps-small" style="display:block;max-width:280px;white-space:normal">' + e(l.justif || '') + '</span>' : x > l.alerta ? APP.chip('Alert', 'warn') : APP.chip('Within limit', 'ok'); } }
    ], INV.limites) + '<p class="ps-small ps-mut ps-mt">Checked before (on submitting a transaction or reallocation) and after (daily and at close). Groups of issuers are aggregated by the issuer group (R-49).</p>');
  };

  /* ---------------- Contabilidade ---------------- */
  function lancamentos() {
    var ant = MOTOR.addMeses(REF, -1), out = [];
    L.forEach(function (r) {
      if (r.tje == null) return;
      var a = MOTOR.lote(INV, r.lote, ant), recebido = 0;
      MOTOR.fluxos(r.ins).forEach(function (f) { if (f.data > ant && f.data <= REF) recebido += r.q * (f.cupao + f.capital); });
      var juro = r.caSujo - a.caSujo + recebido;
      out.push({ ev: 'Interest (EIR)', ref: r.lote.id, ins: r.ins.nome, d: 'Juros a receber / prémio-desconto', c: 'Rendimentos de investimentos - juros', v: juro, cl: r.cl });
      if (recebido) out.push({ ev: 'Coupon received', ref: r.lote.id, ins: r.ins.nome, d: 'Depósitos à ordem', c: 'Juros a receber', v: recebido, cl: r.cl });
      if (r.estagio === 2) out.push({ ev: 'ECL charge', ref: r.lote.id, ins: r.ins.nome, d: 'Perdas de imparidade', c: r.cl === 'CA' ? 'Imparidade acumulada' : 'Reserva de justo valor', v: r.ecl - r.ecl1, cl: r.cl });
    });
    return out;
  }
  B['contabilidade'] = function () {
    var lc = lancamentos(), tot = soma(lc, 'v');
    return '<div class="ps-grid-side iv-side"><div class="ps-col">' +
      APP.card('Journal entries · ' + e(INV.periodo) + ' (draft)', APP.tabela([
        { t: 'Event', k: function (x) { return e(x.ev) + '<span class="ps-mut ps-small" style="display:block">' + e(x.ins) + ' · <span class="ps-mono">' + x.ref + '</span></span>'; } },
        { t: 'Class', k: function (x) { return APP.clChip(x.cl); } },
        { t: 'Debit', k: function (x) { return e(x.d); } }, { t: 'Credit', k: function (x) { return e(x.c); } },
        { t: 'Amount', dir: 1, k: function (x) { return eur(x.v); } }
      ], lc, { rodape: '<tr class="iv-tot"><td colspan="4"><b>Debits = credits</b> · ' + lc.length + ' entries · every line keeps the rule, the transaction and the lot (R-43)</td><td class="dir ps-num"><b>' + eur(tot) + '</b></td></tr>' }),
      '<button class="ps-btn" data-a="csv">Export to ERP (CSV)</button>') + '</div>' +
      APP.card('Close ' + e(INV.periodo), '<ol class="iv-steps">' + INV.fecho.map(function (f) { return '<li class="' + f.s + '"><b>' + e(f.t) + '</b><span>' + e(f.d) + '</span></li>'; }).join('') + '</ol><button class="ps-btn pri" disabled title="Open items block the close">Close period</button><p class="ps-small ps-mut ps-mt">Closing keeps a snapshot so any report can be reproduced later (P9, C-10).</p>') + '</div>';
  };
  A.csv = function () {
    var lc = lancamentos(), linhas = [['Period', 'Entity', 'Event', 'Lot', 'Instrument', 'Debit account', 'Credit account', 'Amount', 'Currency']].concat(lc.map(function (x) { return [INV.periodo, INV.entidade.id, x.ev, x.ref, x.ins, x.d, x.c, x.v.toFixed(2), 'EUR']; }));
    var csv = linhas.map(function (l) { return l.map(function (c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(';'); }).join('\n');
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv' })); a.download = 'lancamentos-2026-10.csv'; a.click();
    APP.aviso('Export created: ' + lc.length + ' entries', 'ok');
  };

  /* ---------------- Relatorios ---------------- */
  B['relatorios'] = function () {
    var rel = [['Investment inventory', 'Every lot with cost, amortised cost, fair value, allocation and IFRS 9 class'], ['Allocation and coverage map', 'Technical provisions vs allocated assets by portfolio (R-17)'], ['S.06.02 List of assets', 'Solvency II, item by item, ready for the reporting tool'], ['S.09.01 Income, gains and losses', 'Interest, dividends, realised and unrealised gains by asset'], ['Movement schedule', 'Opening, purchases, sales, interest, fair value, ECL, closing (IFRS 7)'], ['Fair value hierarchy', 'Levels 1, 2 and 3 and level 3 movements (IFRS 13)'], ['ECL by stage', 'Stages and movements of the period'], ['Limit breaches', 'Open and historical breaches with justification']];
    var s06 = APP.tabela([
      { t: 'Asset ID (C0040)', k: function (r) { return '<span class="ps-mono">' + e(r.ins.isin || r.ins.codigo) + '</span>'; } },
      { t: 'Portfolio', k: function (r) { return e(cart(r.cart).sii); } },
      { t: 'RFF', k: function (r) { return e(cart(r.cart).rff || '-'); } },
      { t: 'Item title', k: function (r) { return e(r.ins.nome); } },
      { t: 'Issuer', k: function (r) { return e(r.em.nome); } },
      { t: 'Sector', k: function (r) { return '<span class="ps-mono">' + e(r.em.nace) + '</span>'; } },
      { t: 'CIC', k: function (r) { return '<span class="ps-mono">' + e(r.ins.cic) + '</span>'; } },
      { t: 'Par / qty', dir: 1, k: function (r) { return divida(r.ins) ? eur(r.q) : APP.int(r.q); } },
      { t: 'Valuation method', k: function (r) { return r.ins.nivel === 1 ? 'QMP' : r.ins.nivel === 2 ? 'AVM' : 'AEM'; } },
      { t: 'Acquisition value', dir: 1, k: function (r) { return eur(r.custoAq); } },
      { t: 'Accrued interest', dir: 1, k: function (r) { return eur(r.jc); } },
      { t: 'Total SII amount', dir: 1, k: function (r) { return eur(r.sii); } }
    ], L);
    return '<div class="ps-tiles">' + rel.map(function (x) { return '<div class="ps-tile"><div class="ps-tile-t">' + e(x[0]) + '</div><div class="ps-tile-s">' + e(x[1]) + '</div><div class="ps-tile-e ps-sp"><button class="ps-btn peq" data-a="ok" data-v="' + e(x[0]) + ' generated at ' + APP.dt(REF) + '">Excel</button><button class="ps-btn peq" data-a="ok" data-v="' + e(x[0]) + ' generated at ' + APP.dt(REF) + '">PDF</button></div></div>'; }).join('') + '</div>' +
      '<div class="ps-mt">' + APP.card('Preview · S.06.02 List of assets · ' + APP.dt(REF), s06 + '<p class="ps-small ps-mut ps-mt">Selection of columns. The full file follows the EIOPA taxonomy in force; the XBRL is produced by the reporting tool the insurer already uses (section 15). Method codes are illustrative: QMP quoted market price, AVM alternative valuation, AEM adjusted equity method.</p>') + '</div>';
  };

  /* ---------------- Aprovacoes ---------------- */
  B['aprovacoes'] = function () {
    var lista = INV.aprovacoes;
    return APP.card(INV.aprovacoes.filter(function (a) { return a.por !== USER; }).length + ' waiting for you', APP.tabela([
      { t: 'Type', k: function (a) { return APP.chip(a.tipo, 'rev'); } }, { t: 'Reference', k: function (a) { return '<span class="ps-mono">' + a.ref + '</span>'; } },
      { t: 'What', k: function (a) { return '<b>' + e(a.desc) + '</b><span class="ps-mut ps-small" style="display:block">' + e(a.imp) + '</span>'; } },
      { t: 'Requested', k: function (a) { return e(a.por) + '<span class="ps-mut ps-small" style="display:block">' + APP.dt(a.em) + '</span>'; } },
      { t: '', k: function (a) { return a.por === USER ? '<span class="ps-small ps-mut">You recorded this: another person approves (R-18)</span>' : '<div class="ps-sp"><button class="ps-btn ok peq" data-a="aprovar" data-v="' + a.ref + '">Approve</button><button class="ps-btn err peq" data-a="rejeitar" data-v="' + a.ref + '">Reject</button></div>'; } }
    ], lista));
  };
  /* Decisoes e reafetacoes gravam no Supabase (inv_decidir, inv_reafetar) e recarregam os dados */
  var gravar = function (fn, corpo, msg) {
    return APP.rpc(fn, corpo).then(function () { APP.fecharPan(); return APP.recarregar(); }).then(function () { APP.aviso(msg, 'ok'); })
      .catch(function (er) { APP.aviso(er.message, 'err'); });
  };
  A.aprovar = function (ref) { gravar('inv_decidir', { p_ref: ref, p_aprovar: true, p_motivo: null }, ref + ' approved'); };
  A.rejeitar = function (ref) {
    APP.painel('Reject ' + e(ref), '<label class="ps-campo"><span class="ps-lab">Reason (mandatory)</span><textarea class="ps-ta" rows="3" data-rej-motivo></textarea></label><div class="ps-sp"><button class="ps-btn err cheio" data-a="rejeitarOk" data-v="' + e(ref) + '">Reject</button></div>');
  };
  A.rejeitarOk = function (ref) {
    var m = document.querySelector('[data-rej-motivo]').value.trim();
    if (!m) { APP.aviso('A reason is mandatory to reject', 'err'); return; }
    gravar('inv_decidir', { p_ref: ref, p_aprovar: false, p_motivo: m }, ref + ' rejected and returned');
  };
  A.reafetar = function () {
    var m = document.querySelector('[data-af-motivo]').value.trim(), d = document.querySelector('[data-af-data]').value;
    if (!m) { APP.aviso('The reason is mandatory (R-15)', 'err'); return; }
    gravar('inv_reafetar', { p_lote: nf.lote, p_quantidade: +nf.q, p_destino: nf.para, p_data: d, p_motivo: m }, 'Reallocation submitted for approval');
  };

  /* ---------------- Trilho ---------------- */
  var fT = '';
  function tabTrilho() {
    return APP.tabela([
      { t: 'When', k: function (x) { return '<span class="ps-nowrap">' + APP.dt(x.em) + '</span>'; } }, { t: 'Who', k: function (x) { return e(x.u); } }, { t: 'Object', k: function (x) { return e(x.t) + ' <span class="ps-mono">' + e(x.reg) + '</span>'; } },
      { t: 'Field', k: function (x) { return e(x.campo); } }, { t: 'Previous', k: function (x) { return e(x.ant); } }, { t: 'New', k: function (x) { return '<b>' + e(x.novo) + '</b>'; } },
      { t: 'Reason', k: function (x) { return e(x.mot || '-'); } }, { t: 'Origin', k: function (x) { return APP.chip(x.orig, 'semponto'); } }
    ], INV.trilho.filter(function (x) { return !fT || JSON.stringify(x).toLowerCase().indexOf(fT.toLowerCase()) >= 0; }));
  }
  B['trilho'] = function () {
    return '<div class="ps-filtros"><label class="ps-campo" style="flex:1"><span class="ps-lab">Search</span><input class="ps-in" data-on="fTrilho" placeholder="User, record, field…" value="' + e(fT) + '"></label><button class="ps-btn" data-a="ok" data-v="Audit trail exported for the auditor">Export</button></div><section class="ps-card"><div class="ps-card-body" data-lista-trilho>' + tabTrilho() + '</div></section>';
  };
  A.fTrilho = function (v) { fT = v; document.querySelector('[data-lista-trilho]').innerHTML = tabTrilho(); };

  /* ---------------- Backoffice ---------------- */
  var abaB = 'regras';
  B['backoffice'] = function () {
    var abas = [['regras', 'Accounting rules'], ['carteiras', 'Portfolio types & dimensions'], ['ecl', 'PD & LGD tables'], ['precos', 'Price tolerances'], ['gerais', 'Entity & methods']];
    var corpo;
    if (abaB === 'regras') corpo = '<p class="ps-mut">Event × IFRS 9 class × portfolio type × asset type → accounts (R-42). The accounts of the chart of accounts in force are loaded as data, not code. Changes need approval and are versioned with start and end dates.</p>' + APP.tabela([
      { t: 'Event', k: function (r) { return '<b>' + e(r.ev) + '</b>'; } }, { t: 'Class', k: function (r) { return e(r.cl); } }, { t: 'Portfolio', k: function (r) { return e(r.cart); } }, { t: 'Asset', k: function (r) { return e(r.at); } }, { t: 'Debit', k: function (r) { return e(r.d); } }, { t: 'Credit', k: function (r) { return e(r.c); } }
    ], INV.regras);
    else if (abaB === 'carteiras') corpo = APP.tabela([{ t: 'Portfolio type', k: function (x) { return '<b>' + e(x[0]) + '</b>'; } }, { t: 'Allocated', k: function (x) { return x[1]; } }, { t: 'Rule', k: function (x) { return e(x[2]); } }],
      [['Afetos - Vida', 'Yes', 'Coverage of life technical provisions'], ['Afetos - Não Vida', 'Yes', 'Coverage of non-life technical provisions'], ['Afetos - fundo autónomo', 'Yes', 'Reallocation always needs approval (R-16)'], ['Afetos - unit-linked', 'Yes', 'Assets held in unit-linked'], ['Não afetos (livres)', 'No', '-']]) +
      '<h3 class="iv-h3">Dimensions</h3><div class="ps-sp">' + ['Ramo', 'Produto', 'Fundo', 'Natureza das responsabilidades', 'Grupo de contratos IFRS 17'].map(function (d) { return '<span class="ps-tag">' + d + '</span>'; }).join('') + '</div>';
    else if (abaB === 'ecl') corpo = '<div class="ps-grid2">' + APP.tabela([{ t: 'Rating', k: function (k) { return '<b>' + k + '</b>'; } }, { t: 'PD 12 months', dir: 1, k: function (k) { return APP.pct(INV.pd12[k], 2); } }], Object.keys(INV.pd12)) + APP.tabela([{ t: 'Issuer type', k: function (k) { return '<b>' + e(k) + '</b>'; } }, { t: 'LGD', dir: 1, k: function (k) { return APP.pct(INV.lgd[k], 0); } }], Object.keys(INV.lgd)) + '</div><p class="ps-small ps-mut ps-mt">Illustrative values. Stage criteria: loss of investment grade, 3 notches down, more than 30 days past due, manual watch list (R-07).</p>';
    else if (abaB === 'precos') corpo = APP.tabela([{ t: 'Asset class', k: function (x) { return '<b>' + e(x[0]) + '</b>'; } }, { t: 'Max daily change', dir: 1, k: function (x) { return x[1]; } }, { t: 'Stale after', dir: 1, k: function (x) { return x[2]; } }, { t: 'Source hierarchy', k: function (x) { return e(x[3]); } }],
      [['Government bonds', '2%', '3 days', 'Fecho de mercado → Contribuidor → Manual'], ['Corporate bonds', '3% (4% pending)', '5 days', 'Contribuidor → Manual'], ['Listed equity', '10%', '3 days', 'Fecho de mercado → Manual'], ['Funds', '5%', '5 days', 'NAV do gestor'], ['Unlisted', '-', '120 days', 'Avaliação interna (approval)']]);
    else corpo = '<dl class="iv-dl">' + [['Entity', INV.entidade.nome], ['Functional currency', INV.entidade.moeda], ['Lot relief method', INV.entidade.metodoLotes + ' (R-27)'], ['FX source', 'ECB reference rates'], ['Accrued interest tolerance', '0,01 EUR (R-26)'], ['Closed periods', 'Until September 2026'], ['Chart of accounts', 'PCES (version to confirm)']].map(function (c) { return '<div><dt>' + e(c[0]) + '</dt><dd>' + e(c[1]) + '</dd></div>'; }).join('') + '</dl>';
    return '<div class="ps-bo"><nav class="ps-bo-tabs">' + abas.map(function (a) { return '<button type="button" class="ps-bo-tab' + (a[0] === abaB ? ' on' : '') + '" data-a="abaB" data-v="' + a[0] + '">' + a[1] + '</button>'; }).join('') + '</nav>' +
      APP.card(abas.filter(function (a) { return a[0] === abaB; })[0][1], corpo, '<button class="ps-btn peq" data-a="ok" data-v="Change submitted for approval">Edit</button>') + '</div>';
  };
  A.abaB = function (v) { abaB = v; APP.render(); };

  APP.preparar = function () {
    USER = APP.utilizador ? APP.utilizador.nome : '';
    REF = INV.dataRef;
    L = MOTOR.lotes(INV, REF);
    TOT = soma(L, 'sii');
  };
})();
