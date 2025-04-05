
import { useRef, useEffect } from "react";
import { ContentItem } from "@/lib/store";
import { extractYoutubeVideoId, extractTiktokVideoId } from "@/lib/utils";
import { toast } from "sonner";

interface VideoPlayerProps {
  currentItem: ContentItem;
  onVideoEnd: () => void;
}

const VideoPlayer = ({ currentItem, onVideoEnd }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const youtubeRef = useRef<HTMLIFrameElement>(null);
  const tiktokRef = useRef<HTMLIFrameElement>(null);

  // Handle video metadata loading to get duration
  const handleVideoMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.target as HTMLVideoElement;
    console.log("Video duration detected:", video.duration);
    
    if (currentItem && currentItem.useVideoDuration) {
      // Auto-proceed after video ends (handled by 'ended' event)
      console.log("Using natural video duration for playback");
    }
  };
  
  // Handle video ended event for the video container
  const handleVideoEnded = () => {
    console.log("Video ended, going to next item");
    onVideoEnd();
  };

  // Handle YouTube API
  useEffect(() => {
    // This will load the YouTube IFrame API script when needed
    if (currentItem.videoSource === 'youtube') {
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
            
            // Set up a fallback timer for YouTube videos
            // because the 'ended' event is not always reliable
            if (youtubeRef.current && youtubeRef.current.contentWindow) {
              const duration = currentItem.duration || 300; // Default to 5 min if not set
              console.log(`Setting fallback timer for YouTube video: ${duration} seconds`);
              setTimeout(() => {
                onVideoEnd();
              }, duration * 1000);
            }
          } else {
            console.log("Using configured duration for YouTube video:", currentItem.duration);
            setTimeout(() => {
              onVideoEnd();
            }, currentItem.duration * 1000);
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
        src={`https://www.tiktok.com/embed/${videoId}?hideSharingOptions=1`}
        allow="autoplay"
        allowFullScreen
        onLoad={() => {
          console.log("TikTok video loaded");
          // For TikTok videos, always use a timer since we can't detect when they end
          const duration = currentItem.useVideoDuration ? 30 : currentItem.duration; // Default to 30 seconds for TikTok
          console.log(`Setting timer for TikTok video: ${duration} seconds`);
          setTimeout(() => {
            onVideoEnd();
          }, duration * 1000);
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
      onEnded={handleVideoEnded}
      onError={(e) => {
        console.error("Error loading video:", e);
        toast.error("Erro ao carregar vídeo");
      }}
    ></video>
  );
};

export default VideoPlayer;
