-- Create profile for admin user and approve
INSERT INTO public.profiles (id, email, nome, aprovado)
VALUES ('2db7a872-64d7-4a0e-8a51-a80be7a1ff5c', 'aldinserra@yahoo.com.br', 'Aldin Serra', TRUE)
ON CONFLICT (id) DO UPDATE SET aprovado = TRUE;

-- Assign admin role
INSERT INTO public.user_roles (user_id, role)
VALUES ('2db7a872-64d7-4a0e-8a51-a80be7a1ff5c', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;