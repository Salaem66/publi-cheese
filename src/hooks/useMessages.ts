
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Message {
  id: string;
  content: string;
  image_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export const useMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [pendingMessages, setPendingMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadMessages = async () => {
    try {
      const { data: approvedMessages } = await supabase
        .from('messages')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      const { data: pendingMessagesData } = await supabase
        .from('messages')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      setMessages((approvedMessages || []) as Message[]);
      setPendingMessages((pendingMessagesData || []) as Message[]);
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les messages",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addMessage = async (content: string, imageFile?: File) => {
    try {
      let imageUrl = null;

      // Upload de l'image si présente
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('message-images')
          .upload(fileName, imageFile);

        if (uploadError) {
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('message-images')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      const moderationEnabled = localStorage.getItem('moderationEnabled') !== 'false';

      const { error } = await supabase
        .from('messages')
        .insert({
          content,
          image_url: imageUrl,
          status: moderationEnabled ? 'pending' : 'approved'
        });

      if (error) {
        throw error;
      }

      // Recharger les messages
      await loadMessages();

      toast({
        title: "Message envoyé !",
        description: moderationEnabled 
          ? "Votre message sera visible après modération." 
          : "Votre message est maintenant visible.",
      });

    } catch (error) {
      console.error('Erreur lors de l\'ajout du message:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive"
      });
    }
  };

  const updateMessageStatus = async (messageId: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', messageId);

      if (error) {
        throw error;
      }

      await loadMessages();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du message:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le message",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    loadMessages();

    // Écouter les changements en temps réel
    const channel = supabase
      .channel('messages-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'messages' }, 
        () => {
          loadMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    messages,
    pendingMessages,
    isLoading,
    addMessage,
    updateMessageStatus,
    loadMessages
  };
};
