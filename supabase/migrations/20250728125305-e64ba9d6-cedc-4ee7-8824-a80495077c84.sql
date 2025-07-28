-- CORREÇÕES DE SEGURANÇA CRÍTICAS

-- 1. Habilitar RLS na tabela keep_alive (CRÍTICO)
ALTER TABLE public.keep_alive ENABLE ROW LEVEL SECURITY;

-- Política para administradores gerenciarem keep_alive
CREATE POLICY "Admins can manage keep_alive records" 
ON public.keep_alive 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- 2. Remover políticas RLS duplicadas (ALTO RISCO)

-- Remover política duplicada de barbers
DROP POLICY IF EXISTS "Admin can manage barbers" ON public.barbers;

-- Remover política duplicada de services  
DROP POLICY IF EXISTS "Admin can manage services" ON public.services;
DROP POLICY IF EXISTS "Anyone can view active services" ON public.services;

-- Remover política duplicada de promotions
DROP POLICY IF EXISTS "Admin can manage promotions" ON public.promotions;
DROP POLICY IF EXISTS "Anyone can view active promotions" ON public.promotions;

-- 3. Corrigir políticas permissivas de appointments (ALTO RISCO)

-- Remover políticas muito permissivas
DROP POLICY IF EXISTS "admin_update_appointments" ON public.appointments;
DROP POLICY IF EXISTS "public_insert_appointments" ON public.appointments;
DROP POLICY IF EXISTS "public_select_appointments" ON public.appointments;

-- Criar políticas mais restritivas
CREATE POLICY "Users can view their own appointments" 
ON public.appointments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.clients c 
    WHERE c.id = appointments.client_id 
    AND c.phone IN (
      SELECT p.phone FROM public.profiles p WHERE p.id = auth.uid()
    )
  ) 
  OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Anyone can create appointments" 
ON public.appointments 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can update appointments" 
ON public.appointments 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete appointments" 
ON public.appointments 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- 4. Melhorar segurança das funções existentes
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT role 
  FROM public.user_roles 
  WHERE user_id = auth.uid() 
  LIMIT 1;
$function$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$function$;