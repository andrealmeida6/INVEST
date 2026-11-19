/* Gera 002_inv_dados_demonstracao.sql a partir de dados-demonstracao.js. Correr: node gerar-dados.js nesta pasta.
   Repoe os dados de demonstracao (apaga e volta a inserir as tabelas inv_, exceto inv_acessos). */
const fs = require('fs'), path = require('path'), vm = require('vm');
const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(__dirname, 'dados-demonstracao.js'), 'utf8'), ctx);
const I = ctx.window.INV;
const q = (v) => v == null || v === '' ? 'null' : typeof v === 'number' ? String(v) : typeof v === 'boolean' ? String(v) : "'" + String(v).replace(/'/g, "''") + "'";
const ts = (s) => s ? q(s + ':00 Europe/Lisbon') : 'null';
const ins = (t, cols, linhas) => linhas.length ? 'insert into public.' + t + ' (' + cols.join(', ') + ') values\n' + linhas.map((l) => '  (' + l.join(', ') + ')').join(',\n') + ';\n' : '';
let sql = '-- Gerado por gerar-dados.js a partir de dados-demonstracao.js. Nao editar a mao.\n-- Dados ficticios (Seguradora A). Repoe o estado de demonstracao.\nbegin;\n' +
  'truncate public.inv_trilho, public.inv_aprovacoes, public.inv_afetacoes, public.inv_operacoes, public.inv_lotes, public.inv_instrumentos, public.inv_emitentes, public.inv_carteiras, public.inv_entidades, public.inv_limites, public.inv_fecho_passos, public.inv_regras_contabilisticas, public.inv_pd, public.inv_lgd, public.inv_parametros;\n';
sql += ins('inv_parametros', ['chave', 'valor'], [[q('data_ref'), q(JSON.stringify(I.dataRef))], [q('periodo'), q(JSON.stringify(I.periodo))]]);
sql += ins('inv_entidades', ['id', 'nome', 'moeda', 'metodo_lotes'], [[q(I.entidade.id), q(I.entidade.nome), q(I.entidade.moeda), q(I.entidade.metodoLotes)]]);
sql += ins('inv_carteiras', ['id', 'entidade_id', 'nome', 'tipo', 'afeto', 'ramo', 'classe_contas', 'modelo_negocio', 'carteira_sii', 'provisoes_tecnicas', 'fundo_autonomo', 'ordem'],
  I.carteiras.map((c, n) => [q(c.id), q(I.entidade.id), q(c.nome), q(c.tipo), q(c.afeto), q(c.ramo), q(c.classe), q(c.modelo), q(c.sii), q(c.pt), q(c.rff), n]));
sql += ins('inv_emitentes', ['id', 'nome', 'tipo', 'pais', 'nace', 'rating', 'rating_anterior', 'grupo'],
  Object.keys(I.emitentes).map((k) => { const e = I.emitentes[k]; return [q(k), q(e.nome), q(e.tipo), q(e.pais), q(e.nace), q(e.rating), q(e.ratingAnt), q(e.grupo)]; }));
sql += ins('inv_instrumentos', ['id', 'isin', 'codigo', 'nome', 'tipo', 'emitente_id', 'cic', 'taxa', 'frequencia', 'base_dias', 'data_emissao', 'data_vencimento', 'nominal_unitario', 'preco', 'nivel_jv', 'sppi', 'fonte_preco', 'excecao_preco', 'preco_manual', 'relacao', 'participacao', 'ordem'],
  I.instrumentos.map((i, n) => [q(i.id), q(i.isin), q(i.codigo), q(i.nome), q(i.tipo), q(i.em), q(i.cic), q(i.taxa), q(i.freq), q(i.base), q(i.emissao), q(i.venc), q(i.nom), q(i.preco), q(i.nivel), q(i.sppi), q(i.fonte), q(i.excecao), q(!!i.manual), q(i.relacao), q(i.pct), n]));
sql += ins('inv_lotes', ['id', 'instrumento_id', 'carteira_id', 'data_aquisicao', 'quantidade', 'quantidade_inicial', 'preco_aquisicao', 'classificacao', 'rating_aquisicao'],
  I.lotes.map((l) => [q(l.id), q(l.i), q(l.c), q(l.d), q(l.q), q(l.q0), q(l.p), q(l.cl), q(l.rt)]));
sql += ins('inv_afetacoes', ['id', 'data_efetiva', 'lote_id', 'quantidade', 'carteira_origem', 'carteira_destino', 'motivo', 'registado_por', 'registado_em', 'aprovado_por', 'aprovado_em', 'estado'],
  I.afetacoes.map((a) => [q(a.id), q(a.data), q(a.lote), q(a.q), q(a.de === '-' ? null : a.de), q(a.para), q(a.motivo), q(a.por), ts(a.em), q(a.apr), ts(a.aprEm), q(a.estado)]));
sql += ins('inv_operacoes', ['id', 'tipo', 'instrumento_id', 'carteira_id', 'data_negociacao', 'data_liquidacao', 'quantidade', 'preco', 'juro_corrido', 'valor', 'imposto_retido', 'estado', 'registado_por', 'aprovado_por', 'nota'],
  I.operacoes.map((o) => [q(o.id), q(o.tipo), q(o.i), q(o.c), q(o.neg), q(o.liq), q(o.q), q(o.preco), q(o.jc), q(o.valor), q(o.ret), q(o.estado), q(o.por), q(o.apr), q(o.nota)]));
sql += ins('inv_aprovacoes', ['ref', 'tipo', 'descricao', 'pedido_por', 'pedido_em', 'impacto'], I.aprovacoes.map((a) => [q(a.ref), q(a.tipo), q(a.desc), q(a.por), ts(a.em), q(a.imp)]));
sql += ins('inv_trilho', ['em', 'utilizador', 'objeto', 'registo', 'campo', 'valor_anterior', 'valor_novo', 'motivo', 'origem'],
  I.trilho.slice().reverse().map((t) => [ts(t.em), q(t.u), q(t.t), q(t.reg), q(t.campo), q(t.ant), q(t.novo), q(t.mot), q(t.orig)]));
sql += ins('inv_limites', ['id', 'dimensao', 'alvo', 'base', 'alerta', 'maximo', 'origem', 'justificacao'], I.limites.map((l, n) => [n + 1, q(l.dim), q(l.alvo), q(l.base), q(l.alerta), q(l.max), q(l.origem), q(l.justif)]));
sql += ins('inv_fecho_passos', ['ordem', 'titulo', 'estado', 'detalhe'], I.fecho.map((f, n) => [n + 1, q(f.t), q(f.s), q(f.d)]));
sql += ins('inv_regras_contabilisticas', ['id', 'evento', 'classificacao', 'carteira', 'tipo_ativo', 'conta_debito', 'conta_credito'], I.regras.map((r, n) => [n + 1, q(r.ev), q(r.cl), q(r.cart), q(r.at), q(r.d), q(r.c)]));
sql += ins('inv_pd', ['rating', 'pd_12m', 'ordem'], Object.keys(I.pd12).map((k, n) => [q(k), q(I.pd12[k]), n]));
sql += ins('inv_lgd', ['tipo_emitente', 'lgd'], Object.keys(I.lgd).map((k) => [q(k), q(I.lgd[k])]));
sql += 'commit;\n';
fs.writeFileSync(path.join(__dirname, '002_inv_dados_demonstracao.sql'), sql, 'utf8');
console.log('002_inv_dados_demonstracao.sql: ' + sql.length + ' caracteres');
