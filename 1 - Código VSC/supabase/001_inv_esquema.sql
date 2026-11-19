-- Investment Hub: esquema no Supabase (mesmo projeto do ON, tabelas com o prefixo inv_).
-- Modelo da secao 6 da especificacao, simplificado para o mockup.
-- Seguranca: RLS ligado e sem permissoes para anon/authenticated. Nada se le ou escreve diretamente com a chave publica:
-- o navegador so chama as funcoes inv_acesso_entrar, inv_dados e inv_decidir, que confirmam o utilizador em inv_acessos.

-- Acessos (igual ao esg_acessos do ON): entrada so com nome de utilizador, sem palavra-passe
create table if not exists public.inv_acessos (
  utilizador text primary key check (utilizador = lower(btrim(utilizador)) and utilizador <> ''),
  nome text not null,
  perfil text not null default 'backoffice' check (perfil in ('admin','backoffice','contabilidade','risco','aprovador','auditor')),
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  ultimo_acesso timestamptz
);

create table if not exists public.inv_parametros (
  chave text primary key,
  valor jsonb not null
);

create table if not exists public.inv_entidades (
  id text primary key,
  nome text not null,
  moeda text not null default 'EUR',
  metodo_lotes text not null
);

create table if not exists public.inv_carteiras (
  id text primary key,
  entidade_id text not null references public.inv_entidades(id),
  nome text not null,
  tipo text not null,
  afeto boolean not null,
  ramo text,
  modelo_negocio text not null,
  carteira_sii text not null,
  provisoes_tecnicas numeric(18,2) not null default 0,
  fundo_autonomo text,
  ordem int not null default 0
);

create table if not exists public.inv_emitentes (
  id text primary key,
  nome text not null,
  tipo text not null,
  pais text not null,
  nace text,
  rating text,
  rating_anterior text,
  grupo text
);

create table if not exists public.inv_instrumentos (
  id text primary key,
  isin text unique,
  codigo text,
  nome text not null,
  tipo text not null check (tipo in ('obr','acao','part','fundo','dep')),
  emitente_id text not null references public.inv_emitentes(id),
  cic text not null,
  taxa numeric(12,8),
  frequencia int,
  base_dias text,
  data_emissao date,
  data_vencimento date,
  nominal_unitario numeric(18,2),
  preco numeric(18,6) not null,
  nivel_jv int not null check (nivel_jv in (1,2,3)),
  sppi text,
  fonte_preco text not null,
  excecao_preco text,
  preco_manual boolean not null default false,
  relacao text,
  participacao numeric(8,6),
  ordem int not null default 0
);

create table if not exists public.inv_lotes (
  id text primary key,
  instrumento_id text not null references public.inv_instrumentos(id),
  carteira_id text not null references public.inv_carteiras(id),
  data_aquisicao date not null,
  quantidade numeric(18,2) not null,
  quantidade_inicial numeric(18,2),
  preco_aquisicao numeric(18,6) not null,
  classificacao text not null check (classificacao in ('CA','JVORI','JVORI-AC','JVR')),
  rating_aquisicao text
);

create table if not exists public.inv_afetacoes (
  id text primary key,
  data_efetiva date not null,
  lote_id text not null references public.inv_lotes(id),
  quantidade numeric(18,2) not null,
  carteira_origem text,
  carteira_destino text not null references public.inv_carteiras(id),
  motivo text not null,
  registado_por text not null,
  registado_em timestamptz not null default now(),
  aprovado_por text,
  aprovado_em timestamptz,
  estado text not null
);

create table if not exists public.inv_operacoes (
  id text primary key,
  tipo text not null,
  instrumento_id text not null references public.inv_instrumentos(id),
  carteira_id text not null references public.inv_carteiras(id),
  data_negociacao date not null,
  data_liquidacao date not null,
  quantidade numeric(18,2) not null,
  preco numeric(18,6),
  juro_corrido numeric(18,2),
  valor numeric(18,2),
  imposto_retido numeric(18,2),
  estado text not null,
  registado_por text not null,
  aprovado_por text,
  nota text
);

create table if not exists public.inv_aprovacoes (
  ref text primary key,
  tipo text not null,
  descricao text not null,
  pedido_por text not null,
  pedido_em timestamptz not null,
  impacto text,
  estado text not null default 'Pending approval' check (estado in ('Pending approval','Approved','Rejected')),
  decidido_por text,
  decidido_em timestamptz,
  motivo text
);

