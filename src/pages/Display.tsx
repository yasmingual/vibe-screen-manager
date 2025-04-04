
import { useState, useEffect, useRef } from "react";
import { useContentStore, ContentItem } from "@/lib/store";
import { useLocation } from "react-router-dom";
import { extractYoutubeVideoId, extractTiktokVideoId } from "@/lib/utils";

const Display = () => {
  const { items } = useContentStore();
  const activeItems = items.filter(item => item.active);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const location = useLocation();
  
  useEffect(() => {
    console.log("Active items:", activeItems);
  }, [activeItems]);
  
  // Parse start index from URL if provided
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const startIndex = searchParams.get('start');
    if (startIndex && !isNaN(parseInt(startIndex))) {
      const index = parseInt(startIndex);
      if (index >= 0 && index < activeItems.length) {
        setCurrentIndex(index);
      }
    }
  }, [location.search, activeItems.length]);
  
  // Get current item
  const currentItem = activeItems[currentIndex];
  
  // Debugging
  useEffect(() => {
    console.log("Current item:", currentItem);
  }, [currentItem]);
  
  // Handle automatic transitions
  useEffect(() => {
    if (!currentItem || activeItems.length === 0) return;
    
    // For videos, we need to wait for them to finish playing
    if (currentItem.type === 'video' && videoRef.current) {
      // For videos that we can control (HTML5 video element)
      const handleVideoEnd = () => {
        handleNextItem();
      };
      
      videoRef.current.addEventListener('ended', handleVideoEnd);
      return () => {
        videoRef.current?.removeEventListener('ended', handleVideoEnd);
      };
    } else {
      // For images and other content, use the specified duration
      const timer = setTimeout(() => {
        handleNextItem();
      }, currentItem.duration * 1000);
      
      return () => clearTimeout(timer);
    }
  }, [currentIndex, currentItem, activeItems.length]);
  
  const handleNextItem = () => {
    if (activeItems.length <= 1) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % activeItems.length);
      setIsTransitioning(false);
    }, 500); // Match transition duration with CSS
  };
  
  // Render different content based on type
  const renderContent = () => {
    if (!currentItem || activeItems.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <h2 className="text-2xl font-semibold mb-4 text-white">Nenhum conteúdo ativo</h2>
          <p className="text-gray-300">Adicione e ative conteúdo no painel de administração</p>
        </div>
      );
    }
    
    if (currentItem.type === 'image') {
      return (
        <img 
          src={currentItem.source} 
          alt={currentItem.title}
          className="w-full h-full object-contain"
          onError={(e) => {
            console.error("Error loading image:", e);
            (e.target as HTMLImageElement).src = '/placeholder.svg';
          }}
        />
      );
    }
    
    if (currentItem.type === 'video') {
      if (currentItem.videoSource === 'youtube') {
        const videoId = extractYoutubeVideoId(currentItem.source);
        console.log("YouTube Video ID:", videoId);
        if (!videoId) return <div className="text-white">URL do YouTube inválida</div>;
        
        return (
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0&rel=0&mute=0&enablejsapi=1`}
            allow="autoplay; encrypted-media"
            allowFullScreen
          ></iframe>
        );
      }
      
      if (currentItem.videoSource === 'tiktok') {
        const videoId = extractTiktokVideoId(currentItem.source);
        console.log("TikTok Video ID:", videoId);
        if (!videoId) return <div className="text-white">URL do TikTok inválida</div>;
        
        return (
          <iframe
            className="w-full h-full"
            src={`https://www.tiktok.com/embed/${videoId}`}
            allow="autoplay"
            allowFullScreen
          ></iframe>
        );
      }
      
      // For direct video URLs
      return (
        <video
          ref={videoRef}
          src={currentItem.source}
          className="w-full h-full"
          autoPlay
          muted={false}
          controls={false}
          onEnded={handleNextItem}
          onError={(e) => console.error("Error loading video:", e)}
        ></video>
      );
    }
    
    return <div className="text-white">Tipo de conteúdo não suportado</div>;
  };
  
  return (
    <div className="w-full h-screen bg-black overflow-hidden relative">
      <div className={`w-full h-full transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        {renderContent()}
      </div>
      
      {/* Optional overlay with content info */}
      {currentItem && (
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 to-transparent p-4 text-white opacity-0 hover:opacity-100 transition-opacity">
          <h3 className="font-medium">{currentItem.title}</h3>
          <div className="text-sm opacity-80">
            {`${currentIndex + 1} de ${activeItems.length}`}
          </div>
        </div>
      )}
    </div>
  );
};

export default Display;
