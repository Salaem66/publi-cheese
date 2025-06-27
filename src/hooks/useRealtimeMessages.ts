
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types/message';

export const useRealtimeMessages = (
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  setPendingMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  setArchivedMessages: React.Dispatch<React.SetStateAction<Message[]>>
) => {
  const setupRealtimeSubscription = useCallback(() => {
    console.log('Setting up realtime subscription...');
    
    const channel = supabase
      .channel('public:messages')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages' 
      }, (payload) => {
        console.log('New message inserted:', payload.new);
        const newMessage = payload.new as Message;
        
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
        
        setMessages(prev => prev.filter(msg => msg.id !== deletedMessage.id));
        setPendingMessages(prev => prev.filter(msg => msg.id !== deletedMessage.id));
        setArchivedMessages(prev => prev.filter(msg => msg.id !== deletedMessage.id));
      })
      .subscribe();
    
    console.log('Realtime subscription setup completed');
    
    return () => {
      console.log('Cleaning up realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [setMessages, setPendingMessages, setArchivedMessages]);

  return { setupRealtimeSubscription };
};
