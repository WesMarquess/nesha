-- Pagamento do agendamento pelo Mercado Pago (Checkout Pro). O agendamento só chega ao
-- prestador depois de pago; se for recusado ou cancelado depois de pago, é estornado.
ALTER TABLE agendamentos ADD COLUMN pagamento_status VARCHAR(20);
ALTER TABLE agendamentos ADD COLUMN pagamento_preferencia_id VARCHAR(100);
ALTER TABLE agendamentos ADD COLUMN pagamento_id VARCHAR(50);
ALTER TABLE agendamentos ADD COLUMN pagamento_atualizado_em TIMESTAMP WITH TIME ZONE;
