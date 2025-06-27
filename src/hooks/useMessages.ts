
import { useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { Message } from '@/types/message';
import { messageService } from '@/services/messageService';
import { moderationService } from '@/services/moderationService';
import { imageUploadService } from '@/services/imageUploadService';
import { useRealtimeMessages } from './useRealtimeMessages';
import { supabase } from '@/integrations/supabase/client';

export type { Message } from '@/types/message';

export const useMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [pendingMessages, setPendingMessages] = useState<Message[]>([]);
  const [archivedMessages, setArchivedMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { setupRealtimeSubscription } = useRealtimeMessages(
    setMessages,
    setPendingMessages,
    setArchivedMessages
  );

  useEffect(() => {
    console.log('useMessages useEffect triggered');
    loadMessages();
    const cleanup = setupRealtimeSubscription();
    return cleanup;
  }, [setupRealtimeSubscription]);

  const loadMessages = async () => {
    console.log('=== LOADING MESSAGES ===');
    setIsLoading(true);

    try {
      const [approved, pending, archived] = await Promise.all([
        messageService.loadApprovedMessages(),
        messageService.loadPendingMessages(),
        messageService.loadArchivedMessages()
      ]);

      setMessages(approved);
      setPendingMessages(pending);
      setArchivedMessages(archived);
    } catch (err) {
      console.error('Error in loadMessages:', err);
    }

    console.log('=== MESSAGE LOADING COMPLETED ===');
    setIsLoading(false);
  };

  const addMessage = async (content: string, imageFile?: File) => {
    console.log('=== ADD MESSAGE STARTED ===');
    console.log('Content:', content);
    console.log('Image file:', imageFile?.name || 'none');

    try {
      const isModerationEnabled = await moderationService.getModerationStatus();
      console.log('Moderation enabled from database:', isModerationEnabled);
      
      const status = isModerationEnabled ? 'pending' : 'approved';
      console.log('Message status will be:', status);
      
      let image_url = null;

      if (imageFile) {
        image_url = await imageUploadService.uploadImage(imageFile);
      }

      const messageData = {
        content,
        image_url,
        status,
      };

      console.log('Message data to insert:', messageData);
      console.log('Inserting message into database...');

      const { data, error } = await supabase
        .from('messages')
        .insert([messageData])
        .select();

      console.log('Database response:', { data, error });

      if (error) {
        console.error('Error inserting message:', error.message);
        throw error;
      }

      console.log('Message inserted successfully:', data);
      
      toast({
        title: status === 'approved' ? "Message publié !" : "Message en attente",
        description: status === 'approved' 
          ? "Votre message est maintenant visible." 
          : "Votre message sera visible après modération.",
      });

    } catch (insertError) {
      console.error('Caught error during message insertion:', insertError);
      
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message. Vérifiez votre connexion.",
        variant: "destructive"
      });
      
      throw insertError;
    }
  };

  const updateMessageStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await messageService.updateMessageStatus(id, status);
    } catch (err) {
      console.error('Error updating message status:', err);
    }
  };

  const deleteMessage = async (id: string) => {
    try {
      await messageService.deleteMessage(id);
    } catch (err) {
      console.error('Error deleting message:', err);
    }
  };

  const archiveMessage = async (id: string) => {
    try {
      await messageService.archiveMessage(id);
    } catch (err) {
      console.error('Error archiving message:', err);
    }
  };

  const getModerationStatus = moderationService.getModerationStatus;

  return {
    messages,
    pendingMessages,
    archivedMessages,
    isLoading,
    addMessage,
    updateMessageStatus,
    deleteMessage,
    archiveMessage,
    getModerationStatus
  };
};
