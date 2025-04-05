import { useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UseSupabaseRealtimeProps {
  onUpdate: () => void;
  channelName?: string;
}

export const useSupabaseRealtime = ({
  onUpdate,
  channelName = 'display-realtime'
}: UseSupabaseRealtimeProps) => {
  // Memoize the update callback to prevent unnecessary re-renders
  const handleUpdate = useCallback(() => {
    try {
      onUpdate();
    } catch (error) {
      console.error('Error in real-time update handler:', error);
    }
  }, [onUpdate]);
  
  // Set up real-time subscription
  useEffect(() => {
    let mounted = true;
    
    const setupSubscription = async () => {
      try {
        const channel = supabase
          .channel(channelName)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'content_items'
            },
            () => {
              if (mounted) {
                console.log('Display: Real-time update received');
                handleUpdate();
              }
            }
          )
          .subscribe();

        return channel;
      } catch (error) {
        console.error('Error setting up real-time subscription:', error);
        return null;
      }
    };

    let channel: any = null;
    setupSubscription().then((ch) => {
      channel = ch;
    });

    return () => {
      mounted = false;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [channelName, handleUpdate]);
};

export default useSupabaseRealtime;
