INSERT INTO public.pagamentos (user_id, cliente_id, sessao_id, valor, data_pagamento, forma_pagamento, status) VALUES
('2db7a872-64d7-4a0e-8a51-a80be7a1ff5c', '2069cfb8-5bf0-49a9-9937-a741b9aef3e7', '3108e208-16f3-40ef-9484-ba7a8b2bdaa0', 150, '2026-03-11', 'PIX', 'pago'),
('2db7a872-64d7-4a0e-8a51-a80be7a1ff5c', '3fbfb126-0b8a-4854-bbd4-0421e8129296', 'c2b668a7-1af8-4cb9-9f19-95a548c923d9', 120, '2026-03-09', 'Dinheiro', 'pago'),
('2db7a872-64d7-4a0e-8a51-a80be7a1ff5c', '1788cd6f-b61c-4667-88c2-181b0764491a', '299b4624-8630-4e2e-9848-f5524d797e5a', 180, '2026-03-07', 'Cartão Crédito', 'pago'),
('2db7a872-64d7-4a0e-8a51-a80be7a1ff5c', '2483aa0a-688e-4e55-b049-4c54766880fe', 'fb0987f1-22fe-4c76-a6d6-a24f55353779', 200, '2026-03-04', 'Cartão Débito', 'pago'),
('2db7a872-64d7-4a0e-8a51-a80be7a1ff5c', 'f51d5834-28d9-4354-a844-ee5e4b3e0003', 'b2446482-f1ac-4e5f-a1bb-5dbc5ade5893', 80, '2026-03-02', 'PIX', 'pago'),
('2db7a872-64d7-4a0e-8a51-a80be7a1ff5c', '7aa7c50b-85d7-4a9a-83f4-670c3a0e35ab', 'e1a44915-408f-45b2-a960-fa2bff80aeb5', 100, '2026-02-28', 'Dinheiro', 'pago'),
('2db7a872-64d7-4a0e-8a51-a80be7a1ff5c', '6b6a47aa-7fdb-470a-b843-9cc977c709d7', '11a63763-f7bd-437a-a332-0057f7e2394d', 150, '2026-03-13', 'PIX', 'pago'),
('2db7a872-64d7-4a0e-8a51-a80be7a1ff5c', 'fcd8f3a3-0176-4119-8186-65b02522f7c6', '198fab74-93cd-42b0-9332-959e283b21c5', 120, '2026-03-12', 'Cartão Crédito', 'pago');

-- Pending payments for future sessions
INSERT INTO public.pagamentos (user_id, cliente_id, sessao_id, valor, data_pagamento, forma_pagamento, status)
SELECT '2db7a872-64d7-4a0e-8a51-a80be7a1ff5c', s.cliente_id, s.id, s.valor, s.data_sessao, NULL, 'pendente'
FROM sessoes s WHERE s.user_id = '2db7a872-64d7-4a0e-8a51-a80be7a1ff5c' AND s.status = 'agendada' AND s.id NOT IN (SELECT sessao_id FROM pagamentos WHERE sessao_id IS NOT NULL);