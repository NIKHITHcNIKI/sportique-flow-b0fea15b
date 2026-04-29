CREATE OR REPLACE FUNCTION public.verify_student_id_email(_student_id text, _email text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE student_id = _student_id
      AND lower(email) = lower(_email)
  );
$$;