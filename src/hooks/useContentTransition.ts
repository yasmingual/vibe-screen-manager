
import { useState, useEffect } from "react";
import { ContentItem } from "@/lib/store";

interface UseContentTransitionProps {
  activeItems: ContentItem[];
  initialIndex?: number;
}

export const useContentTransition = ({ 
  activeItems, 
  initialIndex = 0 
}: UseContentTransitionProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Get current item
  const currentItem = activeItems[currentIndex];
  
  // Handle automatic transitions for images
  useEffect(() => {
    if (!currentItem || activeItems.length === 0 || currentItem.type !== 'image') return;
    
    // For images, use the specified duration
    const timer = setTimeout(() => {
      console.log("Image duration timer ended, going to next item");
      handleNextItem();
    }, currentItem.duration * 1000);
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [currentIndex, currentItem, activeItems.length]);
  
  const handleNextItem = () => {
    if (activeItems.length <= 1) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % activeItems.length);
      setIsTransitioning(false);
    }, 500); // Match transition duration with CSS
  };
  
  return {
    currentIndex,
    setCurrentIndex,
    currentItem,
    isTransitioning,
    handleNextItem
  };
};

export default useContentTransition;
