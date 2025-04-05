
import { ContentItem } from "@/lib/store";
import { toast } from "sonner";

interface ImageContentProps {
  currentItem: ContentItem;
}

const ImageContent = ({ currentItem }: ImageContentProps) => {
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
};

export default ImageContent;
