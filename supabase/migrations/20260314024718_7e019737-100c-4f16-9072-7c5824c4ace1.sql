-- Past realized sessions with paid payments
INSERT INTO public.sessoes (user_id, cliente_id, data_sessao, horario, tipo_servico, valor, status) VALUES
('2db7a872-64d7-4a0e-8a51-a80be7a1ff5c', '2069cfb8-5bf0-49a9-9937-a741b9aef3e7', CURRENT_DATE - INTERVAL '3 days', '09:00', 'Massagem Relaxante', 150, 'realizada'),
('2db7a872-64d7-4a0e-8a51-a80be7a1ff5c', '3fbfb126-0b8a-4854-bbd4-0421e8129296', CURRENT_DATE - INTERVAL '5 days', '10:30', 'Drenagem Linfática', 120, 'realizada'),
('2db7a872-64d7-4a0e-8a51-a80be7a1ff5c', '1788cd6f-b61c-4667-88c2-181b0764491a', CURRENT_DATE - INTERVAL '7 days', '14:00', 'Massagem Terapêutica', 180, 'realizada'),
('2db7a872-64d7-4a0e-8a51-a80be7a1ff5c', '2483aa0a-688e-4e55-b049-4c54766880fe', CURRENT_DATE - INTERVAL '10 days', '11:00', 'Massagem Modeladora', 200, 'realizada'),
('2db7a872-64d7-4a0e-8a51-a80be7a1ff5c', 'f51d5834-28d9-4354-a844-ee5e4b3e0003', CURRENT_DATE - INTERVAL '12 days', '15:00', 'Quick Massage', 80, 'realizada'),
('2db7a872-64d7-4a0e-8a51-a80be7a1ff5c', '7aa7c50b-85d7-4a9a-83f4-670c3a0e35ab', CURRENT_DATE - INTERVAL '14 days', '16:00', 'Reflexologia', 100, 'realizada'),
('2db7a872-64d7-4a0e-8a51-a80be7a1ff5c', '6b6a47aa-7fdb-470a-b843-9cc977c709d7', CURRENT_DATE - INTERVAL '1 day', '08:00', 'Massagem Relaxante', 150, 'realizada'),
('2db7a872-64d7-4a0e-8a51-a80be7a1ff5c', 'fcd8f3a3-0176-4119-8186-65b02522f7c6', CURRENT_DATE - INTERVAL '2 days', '17:00', 'Drenagem Linfática', 120, 'realizada');

-- Future/pending sessions
INSERT INTO public.sessoes (user_id, cliente_id, data_sessao, horario, tipo_servico, valor, status) VALUES
('2db7a872-64d7-4a0e-8a51-a80be7a1ff5c', '17dd31fc-da25-4aa7-947a-3384b70f2a60', CURRENT_DATE + INTERVAL '1 day', '09:30', 'Massagem Terapêutica', 180, 'agendada'),
('2db7a872-64d7-4a0e-8a51-a80be7a1ff5c', 'c8eb2423-561f-4d0c-af56-8e309bef2177', CURRENT_DATE + INTERVAL '2 days', '14:00', 'Massagem Relaxante', 150, 'agendada'),
('2db7a872-64d7-4a0e-8a51-a80be7a1ff5c', '66baca89-989c-4824-8e60-5080bfd0da45', CURRENT_DATE + INTERVAL '3 days', '10:00', 'Drenagem Linfática', 120, 'agendada'),
('2db7a872-64d7-4a0e-8a51-a80be7a1ff5c', 'd9aaf361-da3d-41ac-97d8-3f6883b5be7a', CURRENT_DATE + INTERVAL '4 days', '16:00', 'Massagem Modeladora', 200, 'agendada'),
('2db7a872-64d7-4a0e-8a51-a80be7a1ff5c', 'b5849c15-b0b0-4ac7-8a31-b142f60ae010', CURRENT_DATE + INTERVAL '5 days', '11:00', 'Quick Massage', 80, 'agendada');

-- Today sessions
INSERT INTO public.sessoes (user_id, cliente_id, data_sessao, horario, tipo_servico, valor, status) VALUES
('2db7a872-64d7-4a0e-8a51-a80be7a1ff5c', '39f99787-6114-4c3d-b6d5-dd6537867b50', CURRENT_DATE, '09:00', 'Massagem Relaxante', 150, 'agendada'),
('2db7a872-64d7-4a0e-8a51-a80be7a1ff5c', 'f583fe85-e091-418f-81ff-f381e7f27bf4', CURRENT_DATE, '14:00', 'Reflexologia', 100, 'agendada'),
('2db7a872-64d7-4a0e-8a51-a80be7a1ff5c', '2069cfb8-5bf0-49a9-9937-a741b9aef3e7', CURRENT_DATE, '16:30', 'Drenagem Linfática', 120, 'agendada');