-- Trilho de auditoria: so se acrescenta
create table if not exists public.inv_trilho (
  id bigint generated always as identity primary key,
  em timestamptz not null default now(),
  utilizador text not null,
  objeto text not null,
  registo text not null,
  campo text not null,
  valor_anterior text,
  valor_novo text,
  motivo text,
  origem text not null
);

create table if not exists public.inv_limites (
  id int primary key,
  dimensao text not null,
  alvo text not null,
  base text not null,
  alerta numeric(8,6) not null,
  maximo numeric(8,6) not null,
  origem text not null,
  justificacao text
);

create table if not exists public.inv_fecho_passos (
  ordem int primary key,
  titulo text not null,
  estado text not null check (estado in ('ok','warn','todo')),
  detalhe text
);

create table if not exists public.inv_regras_contabilisticas (
  id int primary key,
  evento text not null,
  classificacao text not null,
  carteira text not null,
  tipo_ativo text not null,
  conta_debito text not null,
  conta_credito text not null
);

create table if not exists public.inv_pd (rating text primary key, pd_12m numeric(10,8) not null, ordem int not null);
create table if not exists public.inv_lgd (tipo_emitente text primary key, lgd numeric(6,4) not null);

-- RLS ligado em todas e sem permissoes diretas
do $$ declare t text; begin
  foreach t in array array['inv_acessos','inv_parametros','inv_entidades','inv_carteiras','inv_emitentes','inv_instrumentos','inv_lotes','inv_afetacoes','inv_operacoes','inv_aprovacoes','inv_trilho','inv_limites','inv_fecho_passos','inv_regras_contabilisticas','inv_pd','inv_lgd'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
  end loop;
end $$;

-- Confirma um utilizador (ou um email: conta o que vem antes do @). Devolve a pessoa ou null
create or replace function public.inv_acesso_entrar(p_utilizador text) returns jsonb
language sql volatile security definer set search_path = '' as $$
  update public.inv_acessos set ultimo_acesso = now()
  where utilizador = split_part(lower(btrim(p_utilizador)), '@', 1) and ativo
  returning jsonb_build_object('login', utilizador, 'nome', nome, 'perfil', perfil)
$$;

-- Nome da pessoa com acesso ativo, ou null (uso interno)
create or replace function public.inv_quem(p_utilizador text) returns text
language sql stable security definer set search_path = '' as $$
  select nome from public.inv_acessos where utilizador = split_part(lower(btrim(p_utilizador)), '@', 1) and ativo
$$;

-- Todos os dados da plataforma, no formato do ecra (window.INV). Erro se o utilizador nao tiver acesso
create or replace function public.inv_dados(p_utilizador text) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare r jsonb;
begin
  if public.inv_quem(p_utilizador) is null then raise exception 'no access' using errcode = '42501'; end if;
  select jsonb_build_object(
    'dataRef', (select valor #>> '{}' from public.inv_parametros where chave = 'data_ref'),
    'periodo', (select valor #>> '{}' from public.inv_parametros where chave = 'periodo'),
    'entidade', (select jsonb_build_object('id', id, 'nome', nome, 'moeda', moeda, 'metodoLotes', metodo_lotes) from public.inv_entidades order by id limit 1),
    'carteiras', coalesce((select jsonb_agg(jsonb_strip_nulls(jsonb_build_object('id', id, 'nome', nome, 'tipo', tipo, 'afeto', afeto, 'ramo', ramo, 'modelo', modelo_negocio, 'sii', carteira_sii, 'pt', provisoes_tecnicas, 'rff', fundo_autonomo)) order by ordem) from public.inv_carteiras), '[]'),
    'emitentes', coalesce((select jsonb_object_agg(id, jsonb_strip_nulls(jsonb_build_object('nome', nome, 'tipo', tipo, 'pais', pais, 'nace', nace, 'rating', rating, 'ratingAnt', rating_anterior, 'grupo', grupo))) from public.inv_emitentes), '{}'),
    'instrumentos', coalesce((select jsonb_agg(jsonb_strip_nulls(jsonb_build_object('id', id, 'isin', coalesce(isin, ''), 'codigo', codigo, 'nome', nome, 'tipo', tipo, 'em', emitente_id, 'cic', cic, 'taxa', taxa, 'freq', frequencia, 'base', base_dias,
        'emissao', data_emissao, 'venc', data_vencimento, 'nom', nominal_unitario, 'preco', preco, 'nivel', nivel_jv, 'sppi', sppi, 'fonte', fonte_preco, 'excecao', excecao_preco, 'manual', nullif(preco_manual, false), 'relacao', relacao, 'pct', participacao)) order by ordem) from public.inv_instrumentos), '[]'),
    'lotes', coalesce((select jsonb_agg(jsonb_strip_nulls(jsonb_build_object('id', id, 'i', instrumento_id, 'c', carteira_id, 'd', data_aquisicao, 'q', quantidade, 'q0', quantidade_inicial, 'p', preco_aquisicao, 'cl', classificacao, 'rt', rating_aquisicao)) order by id) from public.inv_lotes), '[]'),
    'pd12', coalesce((select jsonb_object_agg(rating, pd_12m) from public.inv_pd), '{}'),
    'lgd', coalesce((select jsonb_object_agg(tipo_emitente, lgd) from public.inv_lgd), '{}'),
    'limites', coalesce((select jsonb_agg(jsonb_strip_nulls(jsonb_build_object('dim', dimensao, 'alvo', alvo, 'base', base, 'alerta', alerta, 'max', maximo, 'origem', origem, 'justif', justificacao)) order by id) from public.inv_limites), '[]'),
    'afetacoes', coalesce((select jsonb_agg(jsonb_strip_nulls(jsonb_build_object('id', id, 'data', data_efetiva, 'lote', lote_id, 'q', quantidade, 'de', coalesce(carteira_origem, '-'), 'para', carteira_destino, 'motivo', motivo, 'por', registado_por,
        'em', to_char(registado_em at time zone 'Europe/Lisbon', 'YYYY-MM-DD HH24:MI'), 'apr', aprovado_por, 'aprEm', to_char(aprovado_em at time zone 'Europe/Lisbon', 'YYYY-MM-DD HH24:MI'), 'estado', estado)) order by registado_em desc) from public.inv_afetacoes), '[]'),
    'operacoes', coalesce((select jsonb_agg(jsonb_strip_nulls(jsonb_build_object('id', id, 'tipo', tipo, 'i', instrumento_id, 'c', carteira_id, 'neg', data_negociacao, 'liq', data_liquidacao, 'q', quantidade, 'preco', preco, 'jc', juro_corrido, 'valor', valor, 'ret', imposto_retido,
        'estado', estado, 'por', registado_por, 'apr', aprovado_por, 'nota', nota)) order by id desc) from public.inv_operacoes), '[]'),
    'aprovacoes', coalesce((select jsonb_agg(jsonb_build_object('tipo', tipo, 'ref', ref, 'desc', descricao, 'por', pedido_por, 'em', to_char(pedido_em at time zone 'Europe/Lisbon', 'YYYY-MM-DD HH24:MI'), 'imp', coalesce(impacto, '')) order by pedido_em) from public.inv_aprovacoes where estado = 'Pending approval'), '[]'),
    'trilho', coalesce((select jsonb_agg(jsonb_build_object('em', to_char(em at time zone 'Europe/Lisbon', 'YYYY-MM-DD HH24:MI'), 'u', utilizador, 't', objeto, 'reg', registo, 'campo', campo, 'ant', coalesce(valor_anterior, '-'), 'novo', coalesce(valor_novo, '-'), 'mot', coalesce(motivo, ''), 'orig', origem) order by em desc, id desc) from public.inv_trilho), '[]'),
    'fecho', coalesce((select jsonb_agg(jsonb_build_object('t', titulo, 's', estado, 'd', detalhe) order by ordem) from public.inv_fecho_passos), '[]'),
    'regras', coalesce((select jsonb_agg(jsonb_build_object('ev', evento, 'cl', classificacao, 'cart', carteira, 'at', tipo_ativo, 'd', conta_debito, 'c', conta_credito) order by id) from public.inv_regras_contabilisticas), '[]')
  ) into r;
  return r;
end $$;

-- Aprovar ou rejeitar um pedido (R-18: quem pediu nao decide). Atualiza o objeto ligado e escreve no trilho
create or replace function public.inv_decidir(p_utilizador text, p_ref text, p_aprovar boolean, p_motivo text default null) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare quem text := public.inv_quem(p_utilizador); a public.inv_aprovacoes; novo text;
begin
  if quem is null then raise exception 'no access' using errcode = '42501'; end if;
  select * into a from public.inv_aprovacoes where ref = p_ref for update;
  if a.ref is null or a.estado <> 'Pending approval' then raise exception 'not pending'; end if;
  if a.pedido_por = quem then raise exception 'You recorded this: another person approves (R-18)'; end if;
  if not p_aprovar and coalesce(btrim(p_motivo), '') = '' then raise exception 'A reason is mandatory to reject'; end if;
  novo := case when p_aprovar then 'Approved' else 'Rejected' end;
  update public.inv_aprovacoes set estado = novo, decidido_por = quem, decidido_em = now(), motivo = p_motivo where ref = p_ref;
  update public.inv_operacoes set estado = novo, aprovado_por = quem where id = p_ref;
  update public.inv_afetacoes set estado = novo, aprovado_por = quem, aprovado_em = now() where id = p_ref;
  if p_aprovar then update public.inv_lotes l set carteira_id = af.carteira_destino from public.inv_afetacoes af where af.id = p_ref and l.id = af.lote_id and af.quantidade >= l.quantidade; end if;
  insert into public.inv_trilho (utilizador, objeto, registo, campo, valor_anterior, valor_novo, motivo, origem)
    values (quem, a.tipo, p_ref, 'State', 'Pending approval', novo, p_motivo, 'Screen');
  return jsonb_build_object('ref', p_ref, 'estado', novo);
end $$;

-- Registar uma reafetacao para aprovacao (R-15, R-24). A afetacao so muda quando outra pessoa aprova
create or replace function public.inv_reafetar(p_utilizador text, p_lote text, p_quantidade numeric, p_destino text, p_data date, p_motivo text) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare quem text := public.inv_quem(p_utilizador); l public.inv_lotes; novo_id text; ins text;
begin
  if quem is null then raise exception 'no access' using errcode = '42501'; end if;
  if coalesce(btrim(p_motivo), '') = '' then raise exception 'The reason is mandatory'; end if;
  select * into l from public.inv_lotes where id = p_lote;
  if l.id is null then raise exception 'Unknown lot'; end if;
  if l.carteira_id = p_destino then raise exception 'Origin and destination are the same portfolio'; end if;
  if p_quantidade is null or p_quantidade <= 0 or p_quantidade > l.quantidade then raise exception 'Quantity must be between 0 and the lot quantity'; end if;
  select 'AF-' || lpad((coalesce(max(substr(id, 4)::int), 0) + 1)::text, 4, '0') into novo_id from public.inv_afetacoes;
  select nome into ins from public.inv_instrumentos where id = l.instrumento_id;
  insert into public.inv_afetacoes (id, data_efetiva, lote_id, quantidade, carteira_origem, carteira_destino, motivo, registado_por, estado)
    values (novo_id, p_data, p_lote, p_quantidade, l.carteira_id, p_destino, p_motivo, quem, 'Pending approval');
  insert into public.inv_aprovacoes (ref, tipo, descricao, pedido_por, pedido_em, impacto)
    values (novo_id, 'Reallocation', ins || ' · ' || p_quantidade || ' · ' || l.carteira_id || ' → ' || p_destino, quem, now(), p_motivo);
  insert into public.inv_trilho (utilizador, objeto, registo, campo, valor_anterior, valor_novo, motivo, origem)
    values (quem, 'Allocation', novo_id, 'Portfolio', l.carteira_id, p_destino || ' (pending)', p_motivo, 'Screen');
  return jsonb_build_object('id', novo_id);
end $$;

revoke execute on function public.inv_quem(text) from public, anon, authenticated;
revoke execute on function public.inv_acesso_entrar(text), public.inv_dados(text), public.inv_decidir(text, text, boolean, text), public.inv_reafetar(text, text, numeric, text, date, text) from public;
grant execute on function public.inv_acesso_entrar(text), public.inv_dados(text), public.inv_decidir(text, text, boolean, text), public.inv_reafetar(text, text, numeric, text, date, text) to anon, authenticated;

-- Primeiro e unico utilizador, por agora: André Borges (administrador). Pedido do André, 19 de novembro de 2026
insert into public.inv_acessos (utilizador, nome, perfil) values ('andreborges', 'André Borges', 'admin')
on conflict (utilizador) do update set nome = excluded.nome, perfil = excluded.perfil, ativo = true;
-- Para acrescentar pessoas: repetir o insert com outro utilizador. Para tirar o acesso: update public.inv_acessos set ativo = false where utilizador = '...';
