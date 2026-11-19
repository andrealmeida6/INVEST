/* inv-app.js - nucleo do ecra: navegacao, formatos, tabelas, painel lateral e avisos.
   No mockup a navegacao e por hash (#/pagina/?q). No Power Pages cada pagina tem o seu URL e este ficheiro so trata do resto. */
(function () {
  'use strict';
  var APP = window.APP = { blocos: {} };
  var nf2 = new Intl.NumberFormat('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  var nf0 = new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 });

  APP.e = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  APP.eur = function (v) { return v == null || isNaN(v) ? '-' : nf2.format(v); };
  APP.int = function (v) { return v == null || isNaN(v) ? '-' : nf0.format(v); };
  APP.mi = function (v) { return (v / 1e6).toLocaleString('pt-PT', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' M€'; };
  APP.pct = function (v, c) { return v == null || isNaN(v) ? '-' : (v * 100).toLocaleString('pt-PT', { minimumFractionDigits: c == null ? 2 : c, maximumFractionDigits: c == null ? 2 : c }) + '%'; };
  APP.dt = function (s) { if (!s || s.length < 10) return s || '-'; var p = s.slice(0, 10).split('-'); return p[2] + '/' + p[1] + '/' + p[0] + s.slice(10); };

  APP.chip = function (txt, cls) { return '<span class="ps-chip ' + (cls || '') + '">' + APP.e(txt) + '</span>'; };
  APP.estado = function (s) {
    var m = { Done: 'ok', 'To do': '', Approved: 'ok', 'Pending approval': 'rev', Draft: '', Rejected: 'err', Reversed: 'err', Open: 'warn', Justified: 'info', ok: 'ok', warn: 'warn', todo: '', err: 'err' };
    return APP.chip(s, m[s] == null ? '' : m[s]);
  };
  APP.CL = { CA: 'Amortised cost', FVOCI: 'FVOCI', 'FVOCI-EQ': 'FVOCI equity', FVTPL: 'FVTPL' };
  APP.clChip = function (cl) { return '<span class="ps-tag" title="' + APP.e(APP.CL[cl]) + '">' + APP.e(APP.CL[cl] || cl) + '</span>'; };

  /* Tabela: cols = [{t, k(r) -> html, dir, l}] ; cada td leva data-l para virar cartao no telemovel */
  APP.tabela = function (cols, linhas, opc) {
    opc = opc || {};
    return '<div class="ps-tw"><table class="ps-t' + (opc.cls ? ' ' + opc.cls : '') + '"><thead><tr>' + cols.map(function (c) { return '<th scope="col"' + (c.dir ? ' class="dir"' : '') + '>' + c.t + '</th>'; }).join('') + '</tr></thead><tbody>' +
      (linhas.length ? linhas.map(function (r, n) {
        return '<tr' + (opc.liga ? ' class="liga" data-a="' + opc.liga + '" data-v="' + APP.e(opc.id ? opc.id(r) : n) + '"' : '') + (opc.trCls ? ' class="' + opc.trCls(r) + '"' : '') + '>' +
          cols.map(function (c, j) { return '<td' + (c.dir ? ' class="dir ps-num"' : j === 0 ? ' class="prim"' : '') + (j === 0 && !c.dir ? '' : ' data-l="' + APP.e(c.l || c.t) + '"') + '>' + c.k(r) + '</td>'; }).join('') + '</tr>';
      }).join('') : '<tr class="fx-vazio"><td colspan="' + cols.length + '">Nothing to show</td></tr>') + '</tbody>' + (opc.rodape ? '<tfoot>' + opc.rodape + '</tfoot>' : '') + '</table></div>';
  };
  APP.card = function (titulo, corpo, acoes, cls) {
    return '<section class="ps-card' + (cls ? ' ' + cls : '') + '"><div class="ps-card-head"><h2>' + titulo + '</h2>' + (acoes ? '<div class="ps-sp">' + acoes + '</div>' : '') + '</div><div class="ps-card-body">' + corpo + '</div></section>';
  };
  APP.kpi = function (l, v, s, cls) { return '<div class="ps-kpi ' + (cls || '') + '"><span>' + l + '</span><b>' + v + '</b>' + (s ? '<small>' + s + '</small>' : '') + '</div>'; };
  APP.barra = function (v, max, alerta) {
    var w = Math.min(100, v / max * 100), c = v > max ? 'err' : v > alerta ? 'warn' : 'ok';
    return '<div class="iv-lim"><div class="iv-lim-b"><i class="' + c + '" style="width:' + w.toFixed(1) + '%"></i><b style="left:' + (alerta / max * 100).toFixed(1) + '%"></b></div></div>';
  };

  /* Painel lateral */
  APP.painel = function (titulo, html) {
    document.querySelector('[data-pan-t]').innerHTML = titulo;
    document.querySelector('[data-pan-b]').innerHTML = html;
    document.querySelector('[data-pan]').hidden = false;
    document.querySelector('[data-pan-fundo]').hidden = false;
  };
  APP.fecharPan = function () { document.querySelector('[data-pan]').hidden = true; document.querySelector('[data-pan-fundo]').hidden = true; };
  var tt;
  APP.aviso = function (msg, cls) {
    var t = document.querySelector('[data-toast]'); t.className = 'ps-toast ' + (cls || ''); t.textContent = msg; t.hidden = false;
    clearTimeout(tt); tt = setTimeout(function () { t.hidden = true; }, 3200);
  };

  /* Navegacao */
  var PAG = { inicio: 'Inicio', instrumentos: 'Instrumentos', instrumento: 'Instrumento', carteiras: 'Carteiras', posicoes: 'Posicoes', afetacoes: 'Afetacoes', operacoes: 'Operacoes', valorizacoes: 'Valorizacoes', imparidade: 'Imparidade', limites: 'Limites', contabilidade: 'Contabilidade', relatorios: 'Relatorios', aprovacoes: 'Aprovacoes', trilho: 'Trilho', backoffice: 'Backoffice' };
  APP.q = {};
  APP.ir = function (url) { location.hash = '#' + url; };
  function rota() {
    var h = (location.hash || '#/inicio/').slice(1), partes = h.split('?'), nome = partes[0].replace(/^\/|\/$/g, '') || 'inicio';
    APP.q = {}; (partes[1] || '').split('&').forEach(function (kv) { if (kv) { var p = kv.split('='); APP.q[p[0]] = decodeURIComponent(p[1] || ''); } });
    var pag = PAG[nome] || 'Inicio';
    document.querySelectorAll('[data-pagina]').forEach(function (s) { s.hidden = s.getAttribute('data-pagina') !== pag; });
    document.querySelectorAll('[data-nav]').forEach(function (a) { a.classList.toggle('on', a.getAttribute('data-nav') === pag || (pag === 'Instrumento' && a.getAttribute('data-nav') === 'Instrumentos')); });
    document.querySelectorAll('[data-nav-grp]').forEach(function (g) { g.classList.toggle('on', !!g.querySelector('.ps-h-link.on')); });
    document.querySelector('.ps-h').classList.remove('open');
    APP.fecharPan();
    var sec = document.querySelector('[data-pagina="' + pag + '"]');
    sec.querySelectorAll('[data-bloco]').forEach(function (b) { var f = APP.blocos[b.getAttribute('data-bloco')]; b.innerHTML = f ? f() : ''; });
    window.scrollTo(0, 0);
  }
  APP.render = rota;

  document.addEventListener('click', function (ev) {
    var a = ev.target.closest('a[href^="/"]');
    if (a) { ev.preventDefault(); APP.ir(a.getAttribute('href')); return; }
    var b = ev.target.closest('[data-a]');
    if (b && APP.acoes[b.getAttribute('data-a')]) { ev.preventDefault(); APP.acoes[b.getAttribute('data-a')](b.getAttribute('data-v'), b, ev); }
    if (ev.target.matches('[data-pan-fundo]')) APP.fecharPan();
  });
  document.addEventListener('input', function (ev) { var f = ev.target.closest('[data-on]'); if (f && APP.acoes[f.getAttribute('data-on')]) APP.acoes[f.getAttribute('data-on')](f.value, f, ev); });
  document.addEventListener('change', function (ev) { var f = ev.target.closest('[data-on]'); if (f && f.tagName === 'SELECT' && APP.acoes[f.getAttribute('data-on')]) APP.acoes[f.getAttribute('data-on')](f.value, f, ev); });
  document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') APP.fecharPan(); });

  APP.acoes = {
    fecharPan: APP.fecharPan,
    toggleNav: function () { document.querySelector('.ps-h').classList.toggle('open'); }
  };

  window.addEventListener('hashchange', function () { if (window.INV) rota(); });

  /* Chamadas ao Supabase: so funcoes (RPC). As tabelas nao se leem com a chave publica (001_inv_esquema.sql) */
  APP.rpc = function (fn, corpo) {
    var C = window.INV_BACKEND;
    corpo = Object.assign({ p_utilizador: APP.utilizador ? APP.utilizador.login : '' }, corpo || {});
    return fetch(C.url + '/rest/v1/rpc/' + fn, { method: 'POST', headers: { apikey: C.chave, Authorization: 'Bearer ' + C.chave, 'Content-Type': 'application/json' }, body: JSON.stringify(corpo) })
      .then(function (r) {
        return r.text().then(function (t) {
          var v = t ? JSON.parse(t) : null;
          if (!r.ok) throw new Error(v && v.message ? v.message : 'Supabase ' + r.status);
          return v;
        });
      });
  };
  APP.recarregar = function () { return APP.rpc('inv_dados').then(function (d) { window.INV = d; APP.iniciar(); }); };

  /* Arranque, depois de inv-acesso.js confirmar o utilizador e trazer os dados */
  APP.iniciar = function () {
    var u = APP.utilizador || { nome: '' };
    document.querySelector('[data-campo="data-ref"]').textContent = APP.dt(INV.dataRef);
    var av = document.querySelector('[data-campo="avatar"]');
    if (av) av.textContent = u.nome.split(/\s+/).filter(Boolean).map(function (p) { return p[0]; }).slice(0, 2).join('');
    var pend = INV.aprovacoes.filter(function (a) { return a.por !== u.nome; }).length;
    var n = document.querySelector('[data-campo="nav-aprov"]'); if (n) { n.textContent = pend; n.hidden = !pend; }
    APP.preparar();
    rota();
  };
  APP.acoes.menuConta = function () {
    var m = document.querySelector('[data-menu]'), u = APP.utilizador || {};
    if (!m.hidden) { m.hidden = true; return; }
    m.innerHTML = '<div class="ps-menu-head"><b>' + APP.e(u.nome) + '</b>' + APP.e(u.login) + ' · ' + APP.e(u.perfil) + '</div><div class="ps-menu-sec"><button type="button" class="ps-menu-it" data-a="sair">Sign out<small>Forget this user on this browser</small></button></div>';
    m.hidden = false;
  };
  document.addEventListener('click', function (ev) { var m = document.querySelector('[data-menu]'); if (m && !m.hidden && !ev.target.closest('[data-menu],[data-a="menuConta"]')) m.hidden = true; });
})();
