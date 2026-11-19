-- Investment Hub: termos e regras do PCES em vigor (Norma Regulamentar n.º 9/2022-R), pedido do André a 19 de novembro de 2026.
-- Para uma base criada com a versao anterior do 001. Numa base nova basta o 001 (ja inclui isto) e o 002.
-- 1. Codigos das classificacoes IFRS 9 com as siglas do mercado: JVORI -> FVOCI, JVORI-AC -> FVOCI-EQ, JVR -> FVTPL
alter table public.inv_lotes drop constraint if exists inv_lotes_classificacao_check;
update public.inv_lotes set classificacao = case classificacao when 'JVORI' then 'FVOCI' when 'JVORI-AC' then 'FVOCI-EQ' when 'JVR' then 'FVTPL' else classificacao end;
alter table public.inv_lotes add constraint inv_lotes_classificacao_check check (classificacao in ('CA','FVOCI','FVOCI-EQ','FVTPL'));
-- 2. Classe de contas da carteira (20 Vida, 21 componente de deposito, 22 Nao Vida, 23 nao afetos)
alter table public.inv_carteiras add column if not exists classe_contas text not null default '23' check (classe_contas in ('20','21','22','23'));
-- 3. A funcao inv_dados passa a devolver a classe ('classe'): voltar a correr o create or replace function public.inv_dados do 001.
-- 4. Dados: voltar a correr o 002 (tipos da tabela 9, "Valores livres", modelos de negocio e regras com as contas do PCES).
