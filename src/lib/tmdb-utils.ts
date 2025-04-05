import { ContentItem } from "@/lib/store";

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const YOUTUBE_BASE_URL = "https://www.youtube.com/watch?v=";

interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
}

interface TMDBTVShow {
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  first_air_date: string;
  vote_average: number;
}

interface TMDBVideo {
  key: string;
  site: string;
  type: string;
}

interface TMDBVideosResponse {
  results: TMDBVideo[];
}

/**
 * Busca trailers de filmes no TMDB
 */
export async function searchMovieTrailers(query: string): Promise<Omit<ContentItem, "id" | "createdAt">[]> {
  try {
    // Primeiro busca o filme
    const searchResponse = await fetch(
      `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=pt-BR`
    );
    
    if (!searchResponse.ok) {
      throw new Error("Erro ao buscar filmes");
    }
    
    const searchData = await searchResponse.json();
    const movies: TMDBMovie[] = searchData.results;
    
    if (movies.length === 0) {
      return [];
    }
    
    // Para cada filme encontrado, busca os trailers
    const trailers = await Promise.all(
      movies.slice(0, 5).map(async (movie) => {
        const videosResponse = await fetch(
          `${TMDB_BASE_URL}/movie/${movie.id}/videos?api_key=${TMDB_API_KEY}&language=pt-BR`
        );
        
        if (!videosResponse.ok) {
          return null;
        }
        
        const videosData: TMDBVideosResponse = await videosResponse.json();
        const trailer = videosData.results.find(video => 
          video.site === "YouTube" && 
          (video.type === "Trailer" || video.type === "Teaser")
        );
        
        if (!trailer) {
          return null;
        }
        
        return {
          type: "video",
          title: movie.title,
          source: `${YOUTUBE_BASE_URL}${trailer.key}`,
          duration: 0, // Será calculado pelo player
          active: true,
          leftBackgroundImage: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : undefined,
          rightBackgroundImage: movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : undefined,
          description: movie.overview,
          videoSource: "youtube"
        } as Omit<ContentItem, "id" | "createdAt">;
      })
    );
    
    return trailers.filter((trailer): trailer is Omit<ContentItem, "id" | "createdAt"> => trailer !== null);
  } catch (error) {
    console.error("Erro ao buscar trailers de filmes:", error);
    throw new Error("Falha ao buscar trailers de filmes");
  }
}

/**
 * Busca trailers de séries no TMDB
 */
export async function searchTVShowTrailers(query: string): Promise<Omit<ContentItem, "id" | "createdAt">[]> {
  try {
    // Primeiro busca a série
    const searchResponse = await fetch(
      `${TMDB_BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=pt-BR`
    );
    
    if (!searchResponse.ok) {
      throw new Error("Erro ao buscar séries");
    }
    
    const searchData = await searchResponse.json();
    const shows: TMDBTVShow[] = searchData.results;
    
    if (shows.length === 0) {
      return [];
    }
    
    // Para cada série encontrada, busca os trailers
    const trailers = await Promise.all(
      shows.slice(0, 5).map(async (show) => {
        const videosResponse = await fetch(
          `${TMDB_BASE_URL}/tv/${show.id}/videos?api_key=${TMDB_API_KEY}&language=pt-BR`
        );
        
        if (!videosResponse.ok) {
          return null;
        }
        
        const videosData: TMDBVideosResponse = await videosResponse.json();
        const trailer = videosData.results.find(video => 
          video.site === "YouTube" && 
          (video.type === "Trailer" || video.type === "Teaser")
        );
        
        if (!trailer) {
          return null;
        }
        
        return {
          type: "video",
          title: show.name,
          source: `${YOUTUBE_BASE_URL}${trailer.key}`,
          duration: 0, // Será calculado pelo player
          active: true,
          leftBackgroundImage: show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : undefined,
          rightBackgroundImage: show.backdrop_path ? `https://image.tmdb.org/t/p/original${show.backdrop_path}` : undefined,
          description: show.overview,
          videoSource: "youtube"
        } as Omit<ContentItem, "id" | "createdAt">;
      })
    );
    
    return trailers.filter((trailer): trailer is Omit<ContentItem, "id" | "createdAt"> => trailer !== null);
  } catch (error) {
    console.error("Erro ao buscar trailers de séries:", error);
    throw new Error("Falha ao buscar trailers de séries");
  }
} 