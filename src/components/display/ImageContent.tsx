
import { ContentItem } from "@/lib/store";
import { toast } from "sonner";
import { useState, useEffect } from "react";

interface ImageContentProps {
  currentItem: ContentItem;
}

const ImageContent = ({ currentItem }: ImageContentProps) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Reset error state when item changes
  useEffect(() => {
    setImageError(false);
    setIsLoading(true);
  }, [currentItem.source]);
  
  // Check if the image is the placeholder, indicating it might be from RSS
  const isPlaceholder = currentItem.source === '/placeholder.svg' || imageError;
  
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {isLoading && !isPlaceholder && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="w-8 h-8 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      <img 
        src={imageError ? '/placeholder.svg' : currentItem.source} 
        alt={currentItem.title}
        className="w-full h-full object-contain"
        onLoad={() => setIsLoading(false)}
        onError={(e) => {
          console.error("Error loading image:", e);
          setIsLoading(false);
          setImageError(true);
          toast.error("Erro ao carregar imagem");
          (e.target as HTMLImageElement).src = '/placeholder.svg';
        }}
      />
      
      {/* Display title overlay for RSS content */}
      {isPlaceholder && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 p-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">{currentItem.title}</h2>
          <p className="text-white/80 text-sm mb-6">Conteúdo importado via RSS</p>
          {currentItem.source !== '/placeholder.svg' && (
            <button 
              className="bg-primary text-white px-4 py-2 rounded-md text-sm"
              onClick={() => window.open(currentItem.source, '_blank')}
            >
              Visualizar conteúdo original
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageContent;
