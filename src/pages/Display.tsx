
import { useState, useEffect, useRef } from "react";
import { useContentStore, ContentItem } from "@/lib/store";
import { useLocation } from "react-router-dom";
import { extractYoutubeVideoId, extractTiktokVideoId } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Add a global declaration for the YouTube API
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
  
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchItems();
      setIsLoading(false);
    };
    
    loadData();
  }, [fetchItems]);
  
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
  
  const currentItem = activeItems[currentIndex];
  
  useEffect(() => {
    console.log("Current item:", currentItem);
  }, [currentItem]);
  
  useEffect(() => {
    if (currentItem?.type === 'video' && currentItem?.videoSource === 'youtube') {
      if (typeof window.YT === 'undefined') {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
        
        window.onYouTubeIframeAPIReady = () => {
          console.log("YouTube API is ready");
        };
      }
    }
  }, [currentItem]);
  
  useEffect(() => {
    if (!currentItem || activeItems.length === 0) return;
    
    if (currentItem.type === 'video') {
      if (currentItem.videoSource === 'url' && videoRef.current) {
        const handleVideoEnd = () => {
          handleNextItem();
        };
        
        videoRef.current.addEventListener('ended', handleVideoEnd);
        return () => {
          videoRef.current?.removeEventListener('ended', handleVideoEnd);
        };
      } else if (!currentItem.useVideoDuration) {
        const timer = setTimeout(() => {
          handleNextItem();
        }, currentItem.duration * 1000);
        
        return () => clearTimeout(timer);
      }
    } else {
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
    }, 500);
  };
  
  const handleVideoMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.target as HTMLVideoElement;
    console.log("Video duration detected:", video.duration);
    
    if (currentItem && currentItem.useVideoDuration) {
      console.log("Using natural video duration for playback");
    }
  };
  
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
        
        // Update the TikTok embed URL to hide text interface elements
        return (
          <div className="w-full h-full overflow-hidden">
            <iframe
              ref={tiktokRef}
              className="w-full h-full scale-125" /* Scale up to hide controls */
              src={`https://www.tiktok.com/embed/${videoId}?hideSharingOptions=1`}
              allow="autoplay"
              allowFullScreen
              style={{ border: 'none', position: 'relative', top: '-5%' }}
              onLoad={() => {
                if (!currentItem.useVideoDuration) {
                  const timer = setTimeout(() => {
                    handleNextItem();
                  }, currentItem.duration * 1000);
                  
                  return () => clearTimeout(timer);
                }
              }}
            ></iframe>
          </div>
        );
      }
      
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
    </div>
  );
};

export default Display;
