/* ============================================================================
   inv-acesso.js - entrada so com nome de utilizador, como no ON (portal-acesso.js)
   Antes de abrir a plataforma pede o utilizador. Sem palavra-passe: o nome e confirmado
   no Supabase (inv_acesso_entrar, 001_inv_esquema.sql) e, se estiver ativo em inv_acessos,
   os dados vem de inv_dados. Para ja so andreborges tem acesso.
   Nao e seguranca forte (quem souber um nome ativo entra): serve para limitar quem abre
   o ambiente de demonstracao. No Power Pages a entrada e a autenticacao do site.
   ============================================================================ */
(function () {
  'use strict';
  var CHAVE = 'inv_acesso';
  var ler = function () { try { return JSON.parse(localStorage.getItem(CHAVE)); } catch (e) { return null; } };
  var gravar = function (a) { try { localStorage.setItem(CHAVE, JSON.stringify(a)); } catch (e) { /* fica so nesta janela */ } };
  var esquecer = function () { try { localStorage.removeItem(CHAVE); } catch (e) { /* nada a limpar */ } };

  var confirmar = function (nome) {
    return APP.rpc('inv_acesso_entrar', { p_utilizador: nome }).then(function (v) { return v && v.login ? v : null; });
  };
  var abrir = function (a) {
    APP.utilizador = a;
    return APP.rpc('inv_dados').then(function (d) { window.INV = d; APP.iniciar(); });
  };

  var ecra = function () {
    var el = document.createElement('div');
    el.className = 'ps-acesso';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-labelledby', 'ac-tit');
    el.innerHTML = '<div class="ps-ent"><div class="ps-ent-esq ps-fundo-marca"><div><b class="ps-acesso-marca">Investment Hub</b>' +
      '<h1>Insurance investment portfolios, controlled and accounted for in one place.</h1>' +
      '<p>Bonds, listed equity and unlisted participations: allocation to technical provisions, IFRS 9 and Solvency II, every figure explained and every change approved.</p></div>' +
      '<ul class="ps-ent-pontos"><li><b>One register</b>Instruments, lots, positions and portfolios kept apart</li><li><b>Four eyes</b>Whoever records does not approve</li><li><b>Explained</b>Amortised cost, accrued interest and ECL step by step</li></ul></div>' +
      '<div class="ps-ent-dir"><h2 id="ac-tit">Sign in</h2><p class="ps-mut">Enter your username or email.</p>' +
      '<form class="ps-login" novalidate><div class="ps-campo"><label class="ps-lab" for="ac-user">Username or email</label>' +
      '<input id="ac-user" class="ps-in" type="text" autocomplete="username" autocapitalize="none" spellcheck="false" required></div>' +
      '<div class="ps-aviso err" role="alert" data-acesso-erro hidden></div>' +
      '<button type="submit" class="ps-btn pri">Continue</button></form></div></div>';
    document.body.appendChild(el);
    document.body.classList.add('ps-acesso-on');
    var form = el.querySelector('form'), input = el.querySelector('input'), btn = el.querySelector('button'), erro = el.querySelector('[data-acesso-erro]');
    var aviso = function (t) { erro.textContent = t; erro.hidden = !t; };
    var pronto = function () { btn.disabled = false; btn.textContent = 'Continue'; };
    input.focus();
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var nome = input.value.trim();
      if (!nome) { aviso('Enter your username or email.'); return; }
      btn.disabled = true; btn.textContent = 'Checking'; aviso('');
      confirmar(nome).then(function (a) {
        if (!a) { pronto(); aviso('This user has no access. Ask the platform owner to add you.'); input.select(); return; }
        gravar(a);
        return abrir(a).then(function () { el.remove(); document.body.classList.remove('ps-acesso-on'); });
      }).catch(function () { pronto(); aviso('Could not reach the server. Check your connection and try again.'); });
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    var g = ler();
    if (!g || !g.login) return ecra();
    /* Volta a confirmar em cada visita: se o acesso foi retirado, pede o nome outra vez */
    confirmar(g.login).then(function (a) {
      if (!a) { esquecer(); return ecra(); }
      gravar(a);
      return abrir(a);
    }).catch(function () { ecra(); });
  });

  APP.acoes.sair = function () { esquecer(); location.hash = ''; location.reload(); };
})();
