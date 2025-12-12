
-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  nome TEXT,
  aprovado BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Create pending_registrations table
CREATE TABLE public.pending_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nome TEXT,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create clientes table
CREATE TABLE public.clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  celular TEXT,
  email TEXT,
  data_nascimento DATE,
  cpf TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create pacotes table
CREATE TABLE public.pacotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  quantidade_sessoes INTEGER DEFAULT 1,
  valor DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create sessoes table
CREATE TABLE public.sessoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE NOT NULL,
  pacote_id UUID REFERENCES public.pacotes(id) ON DELETE SET NULL,
  data_sessao TIMESTAMPTZ NOT NULL,
  horario TIME,
  tipo_servico TEXT,
  valor DECIMAL(10,2),
  status TEXT DEFAULT 'agendada' CHECK (status IN ('agendada', 'realizada', 'cancelada')),
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create pagamentos table
CREATE TABLE public.pagamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE NOT NULL,
  sessao_id UUID REFERENCES public.sessoes(id) ON DELETE SET NULL,
  pacote_id UUID REFERENCES public.pacotes(id) ON DELETE SET NULL,
  valor DECIMAL(10,2) NOT NULL,
  data_pagamento DATE NOT NULL,
  forma_pagamento TEXT,
  status TEXT DEFAULT 'pago' CHECK (status IN ('pago', 'pendente', 'cancelado')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pacotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagamentos ENABLE ROW LEVEL SECURITY;

-- Create has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pending_registrations_updated_at BEFORE UPDATE ON public.pending_registrations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON public.clientes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pacotes_updated_at BEFORE UPDATE ON public.pacotes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_sessoes_updated_at BEFORE UPDATE ON public.sessoes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pagamentos_updated_at BEFORE UPDATE ON public.pagamentos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, nome, aprovado)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'nome', FALSE);
  
  -- Create pending registration
  INSERT INTO public.pending_registrations (user_id, email, nome, status)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'nome', 'pendente');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for pending_registrations
CREATE POLICY "Users can view own pending registration" ON public.pending_registrations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage pending registrations" ON public.pending_registrations FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for clientes
CREATE POLICY "Users can view own clientes" ON public.clientes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own clientes" ON public.clientes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own clientes" ON public.clientes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own clientes" ON public.clientes FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for pacotes
CREATE POLICY "Users can view own pacotes" ON public.pacotes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own pacotes" ON public.pacotes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own pacotes" ON public.pacotes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own pacotes" ON public.pacotes FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for sessoes
CREATE POLICY "Users can view own sessoes" ON public.sessoes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessoes" ON public.sessoes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessoes" ON public.sessoes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sessoes" ON public.sessoes FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for pagamentos
CREATE POLICY "Users can view own pagamentos" ON public.pagamentos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own pagamentos" ON public.pagamentos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own pagamentos" ON public.pagamentos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own pagamentos" ON public.pagamentos FOR DELETE USING (auth.uid() = user_id);
