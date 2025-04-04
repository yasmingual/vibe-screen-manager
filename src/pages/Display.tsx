
import { useState, useEffect, useRef } from "react";
import { useContentStore, ContentItem } from "@/lib/store";
import { useLocation } from "react-router-dom";
import { extractYoutubeVideoId, extractTiktokVideoId } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Adicionando a definição de tipos para o YouTube API
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const Display = () => {
  const { items, fetchItems } = useContentStore();
  const activeItems = items.filter(item => item.active);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const youtubeRef = useRef<HTMLIFrameElement>(null);
  const tiktokRef = useRef<HTMLIFrameElement>(null);
  const location = useLocation();
  
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
  useEffect(() => {
    const channel = supabase
      .channel('display-realtime')
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
          fetchItems();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchItems]);
  
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
  
  // Handle YouTube API
  useEffect(() => {
    // This will load the YouTube IFrame API script when needed
    if (currentItem?.type === 'video' && currentItem?.videoSource === 'youtube') {
      // Load YouTube API if not already loaded
      if (typeof window.YT === 'undefined') {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
        
        // Define the callback function that YouTube API will call when ready
        window.onYouTubeIframeAPIReady = () => {
          console.log("YouTube API is ready");
        };
      }
    }
  }, [currentItem]);
  
  // Handle automatic transitions
  useEffect(() => {
    if (!currentItem || activeItems.length === 0) return;
    
    // For videos, we need to wait for them to finish playing
    if (currentItem.type === 'video') {
      if (currentItem.videoSource === 'url' && videoRef.current) {
        // For direct video URLs using HTML5 video element
        const handleVideoEnd = () => {
          handleNextItem();
        };
        
        videoRef.current.addEventListener('ended', handleVideoEnd);
        return () => {
          videoRef.current?.removeEventListener('ended', handleVideoEnd);
        };
      } else if (!currentItem.useVideoDuration) {
        // Use configured duration if useVideoDuration is false
        const timer = setTimeout(() => {
          handleNextItem();
        }, currentItem.duration * 1000);
        
        return () => clearTimeout(timer);
      }
      // For YouTube and TikTok videos, we rely on postMessage events or fallback to duration
      // These are handled by event listeners in renderContent
    } else {
      // For images, use the specified duration
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
  
  // Handle video metadata loading to get duration
  const handleVideoMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.target as HTMLVideoElement;
    console.log("Video duration detected:", video.duration);
    
    if (currentItem && currentItem.useVideoDuration) {
      // Auto-proceed after video ends (handled by 'ended' event)
      console.log("Using natural video duration for playback");
    }
  };
  
  // Render different content based on type
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <h2 className="text-2xl font-semibold mb-4 text-white">Loading content...</h2>
        </div>
      );
    }
    
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
            toast.error("Erro ao carregar imagem");
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
        
        // Use autoplay=1 and enablejsapi=1 for YouTube videos
        return (
          <iframe
            ref={youtubeRef}
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0&rel=0&mute=0&enablejsapi=1`}
            allow="autoplay; encrypted-media"
            allowFullScreen
            onLoad={() => {
              if (currentItem.useVideoDuration) {
                console.log("YouTube video loaded, waiting for end event");
              } else {
                console.log("Using configured duration for YouTube video:", currentItem.duration);
              }
            }}
          ></iframe>
        );
      }
      
      if (currentItem.videoSource === 'tiktok') {
        const videoId = extractTiktokVideoId(currentItem.source);
        console.log("TikTok Video ID:", videoId);
        if (!videoId) return <div className="text-white">URL do TikTok inválida</div>;
        
        return (
          <iframe
            ref={tiktokRef}
            className="w-full h-full"
            src={`https://www.tiktok.com/embed/${videoId}`}
            allow="autoplay"
            allowFullScreen
            onLoad={() => {
              if (!currentItem.useVideoDuration) {
                // For TikTok videos with configured duration
                const timer = setTimeout(() => {
                  handleNextItem();
                }, currentItem.duration * 1000);
                
                return () => clearTimeout(timer);
              }
            }}
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
          onLoadedMetadata={handleVideoMetadata}
          onEnded={handleNextItem}
          onError={(e) => {
            console.error("Error loading video:", e);
            toast.error("Erro ao carregar vídeo");
          }}
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
      
      {/* Removida a seção do overlay com informações do conteúdo */}
    </div>
  );
};

export default Display;
