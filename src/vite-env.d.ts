
/// <reference types="vite/client" />

// Declaração de tipo para a API do YouTube IFrame
interface YT {
  Player: any;
  PlayerState: any;
}

interface Window {
  YT?: YT;
  onYouTubeIframeAPIReady?: () => void;
}
