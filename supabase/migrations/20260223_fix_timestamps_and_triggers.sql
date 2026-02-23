-- 1) Standardize Column Names (Rename criado_em to created_at)

-- Alunos table
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'alunos' AND column_name = 'criado_em') THEN
    ALTER TABLE public.alunos RENAME COLUMN criado_em TO created_at;
  END IF;
END $$;

-- Pagamentos table
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'pagamentos' AND column_name = 'criado_em') THEN
    ALTER TABLE public.pagamentos RENAME COLUMN criado_em TO created_at;
  END IF;
END $$;

-- profiles table (if it exists and has criado_em)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'criado_em') THEN
    ALTER TABLE public.profiles RENAME COLUMN criado_em TO created_at;
  END IF;
END $$;

-- 2) Re-fix Trigger Function (Ensure strictly updated_at)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- We strictly use updated_at to align with the rest of the project and avoid legacy conflicts
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 3) Ensure triggers use the correct function and column
-- We explicitly drop any trigger that might be referencing legacy function names or columns

-- ALUNOS
DROP TRIGGER IF EXISTS trg_set_updated_at_alunos ON public.alunos;
CREATE TRIGGER trg_set_updated_at_alunos
BEFORE UPDATE ON public.alunos
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- MENSALIDADES
DROP TRIGGER IF EXISTS trg_set_updated_at_mensalidades ON public.mensalidades;
CREATE TRIGGER trg_set_updated_at_mensalidades
BEFORE UPDATE ON public.mensalidades
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- PAGAMENTOS
DROP TRIGGER IF EXISTS trg_set_updated_at_pagamentos ON public.pagamentos;
CREATE TRIGGER trg_set_updated_at_pagamentos
BEFORE UPDATE ON public.pagamentos
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- PLANOS
DROP TRIGGER IF EXISTS trg_set_updated_at_planos ON public.planos;
CREATE TRIGGER trg_set_updated_at_planos
BEFORE UPDATE ON public.planos
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- TURMAS
DROP TRIGGER IF EXISTS trg_set_updated_at_turmas ON public.turmas;
CREATE TRIGGER trg_set_updated_at_turmas
BEFORE UPDATE ON public.turmas
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- PROFILES
DROP TRIGGER IF EXISTS trg_set_updated_at_profiles ON public.profiles;
CREATE TRIGGER trg_set_updated_at_profiles
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();
