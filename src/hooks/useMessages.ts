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
        loadMessages();
      })
      .subscribe();
    console.log('Realtime subscription status:', channel.subscriptionStatus);
  };

  const addMessage = async (content: string, imageFile?: File) => {
    console.log('=== ADD MESSAGE STARTED ===');
    console.log('Content:', content);
    console.log('Image file:', imageFile?.name || 'none');

    const status = 'approved'; // 🔒 Modération désactivée globalement
    let image_url = null;

    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('message-images')
        .upload(fileName, imageFile);

      if (uploadError) {
        console.error('Image upload error:', uploadError.message);
        throw uploadError;
      }

      const { data: publicUrlData } = supabase
        .storage
        .from('message-images')
        .getPublicUrl(fileName);

      image_url = publicUrlData.publicUrl;
    }

    const messageData = {
      content,
      image_url,
      status,
    };

    console.log('Message data to insert:', messageData);

    const { data, error } = await supabase
      .from('messages')
      .insert([messageData])
      .select();

    if (error) {
      console.error('Error inserting message:', error.message);
      throw error;
    }

    console.log('Message inserted successfully:', data);
    loadMessages();
  };

  const updateMessageStatus = async (id: string, status: 'approved' | 'rejected') => {
    const { error } = await supabase
      .from('messages')
      .update({ status })
      .eq('id', id);

    if (error) {
      toast({ title: "Erreur", description: "Impossible de modifier le message.", variant: "destructive" });
      return;
    }

    loadMessages();
  };

  const deleteMessage = async (id: string) => {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: "Erreur", description: "Impossible de supprimer le message.", variant: "destructive" });
      return;
    }

    loadMessages();
  };

  const archiveMessage = async (id: string) => {
    const { error } = await supabase
      .from('messages')
      .update({ status: 'archived' })
      .eq('id', id);

    if (error) {
      toast({ title: "Erreur", description: "Impossible d'archiver le message.", variant: "destructive" });
      return;
    }

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
