-- Migration to fix RPC signatures and ensure strict types (UUIDs) as requested
-- Also enforces strict RBAC using is_staff/is_admin

create or replace function public.is_staff()
returns boolean
language plpgsql
security definer
as $$
begin
  -- Check if user has admin, teacher or professor role
  return exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role in ('admin', 'teacher', 'professor')
  );
end;
$$;

-- Alias is_admin to is_staff if needed for the specific requirement
-- "Regra: se NOT public.is_admin() => raise exception"
create or replace function public.is_admin()
returns boolean
language plpgsql
security definer
as $$
begin
  return public.is_staff();
end;
$$;


-- 1) public.listar_alunos
drop function if exists public.listar_alunos;
create or replace function public.listar_alunos(
  p_limit int default 50,
  p_offset int default 0,
  p_search text default null
)
returns table (
  id uuid,
  nome text,
  email text,
  telefone text,
  data_nascimento date,
  plano_id uuid,
  plano_nome text,
  turma_id uuid,
  turma_nome text,
  ativo boolean,
  dia_vencimento int,
  status text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not allowed';
  end if;

  return query
  select
    a.id,
    a.nome,
    a.email,
    a.telefone,
    a.data_nascimento,
    a.plano_id,
    p.nome as plano_nome,
    a.turma_id,
    t.nome as turma_nome,
    a.ativo,
    a.dia_vencimento,
    case when a.ativo then 'Ativo'::text else 'Inativo'::text end as status,
    a.created_at
  from public.alunos a
  left join public.planos p on a.plano_id = p.id
  left join public.turmas t on a.turma_id = t.id
  where
    (p_search is null or
     a.nome ilike '%' || p_search || '%' or
     a.email ilike '%' || p_search || '%' or
     a.telefone ilike '%' || p_search || '%')
  order by a.created_at desc
  limit p_limit
  offset p_offset;
end;
$$;


-- 2) public.upsert_aluno
drop function if exists public.upsert_aluno;
create or replace function public.upsert_aluno(
  p_ativo boolean,
  p_data_nascimento date,
  p_dia_vencimento int,
  p_email text,
  p_nome text,
  p_plano_id uuid,
  p_telefone text,
  p_turma_id uuid
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if not public.is_admin() then
    raise exception 'not allowed';
  end if;

  -- Check if email exists
  select id into v_id from public.alunos where email = p_email limit 1;

  if v_id is not null then
    -- Update
    update public.alunos
    set
      nome = p_nome,
      telefone = p_telefone,
      data_nascimento = p_data_nascimento,
      plano_id = p_plano_id,
      turma_id = p_turma_id,
      dia_vencimento = p_dia_vencimento,
      ativo = p_ativo,
      updated_at = now()
    where id = v_id;
  else
    -- Insert
    insert into public.alunos (
      nome, email, telefone, data_nascimento,
      plano_id, turma_id, dia_vencimento, ativo
    ) values (
      p_nome, p_email, p_telefone, p_data_nascimento,
      p_plano_id, p_turma_id, p_dia_vencimento, p_ativo
    ) returning id into v_id;
  end if;

  return json_build_object('ok', true, 'aluno_id', v_id);
end;
$$;


-- 3) public.listar_pagamentos
drop function if exists public.listar_pagamentos;
create or replace function public.listar_pagamentos(
  p_aluno_id uuid default null,
  p_inicio date default null,
  p_fim date default null,
  p_status text default null,
  p_limit int default 50,
  p_offset int default 0
)
returns table (
  id uuid,
  aluno_id uuid,
  aluno_nome text,
  valor numeric,
  mes_ref date,
  status text,
  observacao text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not allowed';
  end if;

  return query
  select
    pg.id,
    pg.aluno_id,
    a.nome as aluno_nome,
    pg.valor,
    pg.mes_ref, -- Assuming column is mes_ref or we map data_vencimento? Spec says mes_ref query: public.pagamentos...
    pg.status,
    pg.observacao,
    pg.created_at
  from public.pagamentos pg
  join public.alunos a on pg.aluno_id = a.id
  where
    (p_aluno_id is null or pg.aluno_id = p_aluno_id)
    and (p_status is null or pg.status = p_status)
    and (p_inicio is null or pg.mes_ref >= p_inicio)
    and (p_fim is null or pg.mes_ref <= p_fim)
  order by pg.mes_ref desc, pg.created_at desc
  limit p_limit
  offset p_offset;
end;
$$;


-- 4) public.upsert_pagamento
drop function if exists public.upsert_pagamento;
create or replace function public.upsert_pagamento(
  p_aluno_id uuid,
  p_valor numeric,
  p_mes_ref date,
  p_status text,
  p_observacao text default null
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if not public.is_admin() then
    raise exception 'not allowed';
  end if;

  insert into public.pagamentos (
    aluno_id, valor, mes_ref, status, observacao
  ) values (
    p_aluno_id, p_valor, p_mes_ref, p_status, p_observacao
  ) returning id into v_id;

  return json_build_object('ok', true, 'pagamento_id', v_id);
end;
$$;


-- 5) Permissions
revoke all on public.alunos from anon, authenticated;
revoke all on public.pagamentos from anon, authenticated;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.listar_alunos(int, int, text) to authenticated;
grant execute on function public.upsert_aluno(boolean, date, int, text, text, uuid, text, uuid) to authenticated;
grant execute on function public.listar_pagamentos(uuid, date, date, text, int, int) to authenticated;
grant execute on function public.upsert_pagamento(uuid, numeric, date, text, text) to authenticated;
