
-- =============================================
-- Convert ALL restrictive policies to permissive
-- =============================================

-- PROFILES
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO public USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO public USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- USER_ROLES
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO public USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO public USING (has_role(auth.uid(), 'admin'::app_role));

-- PENDING_REGISTRATIONS
DROP POLICY IF EXISTS "Users can view own pending registration" ON public.pending_registrations;
CREATE POLICY "Users can view own pending registration" ON public.pending_registrations FOR SELECT TO public USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage pending registrations" ON public.pending_registrations;
CREATE POLICY "Admins can manage pending registrations" ON public.pending_registrations FOR ALL TO public USING (has_role(auth.uid(), 'admin'::app_role));

-- CLIENTES
DROP POLICY IF EXISTS "Users can view own clientes" ON public.clientes;
CREATE POLICY "Users can view own clientes" ON public.clientes FOR SELECT TO public USING ((auth.uid() = user_id) AND EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.aprovado = true));

DROP POLICY IF EXISTS "Users can insert own clientes" ON public.clientes;
CREATE POLICY "Users can insert own clientes" ON public.clientes FOR INSERT TO public WITH CHECK ((auth.uid() = user_id) AND EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.aprovado = true));

DROP POLICY IF EXISTS "Users can update own clientes" ON public.clientes;
CREATE POLICY "Users can update own clientes" ON public.clientes FOR UPDATE TO public USING ((auth.uid() = user_id) AND EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.aprovado = true));

DROP POLICY IF EXISTS "Users can delete own clientes" ON public.clientes;
CREATE POLICY "Users can delete own clientes" ON public.clientes FOR DELETE TO public USING ((auth.uid() = user_id) AND EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.aprovado = true));

-- SESSOES
DROP POLICY IF EXISTS "Users can view own sessoes" ON public.sessoes;
CREATE POLICY "Users can view own sessoes" ON public.sessoes FOR SELECT TO public USING ((auth.uid() = user_id) AND EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.aprovado = true));

DROP POLICY IF EXISTS "Users can insert own sessoes" ON public.sessoes;
CREATE POLICY "Users can insert own sessoes" ON public.sessoes FOR INSERT TO public WITH CHECK ((auth.uid() = user_id) AND EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.aprovado = true));

DROP POLICY IF EXISTS "Users can update own sessoes" ON public.sessoes;
CREATE POLICY "Users can update own sessoes" ON public.sessoes FOR UPDATE TO public USING ((auth.uid() = user_id) AND EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.aprovado = true));

DROP POLICY IF EXISTS "Users can delete own sessoes" ON public.sessoes;
CREATE POLICY "Users can delete own sessoes" ON public.sessoes FOR DELETE TO public USING ((auth.uid() = user_id) AND EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.aprovado = true));

-- PAGAMENTOS
DROP POLICY IF EXISTS "Users can view own pagamentos" ON public.pagamentos;
CREATE POLICY "Users can view own pagamentos" ON public.pagamentos FOR SELECT TO public USING ((auth.uid() = user_id) AND EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.aprovado = true));

DROP POLICY IF EXISTS "Users can insert own pagamentos" ON public.pagamentos;
CREATE POLICY "Users can insert own pagamentos" ON public.pagamentos FOR INSERT TO public WITH CHECK ((auth.uid() = user_id) AND EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.aprovado = true));

DROP POLICY IF EXISTS "Users can update own pagamentos" ON public.pagamentos;
CREATE POLICY "Users can update own pagamentos" ON public.pagamentos FOR UPDATE TO public USING ((auth.uid() = user_id) AND EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.aprovado = true));

DROP POLICY IF EXISTS "Users can delete own pagamentos" ON public.pagamentos;
CREATE POLICY "Users can delete own pagamentos" ON public.pagamentos FOR DELETE TO public USING ((auth.uid() = user_id) AND EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.aprovado = true));

-- PACOTES
DROP POLICY IF EXISTS "Users can view own pacotes" ON public.pacotes;
CREATE POLICY "Users can view own pacotes" ON public.pacotes FOR SELECT TO public USING ((auth.uid() = user_id) AND EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.aprovado = true));

DROP POLICY IF EXISTS "Users can insert own pacotes" ON public.pacotes;
CREATE POLICY "Users can insert own pacotes" ON public.pacotes FOR INSERT TO public WITH CHECK ((auth.uid() = user_id) AND EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.aprovado = true));

DROP POLICY IF EXISTS "Users can update own pacotes" ON public.pacotes;
CREATE POLICY "Users can update own pacotes" ON public.pacotes FOR UPDATE TO public USING ((auth.uid() = user_id) AND EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.aprovado = true));

DROP POLICY IF EXISTS "Users can delete own pacotes" ON public.pacotes;
CREATE POLICY "Users can delete own pacotes" ON public.pacotes FOR DELETE TO public USING ((auth.uid() = user_id) AND EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.aprovado = true));
