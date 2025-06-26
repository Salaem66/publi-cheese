
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

export const useMessages = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [pendingMessages, setPendingMessages] = useState<any[]>([]);
  const [archivedMessages, setArchivedMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('useMessages useEffect triggered');
    loadMessages();
    setupRealtimeSubscription();
  }, []);

  const loadMessages = async () => {
    console.log('=== LOADING MESSAGES ===');
    setIsLoading(true);

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

    console.log('=== MESSAGE LOADING COMPLETED ===');
    setIsLoading(false);
  };

  const setupRealtimeSubscription = () => {
    console.log('Setting up realtime subscription...');
    const channel = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
        console.log('Realtime change detected, reloading messages...');
        loadMessages();
      })
      .subscribe();
    console.log('Realtime subscription status:', channel.subscriptionStatus);
  };

  const addMessage = async (content: string, imageFile?: File) => {
    console.log('=== ADD MESSAGE STARTED ===');
    console.log('Content:', content);
    console.log('Image file:', imageFile?.name || 'none');
    console.log('Supabase client configured');

    // 🔒 MODÉRATION DÉSACTIVÉE PAR DÉFAUT - Tous les messages sont approuvés automatiquement
    const isModerationEnabled = localStorage.getItem('moderationEnabled') === 'true';
    console.log('Moderation enabled from localStorage:', isModerationEnabled);
    
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

    try {
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
      
      // Recharger les messages après insertion
      await loadMessages();
      
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
    loadMessages();
  };

  const deleteMessage = async (id: string) => {
    console.log('Deleting message:', id);
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
    loadMessages();
  };

  const archiveMessage = async (id: string) => {
    console.log('Archiving message:', id);
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
    loadMessages();
  };

  return {
    messages,
    pendingMessages,
    archivedMessages,
    isLoading,
    addMessage,
    updateMessageStatus,
    deleteMessage,
    archiveMessage
  };
};
