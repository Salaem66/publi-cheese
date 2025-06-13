
-- Créer une table pour les messages
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer un bucket de stockage pour les images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('message-images', 'message-images', true);

-- Politique pour permettre à tous de voir les messages approuvés
CREATE POLICY "Anyone can view approved messages" 
  ON public.messages 
  FOR SELECT 
  USING (status = 'approved');

-- Politique pour permettre à tous d'insérer des messages
CREATE POLICY "Anyone can create messages" 
  ON public.messages 
  FOR INSERT 
  WITH CHECK (true);

-- Politique pour permettre la mise à jour des messages (pour la modération)
CREATE POLICY "Anyone can update messages" 
  ON public.messages 
  FOR UPDATE 
  USING (true);

-- Politique pour permettre la suppression des messages
CREATE POLICY "Anyone can delete messages" 
  ON public.messages 
  FOR DELETE 
  USING (true);

-- Activer RLS sur la table messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Politique de stockage pour permettre l'upload d'images
CREATE POLICY "Anyone can upload message images" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (bucket_id = 'message-images');

-- Politique de stockage pour permettre la lecture des images
CREATE POLICY "Anyone can view message images" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'message-images');

-- Politique de stockage pour permettre la suppression des images
CREATE POLICY "Anyone can delete message images" 
  ON storage.objects 
  FOR DELETE 
  USING (bucket_id = 'message-images');
