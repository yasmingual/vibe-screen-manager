
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Switch } from "./ui/switch";
import { Trash2, Edit, Play } from "lucide-react";
import { ContentItem } from "@/lib/store";
import { formatDuration } from "@/lib/utils";
import { useState } from "react";

interface ContentCardProps {
  item: ContentItem;
  onToggleActive: (id: string, active: boolean) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onPreview: (id: string) => void;
}

export function ContentCard({ item, onToggleActive, onEdit, onDelete, onPreview }: ContentCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
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

  return (
    <Card 
      className="relative overflow-hidden group transition-all"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-40 bg-muted overflow-hidden">
        <img 
          src={getThumbnail()} 
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder.svg';
          }}
        />
        {isHovered && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center animate-fade-in">
            <Button 
              size="icon" 
              variant="outline" 
              onClick={() => onPreview(item.id)}
              className="bg-black/50 border-white/50 hover:bg-white/20"
            >
              <Play className="h-8 w-8 text-white" />
            </Button>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Switch 
            checked={item.active} 
            onCheckedChange={(checked) => onToggleActive(item.id, checked)}
          />
        </div>
        <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
          {item.type === 'image' ? 'Image' : 'Video'} • {formatDuration(item.duration)}
        </div>
      </div>
      
      <CardHeader className="p-3">
        <CardTitle className="text-sm font-medium line-clamp-1">{item.title}</CardTitle>
      </CardHeader>
      
      <CardFooter className="p-3 pt-0 flex justify-between">
        <Button variant="ghost" size="sm" onClick={() => onEdit(item.id)}>
          <Edit className="h-4 w-4 mr-1" /> Edit
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onDelete(item.id)} className="text-destructive">
          <Trash2 className="h-4 w-4 mr-1" /> Delete
        </Button>
      </CardFooter>
    </Card>
  );
}
