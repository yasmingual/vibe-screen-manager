import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Switch } from "./ui/switch";
import { Trash2, Edit, Play, GripVertical, ArrowUp, ArrowDown } from "lucide-react";
import { ContentItem } from "@/lib/store";
import { formatDuration } from "@/lib/utils";
import { useState } from "react";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast } from 'sonner';

interface ContentCardProps {
  item: ContentItem;
  onToggleActive: (id: string, active: boolean) => Promise<void>;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onPreview: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  isFirst: boolean;
  isLast: boolean;
}

export function ContentCard({ 
  item, 
  onToggleActive, 
  onEdit, 
  onDelete, 
  onPreview,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast
}: ContentCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab'
  };

  const getThumbnail = () => {
    if (item.type === 'image') {
      return item.source;
    }
    
    if (item.videoSource === 'youtube') {
      // Extract YouTube ID and create thumbnail URL
      const match = item.source.match(/(?:\/|%3D|v=|vi=)([0-9A-Za-z_-]{11})(?:[%#?&]|$)/);
      const videoId = match ? match[1] : null;
      return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : '/placeholder.svg';
    }
    
    // Default placeholder
    return '/placeholder.svg';
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete(item.id);
      toast.success('Conteúdo excluído com sucesso');
    } catch (error) {
      toast.error('Erro ao excluir conteúdo');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleActive = async () => {
    try {
      setIsToggling(true);
      await onToggleActive(item.id, !item.active);
      toast.success(`Conteúdo ${!item.active ? 'ativado' : 'desativado'} com sucesso`);
    } catch (error) {
      toast.error('Erro ao alterar status do conteúdo');
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <Card 
      ref={setNodeRef}
      style={style}
      className={`relative overflow-hidden group transition-all ${isDragging ? 'ring-2 ring-primary' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute top-2 right-2 z-50 flex items-center gap-2">
        <div className="flex flex-col gap-1">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onMoveUp(item.id)}
            disabled={isFirst}
            className="h-8 px-2 py-0 bg-background/80 hover:bg-background"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onMoveDown(item.id)}
            disabled={isLast}
            className="h-8 px-2 py-0 bg-background/80 hover:bg-background"
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        </div>
        <Switch 
          checked={item.active} 
          onCheckedChange={async (checked) => {
            setIsToggling(true);
            await onToggleActive(item.id, checked);
            setIsToggling(false);
          }}
          disabled={isToggling}
        />
      </div>

      <CardHeader className="p-3">
        <CardTitle className="text-lg font-medium line-clamp-1">{item.title}</CardTitle>
      </CardHeader>

      <CardContent className="p-3 pt-0">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Fonte:</span> {item.source}
          </p>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Tipo:</span> {item.type}
          </p>
          {item.description && (
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Descrição:</span> {item.description}
            </p>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-3 pt-0 flex justify-between">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(item.id)}>
            <Edit className="h-4 w-4 mr-1" /> Editar
          </Button>
          <Button variant="outline" size="sm" onClick={() => onPreview(item.id)}>
            <Play className="h-4 w-4 mr-1" /> Visualizar
          </Button>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={async () => {
            setIsDeleting(true);
            await onDelete(item.id);
            setIsDeleting(false);
          }}
          disabled={isDeleting}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-1" /> {isDeleting ? 'Excluindo...' : 'Excluir'}
        </Button>
      </CardFooter>
    </Card>
  );
}
