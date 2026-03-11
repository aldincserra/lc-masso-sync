
-- Drop existing RLS policies on clientes
DROP POLICY IF EXISTS "Users can view own clientes" ON public.clientes;
DROP POLICY IF EXISTS "Users can insert own clientes" ON public.clientes;
DROP POLICY IF EXISTS "Users can update own clientes" ON public.clientes;
DROP POLICY IF EXISTS "Users can delete own clientes" ON public.clientes;

-- Recreate with approval check
CREATE POLICY "Users can view own clientes" ON public.clientes
  FOR SELECT TO public
  USING (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND aprovado = true));

CREATE POLICY "Users can insert own clientes" ON public.clientes
  FOR INSERT TO public
  WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND aprovado = true));

CREATE POLICY "Users can update own clientes" ON public.clientes
  FOR UPDATE TO public
  USING (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND aprovado = true));

CREATE POLICY "Users can delete own clientes" ON public.clientes
  FOR DELETE TO public
  USING (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND aprovado = true));

-- Drop existing RLS policies on sessoes
DROP POLICY IF EXISTS "Users can view own sessoes" ON public.sessoes;
DROP POLICY IF EXISTS "Users can insert own sessoes" ON public.sessoes;
DROP POLICY IF EXISTS "Users can update own sessoes" ON public.sessoes;
DROP POLICY IF EXISTS "Users can delete own sessoes" ON public.sessoes;

-- Recreate with approval check
CREATE POLICY "Users can view own sessoes" ON public.sessoes
  FOR SELECT TO public
  USING (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND aprovado = true));

CREATE POLICY "Users can insert own sessoes" ON public.sessoes
  FOR INSERT TO public
  WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND aprovado = true));

CREATE POLICY "Users can update own sessoes" ON public.sessoes
  FOR UPDATE TO public
  USING (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND aprovado = true));

CREATE POLICY "Users can delete own sessoes" ON public.sessoes
  FOR DELETE TO public
  USING (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND aprovado = true));

-- Drop existing RLS policies on pagamentos
DROP POLICY IF EXISTS "Users can view own pagamentos" ON public.pagamentos;
DROP POLICY IF EXISTS "Users can insert own pagamentos" ON public.pagamentos;
DROP POLICY IF EXISTS "Users can update own pagamentos" ON public.pagamentos;
DROP POLICY IF EXISTS "Users can delete own pagamentos" ON public.pagamentos;

-- Recreate with approval check
CREATE POLICY "Users can view own pagamentos" ON public.pagamentos
  FOR SELECT TO public
  USING (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND aprovado = true));

CREATE POLICY "Users can insert own pagamentos" ON public.pagamentos
  FOR INSERT TO public
  WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND aprovado = true));

CREATE POLICY "Users can update own pagamentos" ON public.pagamentos
  FOR UPDATE TO public
  USING (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND aprovado = true));

CREATE POLICY "Users can delete own pagamentos" ON public.pagamentos
  FOR DELETE TO public
  USING (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND aprovado = true));

-- Drop existing RLS policies on pacotes
DROP POLICY IF EXISTS "Users can view own pacotes" ON public.pacotes;
DROP POLICY IF EXISTS "Users can insert own pacotes" ON public.pacotes;
DROP POLICY IF EXISTS "Users can update own pacotes" ON public.pacotes;
DROP POLICY IF EXISTS "Users can delete own pacotes" ON public.pacotes;

-- Recreate with approval check
CREATE POLICY "Users can view own pacotes" ON public.pacotes
  FOR SELECT TO public
  USING (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND aprovado = true));

CREATE POLICY "Users can insert own pacotes" ON public.pacotes
  FOR INSERT TO public
  WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND aprovado = true));

CREATE POLICY "Users can update own pacotes" ON public.pacotes
  FOR UPDATE TO public
  USING (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND aprovado = true));

CREATE POLICY "Users can delete own pacotes" ON public.pacotes
  FOR DELETE TO public
  USING (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND aprovado = true));
