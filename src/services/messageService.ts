
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types/message';
import { toast } from '@/hooks/use-toast';

export const messageService = {
  async loadApprovedMessages(): Promise<Message[]> {
    console.log('Fetching approved messages...');
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading approved messages:', error);
      return [];
    }

    console.log('Approved messages loaded:', data.length);
    return data;
  },

  async loadPendingMessages(): Promise<Message[]> {
    console.log('Fetching pending messages...');
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading pending messages:', error);
      return [];
    }

    console.log('Pending messages loaded:', data.length);
    return data;
  },

  async loadArchivedMessages(): Promise<Message[]> {
    console.log('Fetching archived messages...');
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('status', 'archived')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading archived messages:', error);
      return [];
    }

    console.log('Archived messages loaded:', data.length);
    return data;
  },

  async updateMessageStatus(id: string, status: 'approved' | 'rejected'): Promise<void> {
    console.log('Updating message status:', { id, status });
    const { error } = await supabase
      .from('messages')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.error('Error updating message status:', error);
      toast({ title: "Erreur", description: "Impossible de modifier le message.", variant: "destructive" });
      throw error;
    }

    console.log('Message status updated successfully');
  },

  async deleteMessage(id: string): Promise<void> {
    console.log('Deleting message:', id);
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting message:', error);
      toast({ title: "Erreur", description: "Impossible de supprimer le message.", variant: "destructive" });
      throw error;
    }

    console.log('Message deleted successfully');
  },

  async archiveMessage(id: string): Promise<void> {
    console.log('Archiving message:', id);
    const { error } = await supabase
      .from('messages')
      .update({ status: 'archived' })
      .eq('id', id);

    if (error) {
      console.error('Error archiving message:', error);
      toast({ title: "Erreur", description: "Impossible d'archiver le message.", variant: "destructive" });
      throw error;
    }

    console.log('Message archived successfully');
  }
};
