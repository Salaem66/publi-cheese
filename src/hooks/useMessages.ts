
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
  const [archivedMessages, setArchivedMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadMessages = async () => {
    console.log('=== LOADING MESSAGES ===');
    try {
      console.log('Fetching approved messages...');
      const { data: approvedMessages, error: approvedError } = await supabase
        .from('messages')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (approvedError) {
        console.error('Error fetching approved messages:', approvedError);
      } else {
        console.log('Approved messages loaded:', approvedMessages?.length || 0);
      }

      console.log('Fetching pending messages...');
      const { data: pendingMessagesData, error: pendingError } = await supabase
        .from('messages')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (pendingError) {
        console.error('Error fetching pending messages:', pendingError);
      } else {
        console.log('Pending messages loaded:', pendingMessagesData?.length || 0);
      }

      console.log('Fetching archived messages...');
      const { data: archivedMessagesData, error: archivedError } = await supabase
        .from('messages')
        .select('*')
        .eq('status', 'rejected')
        .order('created_at', { ascending: false });

      if (archivedError) {
        console.error('Error fetching archived messages:', archivedError);
      } else {
        console.log('Archived messages loaded:', archivedMessagesData?.length || 0);
      }

      setMessages((approvedMessages || []) as Message[]);
      setPendingMessages((pendingMessagesData || []) as Message[]);
      setArchivedMessages((archivedMessagesData || []) as Message[]);
      
      console.log('=== MESSAGE LOADING COMPLETED ===');
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
    console.log('=== ADD MESSAGE STARTED ===');
    console.log('Content:', content);
    console.log('Image file:', imageFile?.name || 'none');
    console.log('Supabase client configured');
    
    try {
      let imageUrl = null;

      // Upload de l'image si présente
      if (imageFile) {
        console.log('Starting image upload...');
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        
        console.log('Uploading to storage:', fileName);
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('message-images')
          .upload(fileName, imageFile);

        if (uploadError) {
          console.error('Image upload error:', uploadError);
          throw uploadError;
        }

        console.log('Image uploaded successfully:', uploadData);
        const { data: { publicUrl } } = supabase.storage
          .from('message-images')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
        console.log('Public URL generated:', imageUrl);
      }

      const moderationEnabled = localStorage.getItem('moderationEnabled') !== 'false';
      const messageStatus = moderationEnabled ? 'pending' : 'approved';
      
      console.log('Moderation enabled:', moderationEnabled);
      console.log('Message status will be:', messageStatus);
      console.log('Inserting message into database...');

      // Ajouter plus de logs pour Safari
      console.log('Browser info:', {
        userAgent: navigator.userAgent,
        isSafari: /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent),
        localStorage: !!localStorage,
        WebSocket: !!WebSocket
      });

      const messageData = {
        content,
        image_url: imageUrl,
        status: messageStatus
      };
      console.log('Message data to insert:', messageData);

      const { data, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select();

      console.log('Database response:', { data, error });

      if (error) {
        console.error('Database insert error:', error);
        console.error('Error code:', error.code);
        console.error('Error details:', error.details);
        console.error('Error hint:', error.hint);
        console.error('Error message:', error.message);
        throw error;
      }

      if (!data || data.length === 0) {
        console.error('No data returned from insert');
        throw new Error('No data returned from database insert');
      }

      console.log('Message inserted successfully:', data);

      // Recharger les messages
      console.log('Reloading messages...');
      await loadMessages();

      console.log('Showing success toast...');
      toast({
        title: "Message envoyé !",
        description: moderationEnabled 
          ? "Votre message sera visible après modération." 
          : "Votre message est maintenant visible.",
      });

      console.log('=== ADD MESSAGE COMPLETED SUCCESSFULLY ===');
    } catch (error) {
      console.error('=== ADD MESSAGE FAILED ===');
      console.error('Error details:', error);
      console.error('Error type:', typeof error);
      console.error('Error constructor:', error?.constructor?.name);
      
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      
      // Diagnostic spécial pour Safari
      if (/Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)) {
        console.error('Safari-specific diagnostic:', {
          localStorage: localStorage.getItem('moderationEnabled'),
          indexedDB: !!window.indexedDB,
          websocket: !!WebSocket,
          fetch: !!fetch
        });
      }
      
      toast({
        title: "Erreur",
        description: `Impossible d'envoyer le message: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
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

  const deleteMessage = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);

      if (error) {
        throw error;
      }

      await loadMessages();
      toast({
        title: "Message supprimé",
        description: "Le message a été supprimé définitivement.",
      });
    } catch (error) {
      console.error('Erreur lors de la suppression du message:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le message",
        variant: "destructive"
      });
    }
  };

  const archiveMessage = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ status: 'rejected', updated_at: new Date().toISOString() })
        .eq('id', messageId);

      if (error) {
        throw error;
      }

      await loadMessages();
      toast({
        title: "Message archivé",
        description: "Le message a été archivé et n'est plus visible publiquement.",
      });
    } catch (error) {
      console.error('Erreur lors de l\'archivage du message:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'archiver le message",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    console.log('useMessages useEffect triggered');
    loadMessages();

    // Écouter les changements en temps réel
    console.log('Setting up realtime subscription...');
    const channel = supabase
      .channel('messages-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'messages' }, 
        (payload) => {
          console.log('Realtime update received:', payload);
          loadMessages();
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });

    return () => {
      console.log('Cleaning up realtime subscription');
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    messages,
    pendingMessages,
    archivedMessages,
    isLoading,
    addMessage,
    updateMessageStatus,
    deleteMessage,
    archiveMessage,
    loadMessages
  };
};
