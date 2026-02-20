-- FUNCTION: public.is_staff()
-- Returns true if the current user has a staff role (admin, teacher, professor).
create or replace function public.is_staff()
returns boolean
language plpgsql
security definer
as $$
declare
  v_role text;
begin
  select role into v_role
  from public.profiles
  where id = auth.uid();
  
  return v_role in ('admin', 'teacher', 'professor');
end;
$$;

-- RPC: listar_alunos
-- Lists students with optional search and pagination.
create or replace function public.listar_alunos(
  p_search text default null,
  p_limit int default 50,
  p_offset int default 0
)
returns table (
  id bigint,
  nome text,
  email text,
  telefone text,
  data_nascimento date,
  plano_id bigint,
  turma_id bigint,
  ativo boolean,
  dia_vencimento int,
  criado_em timestamptz,
  plano_nome text,
  turma_nome text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_staff() then
    raise exception 'Acesso negado.';
  end if;

  return query
  select 
    a.id,
    a.nome,
    a.email,
    a.telefone,
    a.data_nascimento,
    a.plano_id,
    a.turma_id,
    a.ativo,
    a.dia_vencimento,
    a.criado_em,
    p.nome as plano_nome,
    t.nome as turma_nome
  from public.alunos a
  left join public.planos p on a.plano_id = p.id
  left join public.turmas t on a.turma_id = t.id
  where (
    p_search is null or 
    a.nome ilike '%' || p_search || '%' or
    a.email ilike '%' || p_search || '%' or
    a.telefone ilike '%' || p_search || '%'
  )
  order by a.criado_em desc
  limit p_limit
  offset p_offset;
end;
$$;

-- RPC: upsert_aluno
-- Creates or updates a student.
create or replace function public.upsert_aluno(
  p_id bigint default null,
  p_nome text default null,
  p_email text default null,
  p_telefone text default null,
  p_data_nascimento date default null,
  p_plano_id bigint default null,
  p_turma_id bigint default null,
  p_ativo boolean default true,
  p_dia_vencimento int default null
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_new_id bigint;
begin
  if not public.is_staff() then
    raise exception 'Acesso negado.';
  end if;

  if p_id is null then
    insert into public.alunos (
      nome, email, telefone, data_nascimento, 
      plano_id, turma_id, ativo, dia_vencimento
    ) values (
      p_nome, p_email, p_telefone, p_data_nascimento,
      p_plano_id, p_turma_id, p_ativo, p_dia_vencimento
    )
    returning id into v_new_id;
    return v_new_id;
  else
    update public.alunos
    set
      nome = coalesce(p_nome, nome),
      email = coalesce(p_email, email),
      telefone = coalesce(p_telefone, telefone),
      data_nascimento = coalesce(p_data_nascimento, data_nascimento),
      plano_id = p_plano_id, -- Allow nullifying
      turma_id = p_turma_id, -- Allow nullifying
      ativo = coalesce(p_ativo, ativo),
      dia_vencimento = p_dia_vencimento -- Allow nullifying
    where id = p_id
    returning id into v_new_id;
    return v_new_id;
  end if;
end;
$$;

-- RPC: listar_pagamentos
-- Lists payments with filters.
create or replace function public.listar_pagamentos(
  p_aluno_id bigint default null,
  p_status text default null,
  p_inicio date default null,
  p_fim date default null,
  p_limit int default 50,
  p_offset int default 0
)
returns table (
  id bigint,
  aluno_id bigint,
  valor numeric,
  data_vencimento date, -- Using data_vencimento as reference date
  status text,
  observacao text,
  criado_em timestamptz,
  aluno_nome text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_staff() then
    raise exception 'Acesso negado.';
  end if;

  return query
  select 
    pg.id,
    pg.aluno_id,
    pg.valor,
    pg.data_vencimento,
    pg.status,
    pg.observacao,
    pg.criado_em,
    a.nome as aluno_nome
  from public.pagamentos pg
  join public.alunos a on pg.aluno_id = a.id
  where (p_aluno_id is null or pg.aluno_id = p_aluno_id)
  and (p_status is null or pg.status = p_status)
  and (p_inicio is null or pg.data_vencimento >= p_inicio)
  and (p_fim is null or pg.data_vencimento <= p_fim)
  order by pg.criado_em desc
  limit p_limit
  offset p_offset;
end;
$$;

-- RPC: registrar_pagamento
-- Registers a new payment manually.
create or replace function public.registrar_pagamento(
  p_aluno_id bigint,
  p_valor numeric,
  p_data_vencimento date,
  p_status text,
  p_observacao text default null
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id bigint;
begin
  if not public.is_staff() then
    raise exception 'Acesso negado.';
  end if;

  insert into public.pagamentos (
    aluno_id, valor, data_vencimento, status, observacao
  ) values (
    p_aluno_id, p_valor, p_data_vencimento, p_status, p_observacao
  )
  returning id into v_id;
  
  return v_id;
end;
$$;

-- RPC: listar_planos
-- Helper for dropdowns.
create or replace function public.listar_planos()
returns table (
  id bigint,
  nome text,
  valor numeric
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_staff() then
    raise exception 'Acesso negado.';
  end if;
  return query select p.id, p.nome, p.valor from public.planos p order by p.valor;
end;
$$;

-- RPC: listar_turmas
-- Helper for dropdowns.
create or replace function public.listar_turmas()
returns table (
  id bigint,
  nome text,
  dias_semana text,
  hora_inicio time,
  hora_fim time
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_staff() then
    raise exception 'Acesso negado.';
  end if;
  return query select t.id, t.nome, t.dias_semana, t.hora_inicio, t.hora_fim from public.turmas t order by t.id;
end;
$$;

-- GRANTS
grant execute on function public.is_staff() to authenticated;
grant execute on function public.listar_alunos(text, int, int) to authenticated;
grant execute on function public.upsert_aluno(bigint, text, text, text, date, bigint, bigint, boolean, int) to authenticated;
grant execute on function public.listar_pagamentos(bigint, text, date, date, int, int) to authenticated;
grant execute on function public.registrar_pagamento(bigint, numeric, date, text, text) to authenticated;
grant execute on function public.listar_planos() to authenticated;
grant execute on function public.listar_turmas() to authenticated;
