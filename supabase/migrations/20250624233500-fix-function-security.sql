
-- Corrigir a função create_financial_transaction para resolver o warning de segurança
CREATE OR REPLACE FUNCTION public.create_financial_transaction()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Se o status mudou para 'completed' e há um preço
  IF NEW.status = 'completed' AND OLD.status != 'completed' AND NEW.price IS NOT NULL THEN
    INSERT INTO public.financial_transactions (appointment_id, amount, description)
    VALUES (NEW.id, NEW.price, 'Pagamento de serviço - Agendamento #' || NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$;
