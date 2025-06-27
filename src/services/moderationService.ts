
import { supabase } from '@/integrations/supabase/client';

export const moderationService = {
  async getModerationStatus(): Promise<boolean> {
    console.log('Fetching moderation status from database...');
    
    try {
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
  }
};
