
import { useState, useEffect } from "react";
import { useContentStore } from "@/lib/store";
import { useLocation } from "react-router-dom";
import ContentRenderer from "@/components/display/ContentRenderer";
import useContentTransition from "@/hooks/useContentTransition";
import useSupabaseRealtime from "@/hooks/useSupabaseRealtime";

// Use existing YouTube API types from global window object
interface Window {
  onYouTubeIframeAPIReady: () => void;
}

const Display = () => {
  const { items, fetchItems } = useContentStore();
  const activeItems = items.filter(item => item.active);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  
  // Parse start index from URL if provided
  const searchParams = new URLSearchParams(location.search);
  const startIndex = searchParams.get('start');
  const initialIndex = startIndex && !isNaN(parseInt(startIndex)) 
    ? parseInt(startIndex) 
    : 0;
  
  // Handle content transitions
  const {
    currentItem,
    isTransitioning,
    handleNextItem
  } = useContentTransition({
    activeItems,
    initialIndex: initialIndex >= 0 && initialIndex < activeItems.length ? initialIndex : 0
  });
  
  // Initial data fetch
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchItems();
      setIsLoading(false);
    };
    
    loadData();
  }, [fetchItems]);
  
  // Set up real-time subscription
  useSupabaseRealtime({
    onUpdate: fetchItems
  });
  
  // Debugging
  useEffect(() => {
    console.log("Active items:", activeItems);
  }, [activeItems]);
  
  useEffect(() => {
    console.log("Current item:", currentItem);
  }, [currentItem]);
  
  return (
    <div className="w-full h-screen bg-black overflow-hidden relative">
      <div className={`w-full h-full transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        <ContentRenderer
          currentItem={currentItem}
          activeItems={activeItems}
          isLoading={isLoading}
          onVideoEnd={handleNextItem}
        />
      </div>
    </div>
  );
};

export default Display;
