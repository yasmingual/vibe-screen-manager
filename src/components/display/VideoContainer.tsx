
import { ContentItem } from "@/lib/store";
import VideoPlayer from "./VideoPlayer";

interface VideoContainerProps {
  currentItem: ContentItem;
  onVideoEnd: () => void;
}

const VideoContainer = ({ currentItem, onVideoEnd }: VideoContainerProps) => {
  return (
    <div className="w-full h-full flex">
      {/* Left background image */}
      <div 
        className="w-1/4 h-full" 
        style={{ 
          backgroundImage: currentItem.leftBackgroundImage ? `url(${currentItem.leftBackgroundImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      ></div>
      
      {/* Video container */}
      <div className="w-2/4 h-full bg-black flex items-center justify-center">
        <VideoPlayer currentItem={currentItem} onVideoEnd={onVideoEnd} />
      </div>
      
      {/* Right background image */}
      <div 
        className="w-1/4 h-full" 
        style={{ 
          backgroundImage: currentItem.rightBackgroundImage ? `url(${currentItem.rightBackgroundImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      ></div>
    </div>
  );
};

export default VideoContainer;
