-- 1) Create mensalidades table
create table if not exists public.mensalidades (
    id uuid default gen_random_uuid() primary key,
    aluno_id uuid references public.alunos(id) on delete cascade not null,
    ano int not null,
    jan boolean default false,
    fev boolean default false,
    mar boolean default false,
    abr boolean default false,
    mai boolean default false,
    jun boolean default false,
    jul boolean default false,
    ago boolean default false,
    set boolean default false,
    outubro boolean default false,
    nov boolean default false,
    dez boolean default false,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    unique(aluno_id, ano)
);

-- 2) Enable RLS
alter table public.mensalidades enable row level security;

-- Drop existing policy if it exists to avoid errors on reapplying
drop policy if exists "Allow admins full access to mensalidades" on public.mensalidades;

create policy "Allow admins full access to mensalidades"
on public.mensalidades
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- 3) RPC: garantir_mensalidade_ano
create or replace function public.garantir_mensalidade_ano(p_aluno_id uuid, p_ano int)
returns uuid
language plpgsql
security definer
as $$
declare
    v_id uuid;
begin
    if not public.is_admin() then
        raise exception 'not allowed';
    end if;

    insert into public.mensalidades (aluno_id, ano)
    values (p_aluno_id, p_ano)
    on conflict (aluno_id, ano) do update set updated_at = now()
    returning id into v_id;

    return v_id;
end;
$$;

-- 4) RPC: toggle_mensalidade_mes
create or replace function public.toggle_mensalidade_mes(p_aluno_id uuid, p_ano int, p_mes text, p_valor boolean)
returns json
language plpgsql
security definer
as $$
begin
    if not public.is_admin() then
        raise exception 'not allowed';
    end if;

    -- Basic validation for month column name to prevent SQL injection
    if p_mes not in ('jan','fev','mar','abr','mai','jun','jul','ago','set','outubro','nov','dez') then
        raise exception 'Invalid month';
    end if;

    execute format('
        insert into public.mensalidades (aluno_id, ano, %I)
        values ($1, $2, $3)
        on conflict (aluno_id, ano)
        do update set %I = $3, updated_at = now()', p_mes, p_mes)
    using p_aluno_id, p_ano, p_valor;

    return json_build_object('ok', true);
end;
$$;

-- 5) RPC: listar_alunos_com_mensalidades
create or replace function public.listar_alunos_com_mensalidades(p_ano int, p_search text default null)
returns table (
    aluno_id uuid,
    nome text,
    telefone text,
    email text,
    status text,
    dia_vencimento int,
    plano_nome text,
    turma_nome text,
    jan boolean,
    fev boolean,
    mar boolean,
    abr boolean,
    mai boolean,
    jun boolean,
    jul boolean,
    ago boolean,
    set boolean,
    outubro boolean,
    nov boolean,
    dez boolean
)
language plpgsql
security definer
as $$
begin
    if not public.is_admin() then
        raise exception 'not allowed';
    end if;

    return query
    select
        a.id as aluno_id,
        a.nome,
        a.telefone,
        a.email,
        case when a.ativo then 'Ativo'::text else 'Inativo'::text end as status,
        a.dia_vencimento,
        p.nome as plano_nome,
        t.nome as turma_nome,
        coalesce(m.jan, false),
        coalesce(m.fev, false),
        coalesce(m.mar, false),
        coalesce(m.abr, false),
        coalesce(m.mai, false),
        coalesce(m.jun, false),
        coalesce(m.jul, false),
        coalesce(m.ago, false),
        coalesce(m.set, false),
        coalesce(m.outubro, false),
        coalesce(m.nov, false),
        coalesce(m.dez, false)
    from public.alunos a
    left join public.planos p on a.plano_id = p.id
    left join public.turmas t on a.turma_id = t.id
    left join public.mensalidades m on a.id = m.aluno_id and m.ano = p_ano
    where
        (p_search is null or
         a.nome ilike '%' || p_search || '%' or
         a.email ilike '%' || p_search || '%' or
         a.telefone ilike '%' || p_search || '%')
    order by a.nome asc;
end;
$$;

-- 6) Revoke/Grant permissions
revoke all on public.mensalidades from anon, authenticated;
grant select on public.mensalidades to authenticated; -- Optional, mostly via RPC

grant execute on function public.garantir_mensalidade_ano(uuid, int) to authenticated;
grant execute on function public.toggle_mensalidade_mes(uuid, int, text, boolean) to authenticated;
grant execute on function public.listar_alunos_com_mensalidades(int, text) to authenticated;
