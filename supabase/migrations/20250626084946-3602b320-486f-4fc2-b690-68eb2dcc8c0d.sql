
-- Créer une table pour stocker les paramètres globaux
CREATE TABLE public.settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insérer le paramètre de modération par défaut (désactivé)
INSERT INTO public.settings (key, value) 
VALUES ('moderation_enabled', 'false');

-- Créer des politiques RLS pour permettre l'accès aux paramètres
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Permettre à tous de lire les paramètres
CREATE POLICY "Anyone can view settings" 
  ON public.settings 
  FOR SELECT 
  USING (true);

-- Permettre à tous de modifier les paramètres (pour l'admin)
CREATE POLICY "Anyone can update settings" 
  ON public.settings 
  FOR UPDATE 
  USING (true);

-- Permettre l'insertion de nouveaux paramètres
CREATE POLICY "Anyone can insert settings" 
  ON public.settings 
  FOR INSERT 
  WITH CHECK (true);
