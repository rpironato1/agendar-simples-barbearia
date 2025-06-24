
-- Enable RLS
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- Create profiles table for users
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create clients table
CREATE TABLE clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  cpf TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  accepts_whatsapp BOOLEAN DEFAULT false,
  total_spent DECIMAL(10,2) DEFAULT 0,
  last_visit DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create services table
CREATE TABLE services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  duration INTEGER NOT NULL, -- in minutes
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create barbers table
CREATE TABLE barbers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create appointments table
CREATE TABLE appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  barber_id UUID REFERENCES barbers(id) ON DELETE SET NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  price DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create promotions table
CREATE TABLE promotions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  discount_percentage INTEGER,
  discount_amount DECIMAL(10,2),
  valid_until DATE,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for clients (admin only)
CREATE POLICY "Admin can manage clients" ON clients
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.phone = '(11) 99999-0000' -- Admin phone
    )
  );

-- RLS Policies for services (read for all, admin manage)
CREATE POLICY "Anyone can view services" ON services
  FOR SELECT USING (active = true);

CREATE POLICY "Admin can manage services" ON services
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.phone = '(11) 99999-0000'
    )
  );

-- RLS Policies for barbers
CREATE POLICY "Anyone can view active barbers" ON barbers
  FOR SELECT USING (active = true);

CREATE POLICY "Admin can manage barbers" ON barbers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.phone = '(11) 99999-0000'
    )
  );

-- RLS Policies for appointments
CREATE POLICY "Users can view their appointments" ON appointments
  FOR SELECT USING (
    client_id IN (
      SELECT id FROM clients WHERE phone IN (
        SELECT phone FROM profiles WHERE id = auth.uid()
      )
    )
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.phone = '(11) 99999-0000'
    )
  );

CREATE POLICY "Admin can manage all appointments" ON appointments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.phone = '(11) 99999-0000'
    )
  );

-- RLS Policies for promotions
CREATE POLICY "Anyone can view active promotions" ON promotions
  FOR SELECT USING (active = true AND (valid_until IS NULL OR valid_until >= CURRENT_DATE));

CREATE POLICY "Admin can manage promotions" ON promotions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.phone = '(11) 99999-0000'
    )
  );

-- Insert initial data
INSERT INTO services (name, description, price, duration) VALUES
  ('Corte Clássico', 'Corte tradicional masculino', 35.00, 30),
  ('Barba Completa', 'Aparar e modelar barba', 25.00, 20),
  ('Combo Premium', 'Corte + Barba + Sobrancelha', 55.00, 60),
  ('Corte Infantil', 'Corte para crianças até 12 anos', 25.00, 25),
  ('Sobrancelha', 'Modelagem de sobrancelha', 15.00, 15);

INSERT INTO barbers (name, phone) VALUES
  ('João Silva', '(11) 99999-1234'),
  ('Pedro Santos', '(11) 99999-5678'),
  ('Carlos Oliveira', '(11) 99999-9012');

INSERT INTO promotions (title, description, discount_percentage, valid_until) VALUES
  ('Desconto de 20% na primeira visita', 'Válido até 31/01/2024', 20, '2024-01-31'),
  ('Combo Especial - Corte + Barba', 'Por apenas R$ 45,00', NULL, '2024-02-29'),
  ('Indique um amigo e ganhe 15% de desconto', 'Válido por 30 dias', 15, '2024-02-15');
