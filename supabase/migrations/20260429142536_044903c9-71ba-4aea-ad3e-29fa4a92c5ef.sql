CREATE TABLE public.password_reset_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_password_reset_codes_email ON public.password_reset_codes(email);

ALTER TABLE public.password_reset_codes ENABLE ROW LEVEL SECURITY;

-- No policies = no client access. Only service role (edge functions) can use it.
