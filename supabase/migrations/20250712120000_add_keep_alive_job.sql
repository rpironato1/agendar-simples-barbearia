-- Habilita a extensão pg_cron
create extension if not exists pg_cron with schema extensions;

-- Concede permissão para o usuário postgres (usuário padrão da Supabase) usar a extensão
grant usage on schema cron to postgres;

-- Agenda o job para rodar todo dia à meia-noite (UTC)
-- A tarefa é um simples "SELECT 1" que não faz nada, mas conta como atividade.
select
  cron.schedule(
    'keep-alive-job',
    '0 0 * * *', -- Todos os dias à meia-noite
    'SELECT 1'
  );
