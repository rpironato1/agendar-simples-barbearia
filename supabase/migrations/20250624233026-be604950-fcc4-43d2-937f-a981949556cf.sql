
-- Criar tabela para transações financeiras (receitas)
CREATE TABLE public.financial_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID REFERENCES public.appointments(id),
  amount DECIMAL(10,2) NOT NULL,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'income' CHECK (type IN ('income', 'expense')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para produtos/itens de custo
CREATE TABLE public.cost_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  unit_price DECIMAL(10,2) NOT NULL,
  category TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para registros de custos
CREATE TABLE public.cost_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cost_item_id UUID REFERENCES public.cost_items(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  total_amount DECIMAL(10,2) NOT NULL,
  purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar RLS às tabelas
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cost_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cost_records ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir acesso público (já que não temos autenticação específica para admin)
CREATE POLICY "Allow all operations on financial_transactions" ON public.financial_transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on cost_items" ON public.cost_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on cost_records" ON public.cost_records FOR ALL USING (true) WITH CHECK (true);

-- Criar trigger para criar transação financeira automaticamente quando appointment é completado
CREATE OR REPLACE FUNCTION create_financial_transaction()
RETURNS TRIGGER AS $$
BEGIN
  -- Se o status mudou para 'completed' e há um preço
  IF NEW.status = 'completed' AND OLD.status != 'completed' AND NEW.price IS NOT NULL THEN
    INSERT INTO public.financial_transactions (appointment_id, amount, description)
    VALUES (NEW.id, NEW.price, 'Pagamento de serviço - Agendamento #' || NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER appointment_completed_trigger
  AFTER UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION create_financial_transaction();
