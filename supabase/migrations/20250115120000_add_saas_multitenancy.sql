-- Create barbershops table for multitenancy
CREATE TABLE barbershops (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    owner_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    plan_id VARCHAR(50) DEFAULT 'basic',
    subscription_status VARCHAR(20) DEFAULT 'trial',
    subscription_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    subscription_end_date TIMESTAMP WITH TIME ZONE,
    max_barbers INTEGER DEFAULT 2,
    max_clients INTEGER DEFAULT 100,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscription plans table
CREATE TABLE subscription_plans (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price_monthly DECIMAL(10,2) NOT NULL,
    price_yearly DECIMAL(10,2),
    max_barbers INTEGER,
    max_clients INTEGER,
    features JSONB,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default subscription plans
INSERT INTO subscription_plans (id, name, price_monthly, price_yearly, max_barbers, max_clients, features) VALUES
('basic', 'Básico', 49.90, 499.00, 2, 100, 
    '["Até 2 barbeiros", "Agenda online", "Relatórios básicos", "Suporte por email"]'::jsonb),
('premium', 'Premium', 99.90, 999.00, -1, 500, 
    '["Barbeiros ilimitados", "Agenda online avançada", "Relatórios completos", "Integração WhatsApp", "Gestão financeira", "Suporte prioritário"]'::jsonb),
('enterprise', 'Enterprise', 199.90, 1999.00, -1, -1, 
    '["Múltiplas filiais", "API personalizada", "Relatórios avançados", "Suporte 24/7", "Treinamento incluído", "Customizações"]'::jsonb);

-- Add barbershop_id to existing tables for multitenancy
ALTER TABLE barbers ADD COLUMN barbershop_id UUID REFERENCES barbershops(id);
ALTER TABLE services ADD COLUMN barbershop_id UUID REFERENCES barbershops(id);
ALTER TABLE appointments ADD COLUMN barbershop_id UUID REFERENCES barbershops(id);
ALTER TABLE financial_transactions ADD COLUMN barbershop_id UUID REFERENCES barbershops(id);
ALTER TABLE cost_items ADD COLUMN barbershop_id UUID REFERENCES barbershops(id);
ALTER TABLE cost_records ADD COLUMN barbershop_id UUID REFERENCES barbershops(id);
ALTER TABLE promotions ADD COLUMN barbershop_id UUID REFERENCES barbershops(id);

-- Add barbershop role to user roles enum
ALTER TYPE app_role ADD VALUE 'barbershop' AFTER 'user';

-- Create barbershop_users table to link users to barbershops
CREATE TABLE barbershop_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    barbershop_id UUID REFERENCES barbershops(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'owner',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, barbershop_id)
);

-- Create payment_transactions table for subscription billing
CREATE TABLE payment_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    barbershop_id UUID REFERENCES barbershops(id) ON DELETE CASCADE,
    plan_id VARCHAR(50) REFERENCES subscription_plans(id),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'BRL',
    status VARCHAR(20) DEFAULT 'pending',
    payment_method VARCHAR(50),
    transaction_id VARCHAR(255),
    payment_date TIMESTAMP WITH TIME ZONE,
    period_start TIMESTAMP WITH TIME ZONE,
    period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_barbershops_email ON barbershops(email);
CREATE INDEX idx_barbershops_subscription_status ON barbershops(subscription_status);
CREATE INDEX idx_barbershop_users_user_id ON barbershop_users(user_id);
CREATE INDEX idx_barbershop_users_barbershop_id ON barbershop_users(barbershop_id);
CREATE INDEX idx_barbers_barbershop_id ON barbers(barbershop_id);
CREATE INDEX idx_services_barbershop_id ON services(barbershop_id);
CREATE INDEX idx_appointments_barbershop_id ON appointments(barbershop_id);
CREATE INDEX idx_financial_transactions_barbershop_id ON financial_transactions(barbershop_id);
CREATE INDEX idx_payment_transactions_barbershop_id ON payment_transactions(barbershop_id);

-- Create RLS (Row Level Security) policies for multitenancy
ALTER TABLE barbershops ENABLE ROW LEVEL SECURITY;
ALTER TABLE barbershop_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Function to get user's barbershop
CREATE OR REPLACE FUNCTION get_user_barbershop_id(user_uuid UUID)
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT barbershop_id 
        FROM barbershop_users 
        WHERE user_id = user_uuid AND active = true
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Barbershops policy - users can only see their own barbershop
CREATE POLICY "Users can view their own barbershop" ON barbershops
    FOR SELECT USING (id = get_user_barbershop_id(auth.uid()));

CREATE POLICY "Users can update their own barbershop" ON barbershops
    FOR UPDATE USING (id = get_user_barbershop_id(auth.uid()));

-- Barbershop users policy
CREATE POLICY "Users can view their barbershop memberships" ON barbershop_users
    FOR SELECT USING (user_id = auth.uid());

-- Barbers policy - users can only see barbers from their barbershop
CREATE POLICY "Users can view barbers from their barbershop" ON barbers
    FOR ALL USING (barbershop_id = get_user_barbershop_id(auth.uid()));

-- Services policy - users can only see services from their barbershop
CREATE POLICY "Users can view services from their barbershop" ON services
    FOR ALL USING (barbershop_id = get_user_barbershop_id(auth.uid()));

-- Appointments policy - users can only see appointments from their barbershop
CREATE POLICY "Users can view appointments from their barbershop" ON appointments
    FOR ALL USING (barbershop_id = get_user_barbershop_id(auth.uid()));

-- Financial transactions policy
CREATE POLICY "Users can view financial transactions from their barbershop" ON financial_transactions
    FOR ALL USING (barbershop_id = get_user_barbershop_id(auth.uid()));

-- Payment transactions policy
CREATE POLICY "Users can view payment transactions from their barbershop" ON payment_transactions
    FOR SELECT USING (barbershop_id = get_user_barbershop_id(auth.uid()));

-- Function to create a new barbershop with default data
CREATE OR REPLACE FUNCTION create_barbershop_with_defaults(
    barbershop_name TEXT,
    owner_name TEXT,
    email TEXT,
    phone TEXT DEFAULT NULL,
    address TEXT DEFAULT NULL,
    city TEXT DEFAULT NULL,
    state TEXT DEFAULT NULL,
    zip_code TEXT DEFAULT NULL,
    plan_id TEXT DEFAULT 'basic'
)
RETURNS UUID AS $$
DECLARE
    new_barbershop_id UUID;
    plan_limits RECORD;
BEGIN
    -- Get plan limits
    SELECT max_barbers, max_clients INTO plan_limits
    FROM subscription_plans 
    WHERE id = plan_id;
    
    -- Create barbershop
    INSERT INTO barbershops (
        name, owner_name, email, phone, address, city, state, zip_code, 
        plan_id, max_barbers, max_clients
    ) VALUES (
        barbershop_name, owner_name, email, phone, address, city, state, zip_code,
        plan_id, plan_limits.max_barbers, plan_limits.max_clients
    )
    RETURNING id INTO new_barbershop_id;
    
    -- Create default services
    INSERT INTO services (name, duration, price, barbershop_id) VALUES
    ('Corte Clássico', 30, 35.00, new_barbershop_id),
    ('Barba Completa', 25, 25.00, new_barbershop_id),
    ('Combo Premium', 50, 55.00, new_barbershop_id),
    ('Sobrancelha', 15, 15.00, new_barbershop_id);
    
    -- Create default barber
    INSERT INTO barbers (name, phone, barbershop_id) VALUES
    (owner_name, phone, new_barbershop_id);
    
    RETURN new_barbershop_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;