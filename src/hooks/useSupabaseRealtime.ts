
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UseSupabaseRealtimeProps {
  onUpdate: () => void;
  channelName?: string;
}

export const useSupabaseRealtime = ({
  onUpdate,
  channelName = 'display-realtime'
}: UseSupabaseRealtimeProps) => {
  
  // Set up real-time subscription
  useEffect(() => {
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
          // Refresh data when changes occur
          console.log('Display: Real-time update received');
          onUpdate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onUpdate, channelName]);
};

export default useSupabaseRealtime;
