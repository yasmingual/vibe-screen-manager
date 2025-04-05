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
import { searchMovieTrailers, searchTVShowTrailers } from "@/lib/tmdb-utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface TrailerSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (items: Omit<ContentItem, "id" | "createdAt">[]) => Promise<void>;
}

export function TrailerSearchDialog({ open, onOpenChange, onImport }: TrailerSearchDialogProps) {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchType, setSearchType] = useState<"movie" | "tv">("movie");
  const [results, setResults] = useState<Omit<ContentItem, "id" | "createdAt">[]>([]);

  const handleSearch = async () => {
    if (!query.trim()) {
      setError("Por favor, informe um título para buscar");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults([]);

    try {
      toast.info("Buscando trailers...");
      const searchFunction = searchType === "movie" ? searchMovieTrailers : searchTVShowTrailers;
      const trailers = await searchFunction(query);
      
      if (trailers.length === 0) {
        setError("Nenhum trailer encontrado");
        toast.warning("Nenhum trailer encontrado");
        return;
      }

      setResults(trailers);
      toast.success(`${trailers.length} trailers encontrados!`);
    } catch (error) {
      console.error("Error searching trailers:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      setError(`Erro ao buscar trailers: ${errorMessage}`);
      toast.error("Erro ao buscar trailers. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async (trailer: Omit<ContentItem, "id" | "createdAt">) => {
    try {
      await onImport([trailer]);
      toast.success("Trailer importado com sucesso!");
    } catch (error) {
      console.error("Error importing trailer:", error);
      toast.error("Erro ao importar trailer");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Buscar Trailers</DialogTitle>
          <DialogDescription>
            Busque trailers de filmes e séries para adicionar ao seu conteúdo.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Tabs value={searchType} onValueChange={(value) => setSearchType(value as "movie" | "tv")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="movie">Filmes</TabsTrigger>
                <TabsTrigger value="tv">Séries</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="flex gap-2">
              <Input
                placeholder={`Digite o nome do ${searchType === "movie" ? "filme" : "série"}...`}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setError(null);
                }}
                className={error ? "border-destructive" : ""}
              />
              <Button onClick={handleSearch} disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buscar"}
              </Button>
            </div>
            
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          {results.length > 0 && (
            <div className="grid gap-4">
              <h3 className="text-lg font-semibold">Resultados encontrados:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.map((trailer, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle>{trailer.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {trailer.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-end">
                        <Button onClick={() => handleImport(trailer)}>
                          Importar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 