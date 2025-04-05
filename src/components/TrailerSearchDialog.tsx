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
      <DialogContent className="sm:max-w-[600px] w-[90vw]">
        <DialogHeader>
          <DialogTitle>Buscar Trailers</DialogTitle>
          <DialogDescription>
            Busque trailers de filmes e séries para adicionar ao seu conteúdo.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="movie" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="movie">Filmes</TabsTrigger>
            <TabsTrigger value="tv">Séries</TabsTrigger>
          </TabsList>
          <div className="mt-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="search">Buscar</Label>
                <Input
                  id="search"
                  placeholder="Digite o nome do filme ou série"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setError(null);
                  }}
                  className={error ? "border-destructive" : ""}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleSearch} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Buscando...
                    </>
                  ) : (
                    "Buscar"
                  )}
                </Button>
              </div>
            </div>
            {error && <p className="text-sm text-destructive mt-2">{error}</p>}
          </div>
          <div className="mt-4 max-h-[400px] overflow-y-auto">
            {results.map((result) => (
              <Card key={result.source} className="mb-4">
                <CardHeader>
                  <CardTitle className="text-lg">{result.title}</CardTitle>
                  <CardDescription>{result.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => handleImport([result])} className="w-full">
                    Importar Trailer
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </Tabs>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 