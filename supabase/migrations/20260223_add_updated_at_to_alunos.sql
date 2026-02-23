-- Add updated_at column to public.alunos
alter table public.alunos
add column if not exists updated_at timestamptz not null default now();

-- Create trigger function for updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Apply trigger to alunos table
drop trigger if exists trg_set_updated_at_alunos on public.alunos;

create trigger trg_set_updated_at_alunos
before update on public.alunos
for each row
execute function public.set_updated_at();
