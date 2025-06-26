
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useSettings = () => {
  const [moderationEnabled, setModerationEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadModerationSetting();
    setupRealtimeSubscription();
  }, []);

  const loadModerationSetting = async () => {
    console.log('Loading moderation setting from database...');
    setIsLoading(true);

    // Use any to bypass TypeScript errors until types are regenerated
    const { data, error } = await (supabase as any)
      .from('settings')
      .select('value')
      .eq('key', 'moderation_enabled')
      .single();

    if (error) {
      console.log('No moderation setting found, creating default (false)');
      await createDefaultModerationSetting();
      setModerationEnabled(false);
    } else {
      const enabled = data.value === 'true';
      console.log('Moderation setting loaded:', enabled);
      setModerationEnabled(enabled);
    }

    setIsLoading(false);
  };

  const createDefaultModerationSetting = async () => {
    // Use any to bypass TypeScript errors until types are regenerated
    const { error } = await (supabase as any)
      .from('settings')
      .insert([{ key: 'moderation_enabled', value: 'false' }]);

    if (error) {
      console.error('Error creating default moderation setting:', error);
    }
  };

  const setupRealtimeSubscription = () => {
    console.log('Setting up realtime subscription for settings...');
    const channel = supabase
      .channel('public:settings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, () => {
        console.log('Settings change detected, reloading...');
        loadModerationSetting();
      })
      .subscribe();
  };

  const updateModerationSetting = async (enabled: boolean) => {
    console.log('Updating moderation setting to:', enabled);
    
    // Use any to bypass TypeScript errors until types are regenerated
    const { error } = await (supabase as any)
      .from('settings')
      .upsert([{ key: 'moderation_enabled', value: enabled.toString() }]);

    if (error) {
      console.error('Error updating moderation setting:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier les paramètres.",
        variant: "destructive"
      });
      return;
    }

    console.log('Moderation setting updated successfully');
    toast({
      title: enabled ? "Modération activée" : "Modération désactivée",
      description: enabled 
        ? "Les nouveaux messages devront être approuvés avant publication" 
        : "Les messages sont publiés automatiquement.",
    });
  };

  return {
    moderationEnabled,
    isLoading,
    updateModerationSetting
  };
};
