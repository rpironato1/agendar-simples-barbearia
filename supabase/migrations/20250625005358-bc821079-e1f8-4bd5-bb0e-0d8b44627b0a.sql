
-- Phase 1: Create user roles system for secure admin authentication
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- Create function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT role 
  FROM public.user_roles 
  WHERE user_id = auth.uid() 
  LIMIT 1;
$$;

-- Phase 2: Implement comprehensive RLS policies

-- Clients table RLS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage all clients" ON public.clients;
CREATE POLICY "Admins can manage all clients" ON public.clients
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Users can view their own client record" ON public.clients;
CREATE POLICY "Users can view their own client record" ON public.clients
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND p.phone = clients.phone
  )
);

-- Services table RLS  
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active services" ON public.services;
CREATE POLICY "Anyone can view active services" ON public.services
FOR SELECT USING (active = true);

DROP POLICY IF EXISTS "Admins can manage services" ON public.services;
CREATE POLICY "Admins can manage services" ON public.services
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Barbers table RLS
ALTER TABLE public.barbers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active barbers" ON public.barbers;
CREATE POLICY "Anyone can view active barbers" ON public.barbers
FOR SELECT USING (active = true);

DROP POLICY IF EXISTS "Admins can manage barbers" ON public.barbers;
CREATE POLICY "Admins can manage barbers" ON public.barbers
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Appointments table RLS
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage all appointments" ON public.appointments;
CREATE POLICY "Admins can manage all appointments" ON public.appointments
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Users can view their own appointments" ON public.appointments;
CREATE POLICY "Users can view their own appointments" ON public.appointments
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.clients c 
    JOIN public.profiles p ON p.phone = c.phone 
    WHERE c.id = appointments.client_id AND p.id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Anyone can create appointments" ON public.appointments;
CREATE POLICY "Anyone can create appointments" ON public.appointments
FOR INSERT WITH CHECK (true);

-- Promotions table RLS
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active promotions" ON public.promotions;
CREATE POLICY "Anyone can view active promotions" ON public.promotions
FOR SELECT USING (active = true);

DROP POLICY IF EXISTS "Admins can manage promotions" ON public.promotions;
CREATE POLICY "Admins can manage promotions" ON public.promotions
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Financial transactions RLS (admin only)
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all operations on financial_transactions" ON public.financial_transactions;
DROP POLICY IF EXISTS "Admins can manage financial transactions" ON public.financial_transactions;
CREATE POLICY "Admins can manage financial transactions" ON public.financial_transactions
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Cost items RLS (admin only)
ALTER TABLE public.cost_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all operations on cost_items" ON public.cost_items;
DROP POLICY IF EXISTS "Admins can manage cost items" ON public.cost_items;
CREATE POLICY "Admins can manage cost items" ON public.cost_items
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Cost records RLS (admin only)  
ALTER TABLE public.cost_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all operations on cost_records" ON public.cost_records;
DROP POLICY IF EXISTS "Admins can manage cost records" ON public.cost_records;
CREATE POLICY "Admins can manage cost records" ON public.cost_records
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Profiles RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view and update their own profile" ON public.profiles;
CREATE POLICY "Users can view and update their own profile" ON public.profiles
FOR ALL USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- User roles policies
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles" ON public.user_roles
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
CREATE POLICY "Admins can manage all roles" ON public.user_roles
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger to automatically assign user role on profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- Insert admin role for the existing admin user
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users 
WHERE email = 'rodolfopironato@yahoo.com'
ON CONFLICT (user_id, role) DO NOTHING;
