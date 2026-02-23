-- 1) Alunos RLS
alter table public.alunos enable row level security;

drop policy if exists "staff read alunos" on public.alunos;
create policy "staff read alunos"
on public.alunos
for select
to authenticated
using (public.is_admin());

drop policy if exists "staff manage alunos" on public.alunos;
create policy "staff manage alunos"
on public.alunos
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- 2) Planos RLS
alter table public.planos enable row level security;

drop policy if exists "staff read planos" on public.planos;
create policy "staff read planos"
on public.planos
for select
to authenticated
using (public.is_admin());

drop policy if exists "staff manage planos" on public.planos;
create policy "staff manage planos"
on public.planos
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- 3) Turmas RLS
alter table public.turmas enable row level security;

drop policy if exists "staff read turmas" on public.turmas;
create policy "staff read turmas"
on public.turmas
for select
to authenticated
using (public.is_admin());

drop policy if exists "staff manage turmas" on public.turmas;
create policy "staff manage turmas"
on public.turmas
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- 4) Revoke access to old/non-existent RPCs (optional but good practice)
-- These might not exist yet or fail if already dropped, but we want to ensure security
-- revoke execute on function public.upsert_aluno from authenticated;
-- revoke execute on function public.listar_planos from authenticated;
-- revoke execute on function public.listar_turmas from authenticated;
