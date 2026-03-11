
-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update all profiles (needed for approval)
CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Fix redvis@gmail.com approval status
UPDATE public.profiles
SET aprovado = TRUE
WHERE email = 'redvis@gmail.com';
