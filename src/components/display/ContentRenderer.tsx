import { ContentItem } from "@/lib/store";
import ImageContent from "./ImageContent";
import VideoContainer from "./VideoContainer";

interface ContentRendererProps {
  currentItem: ContentItem | undefined;
  activeItems: ContentItem[];
  isLoading: boolean;
  onVideoEnd: () => void;
}

const ContentRenderer = ({ 
  currentItem, 
  activeItems, 
  isLoading, 
  onVideoEnd 
}: ContentRendererProps) => {
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h2 className="text-2xl font-semibold mb-4 text-white">Carregando conteúdo...</h2>
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
    return <ImageContent currentItem={currentItem} />;
  }
  
  if (currentItem.type === 'video') {
    return <VideoContainer currentItem={currentItem} onVideoEnd={onVideoEnd} />;
  }
  
  return <div className="text-white">Tipo de conteúdo não suportado</div>;
};

export default ContentRenderer;
