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
import { fetchRssFeed, fetchLotteryResults } from "@/lib/rss-utils";

interface RssFeedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (items: Omit<ContentItem, "id" | "createdAt">[]) => Promise<void>;
}

export function RssFeedDialog({ open, onOpenChange, onImport }: RssFeedDialogProps) {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImport = async () => {
    if (!url.trim()) {
      setError("Por favor, informe um URL válido");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      toast.info("Buscando feed RSS...");
      const feedItems = await fetchRssFeed(url);
      
      if (feedItems.length === 0) {
        setError("Nenhum item encontrado no feed");
        toast.warning("Nenhum item encontrado no feed");
        return;
      }

      toast.info(`Importando ${feedItems.length} itens...`);
      await onImport(feedItems);
      setUrl("");
      onOpenChange(false);
      toast.success(`${feedItems.length} items importados com sucesso!`);
    } catch (error) {
      console.error("Error importing RSS feed:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      setError(`Erro ao importar feed: ${errorMessage}`);
      toast.error("Erro ao importar feed. Verifique a URL e tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportLotteryResults = async () => {
    setIsLoading(true);
    setError(null);

    try {
      toast.info("Buscando resultados de loterias...");
      const lotteryItems = await fetchLotteryResults();
      
      if (lotteryItems.length === 0) {
        setError("Nenhum resultado de loteria encontrado");
        toast.warning("Nenhum resultado de loteria encontrado");
        return;
      }

      toast.info(`Importando ${lotteryItems.length} resultados...`);
      await onImport(lotteryItems);
      onOpenChange(false);
      toast.success(`${lotteryItems.length} resultados importados com sucesso!`);
    } catch (error) {
      console.error("Error importing lottery results:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      setError(`Erro ao importar resultados: ${errorMessage}`);
      toast.error("Erro ao importar resultados de loterias. Tente novamente mais tarde.");
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
              onChange={(e) => {
                setUrl(e.target.value);
                setError(null);
              }}
              className={error ? "border-destructive" : ""}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <div className="text-sm text-muted-foreground">
            Exemplos de feeds RSS populares:
            <ul className="mt-1 space-y-1 list-disc list-inside">
              <li>https://g1.globo.com/rss/g1/</li>
              <li>https://feeds.folha.uol.com.br/emcimadahora/rss091.xml</li>
              <li>https://rss.uol.com.br/feed/tecnologia.xml</li>
            </ul>
          </div>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button 
            onClick={handleImportLotteryResults} 
            disabled={isLoading}
            variant="outline"
            className="w-full sm:w-auto"
          >
            {isLoading ? "Importando..." : "Importar Resultados de Loterias"}
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleImport} disabled={isLoading}>
              {isLoading ? "Importando..." : "Importar"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
