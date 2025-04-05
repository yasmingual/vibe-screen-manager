
import { ContentItem } from "@/lib/store";
import { toast } from "sonner";

interface ImageContentProps {
  currentItem: ContentItem;
}

const ImageContent = ({ currentItem }: ImageContentProps) => {
  // Check if the image is the placeholder, indicating it might be from RSS
  const isPlaceholder = currentItem.source === '/placeholder.svg';
  
  return (
    <div className="relative w-full h-full flex items-center justify-center">
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
      
      {/* Display title overlay for RSS content */}
      {isPlaceholder && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 p-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">{currentItem.title}</h2>
          <p className="text-white/80 text-sm mb-6">Conteúdo importado via RSS</p>
        </div>
      )}
    </div>
  );
};

export default ImageContent;
