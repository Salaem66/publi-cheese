
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Message {
  id: string;
  content: string;
  image_url: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export const useMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [pendingMessages, setPendingMessages] = useState<Message[]>([]);
  const [archivedMessages, setArchivedMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('useMessages useEffect triggered');
    loadMessages();
    setupRealtimeSubscription();
  }, []);

  const loadMessages = async () => {
    console.log('=== LOADING MESSAGES ===');
    setIsLoading(true);

    try {
      console.log('Fetching approved messages...');
      const { data: approved, error: approvedError } = await supabase
        .from('messages')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (approvedError) {
        console.error('Error loading approved messages:', approvedError);
      } else {
        console.log('Approved messages loaded:', approved.length);
        setMessages(approved);
      }

      console.log('Fetching pending messages...');
      const { data: pending, error: pendingError } = await supabase
        .from('messages')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (pendingError) {
        console.error('Error loading pending messages:', pendingError);
      } else {
        console.log('Pending messages loaded:', pending.length);
        setPendingMessages(pending);
      }

      console.log('Fetching archived messages...');
      const { data: archived, error: archivedError } = await supabase
        .from('messages')
        .select('*')
        .eq('status', 'archived')
        .order('created_at', { ascending: false });

      if (archivedError) {
        console.error('Error loading archived messages:', archivedError);
      } else {
        console.log('Archived messages loaded:', archived.length);
        setArchivedMessages(archived);
      }
    } catch (err) {
      console.error('Error in loadMessages:', err);
    }

    console.log('=== MESSAGE LOADING COMPLETED ===');
    setIsLoading(false);
  };

  const setupRealtimeSubscription = () => {
    console.log('Setting up realtime subscription...');
    try {
      const channel = supabase
        .channel('public:messages')
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages' 
        }, (payload) => {
          console.log('New message inserted:', payload.new);
          const newMessage = payload.new as Message;
          
          // Add message to appropriate state based on status
          if (newMessage.status === 'approved') {
            setMessages(prev => [newMessage, ...prev]);
          } else if (newMessage.status === 'pending') {
            setPendingMessages(prev => [newMessage, ...prev]);
          } else if (newMessage.status === 'archived') {
            setArchivedMessages(prev => [newMessage, ...prev]);
          }
        })
        .on('postgres_changes', { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'messages' 
        }, (payload) => {
          console.log('Message updated:', payload.new);
          const updatedMessage = payload.new as Message;
          const oldMessage = payload.old as Message;
          
          // Remove from old status list
          if (oldMessage.status === 'approved') {
            setMessages(prev => prev.filter(msg => msg.id !== updatedMessage.id));
          } else if (oldMessage.status === 'pending') {
            setPendingMessages(prev => prev.filter(msg => msg.id !== updatedMessage.id));
          } else if (oldMessage.status === 'archived') {
            setArchivedMessages(prev => prev.filter(msg => msg.id !== updatedMessage.id));
          }
          
          // Add to new status list
          if (updatedMessage.status === 'approved') {
            setMessages(prev => [updatedMessage, ...prev.filter(msg => msg.id !== updatedMessage.id)]);
          } else if (updatedMessage.status === 'pending') {
            setPendingMessages(prev => [updatedMessage, ...prev.filter(msg => msg.id !== updatedMessage.id)]);
          } else if (updatedMessage.status === 'archived') {
            setArchivedMessages(prev => [updatedMessage, ...prev.filter(msg => msg.id !== updatedMessage.id)]);
          }
        })
        .on('postgres_changes', { 
          event: 'DELETE', 
          schema: 'public', 
          table: 'messages' 
        }, (payload) => {
          console.log('Message deleted:', payload.old);
          const deletedMessage = payload.old as Message;
          
          // Remove from all lists
          setMessages(prev => prev.filter(msg => msg.id !== deletedMessage.id));
          setPendingMessages(prev => prev.filter(msg => msg.id !== deletedMessage.id));
          setArchivedMessages(prev => prev.filter(msg => msg.id !== deletedMessage.id));
        })
        .subscribe();
      
      console.log('Realtime subscription setup completed');
      
      // Cleanup function
      return () => {
        console.log('Cleaning up realtime subscription');
        supabase.removeChannel(channel);
      };
    } catch (err) {
      console.error('Error setting up realtime subscription:', err);
    }
  };

  const getModerationStatus = async (): Promise<boolean> => {
    console.log('Fetching moderation status from database...');
    
    try {
      // Use any to bypass TypeScript errors until types are regenerated
      const { data, error } = await (supabase as any)
        .from('settings')
        .select('value')
        .eq('key', 'moderation_enabled')
        .single();

      if (error) {
        console.log('No moderation setting found, defaulting to false');
        return false;
      }

      const enabled = data.value === 'true';
      console.log('Moderation status from database:', enabled);
      return enabled;
    } catch (err) {
      console.error('Error fetching moderation status:', err);
      return false;
    }
  };

  const addMessage = async (content: string, imageFile?: File) => {
    console.log('=== ADD MESSAGE STARTED ===');
    console.log('Content:', content);
    console.log('Image file:', imageFile?.name || 'none');
    console.log('Supabase client configured');

    try {
      // Récupérer le statut de modération depuis la BDD
      const isModerationEnabled = await getModerationStatus();
      console.log('Moderation enabled from database:', isModerationEnabled);
      
      const status = isModerationEnabled ? 'pending' : 'approved';
      console.log('Message status will be:', status);
      
      let image_url = null;

      if (imageFile) {
        console.log('Processing image upload...');
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        console.log('Uploading image with filename:', fileName);
        
        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('message-images')
          .upload(fileName, imageFile);

        if (uploadError) {
          console.error('Image upload error:', uploadError.message);
          console.error('Full upload error:', uploadError);
          throw uploadError;
        }

        console.log('Image uploaded successfully:', uploadData);
        const { data: publicUrlData } = supabase
          .storage
          .from('message-images')
          .getPublicUrl(fileName);

        image_url = publicUrlData.publicUrl;
        console.log('Image public URL:', image_url);
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
        console.error('Full error object:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        throw error;
      }

      console.log('Message inserted successfully:', data);
      
      // Note: No need to manually update state here as realtime will handle it
      
      // Afficher un toast de succès
      toast({
        title: status === 'approved' ? "Message publié !" : "Message en attente",
        description: status === 'approved' 
          ? "Votre message est maintenant visible." 
          : "Votre message sera visible après modération.",
      });

    } catch (insertError) {
      console.error('Caught error during message insertion:', insertError);
      console.error('Error type:', typeof insertError);
      console.error('Error constructor:', insertError?.constructor?.name);
      
      // Afficher un toast d'erreur
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message. Vérifiez votre connexion.",
        variant: "destructive"
      });
      
      throw insertError;
    }
  };

  const updateMessageStatus = async (id: string, status: 'approved' | 'rejected') => {
    console.log('Updating message status:', { id, status });
    try {
      const { error } = await supabase
        .from('messages')
        .update({ status })
        .eq('id', id);

      if (error) {
        console.error('Error updating message status:', error);
        toast({ title: "Erreur", description: "Impossible de modifier le message.", variant: "destructive" });
        return;
      }

      console.log('Message status updated successfully');
      // Note: No need to manually reload as realtime will handle the update
    } catch (err) {
      console.error('Error updating message status:', err);
      toast({ title: "Erreur", description: "Impossible de modifier le message.", variant: "destructive" });
    }
  };

  const deleteMessage = async (id: string) => {
    console.log('Deleting message:', id);
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting message:', error);
        toast({ title: "Erreur", description: "Impossible de supprimer le message.", variant: "destructive" });
        return;
      }

      console.log('Message deleted successfully');
      // Note: No need to manually reload as realtime will handle the deletion
    } catch (err) {
      console.error('Error deleting message:', err);
      toast({ title: "Erreur", description: "Impossible de supprimer le message.", variant: "destructive" });
    }
  };

  const archiveMessage = async (id: string) => {
    console.log('Archiving message:', id);
    try {
      const { error } = await supabase
        .from('messages')
        .update({ status: 'archived' })
        .eq('id', id);

      if (error) {
        console.error('Error archiving message:', error);
        toast({ title: "Erreur", description: "Impossible d'archiver le message.", variant: "destructive" });
        return;
      }

      console.log('Message archived successfully');
      // Note: No need to manually reload as realtime will handle the update
    } catch (err) {
      console.error('Error archiving message:', err);
      toast({ title: "Erreur", description: "Impossible d'archiver le message.", variant: "destructive" });
    }
  };

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
