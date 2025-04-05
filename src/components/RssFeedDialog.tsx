
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ContentItem } from "@/lib/store";
import { fetchRssFeed } from "@/lib/rss-utils";

interface RssFeedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (items: Omit<ContentItem, "id" | "createdAt">[]) => Promise<void>;
}

export function RssFeedDialog({ open, onOpenChange, onImport }: RssFeedDialogProps) {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleImport = async () => {
    if (!url.trim()) {
      toast.error("Por favor, informe um URL válido");
      return;
    }

    setIsLoading(true);

    try {
      const feedItems = await fetchRssFeed(url);
      
      if (feedItems.length === 0) {
        toast.warning("Nenhum item encontrado no feed");
        return;
      }

      await onImport(feedItems);
      setUrl("");
      onOpenChange(false);
      toast.success(`${feedItems.length} items importados com sucesso!`);
    } catch (error) {
      console.error("Error importing RSS feed:", error);
      toast.error("Erro ao importar feed. Verifique a URL e tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Importar conteúdo RSS</DialogTitle>
          <DialogDescription>
            Insira a URL de um feed RSS para importar notícias e blogs como conteúdo.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="url">URL do Feed RSS</Label>
            <Input
              id="url"
              placeholder="https://exemplo.com/rss.xml"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleImport} disabled={isLoading}>
            {isLoading ? "Importando..." : "Importar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
