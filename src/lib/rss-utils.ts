import Parser from "rss-parser";
import { ContentItem, ContentType } from "@/lib/store";

// Custom parser type with image handling
interface CustomItem {
  title: string;
  link: string;
  content: string;
  contentSnippet?: string;
  guid?: string;
  isoDate?: string;
  pubDate?: string;
  creator?: string;
  enclosure?: {
    url: string;
    type: string;
  };
  "media:content"?: {
    $: {
      url: string;
      type: string;
    };
  };
  "media:thumbnail"?: {
    $: {
      url: string;
    };
  };
}

type CustomFeed = {
  items: CustomItem[];
};

// Define proper type for customFields - this is what was causing the error
interface CustomFieldsConfig {
  item: (keyof CustomItem)[];
}

// Create a browser-compatible parser configuration
// We need to mock certain Node.js functionality that the library expects
const parserConfig = {
  customFields: {
    item: [
      "media:content",
      "media:thumbnail",
      "enclosure",
      "guid",
      "creator",
    ] as (keyof CustomItem)[] // Type assertion here helps TypeScript understand
  },
  requestOptions: {
    headers: {
      'Accept': 'application/rss+xml, application/xml, text/xml; q=0.1',
    }
  }
};

/**
 * Extract the first available image from an RSS item
 */
function extractImageFromItem(item: CustomItem): string | null {
  // Check different possible image sources in priority order
  if (item["media:content"] && item["media:content"].$ && item["media:content"].$.url) {
    return item["media:content"].$.url;
  }
  
  if (item["media:thumbnail"] && item["media:thumbnail"].$ && item["media:thumbnail"].$.url) {
    return item["media:thumbnail"].$.url;
  }
  
  if (item.enclosure && item.enclosure.url && item.enclosure.type?.startsWith("image/")) {
    return item.enclosure.url;
  }
  
  // Try to extract first image from content if available
  if (item.content) {
    const imgMatch = item.content.match(/<img[^>]+src="([^">]+)"/);
    if (imgMatch && imgMatch[1]) {
      return imgMatch[1];
    }
  }
  
  return null;
}

/**
 * Convert an RSS feed item to a ContentItem format
 */
function rssItemToContentItem(item: CustomItem): Omit<ContentItem, "id" | "createdAt"> {
  const imageUrl = extractImageFromItem(item);
  
  // If we found an image, create an image content item
  if (imageUrl) {
    return {
      type: "image",
      title: item.title || "RSS Item",
      source: imageUrl,
      duration: 10, // Default duration for images
      active: true,
      leftBackgroundImage: undefined,
      rightBackgroundImage: undefined,
    };
  }
  
  // Otherwise, create a "website" or link display (using image type with special handling)
  return {
    type: "image",
    title: item.title || "RSS Item",
    source: "/placeholder.svg", // Fallback image
    duration: 10,
    active: true,
    leftBackgroundImage: undefined,
    rightBackgroundImage: undefined,
  };
}

/**
 * Fetch and parse an RSS feed text content using fetch API directly
 */
async function fetchRssContent(url: string): Promise<string> {
  try {
    // Use a CORS proxy to fetch the RSS feed
    const corsProxy = "https://corsproxy.io/?";
    const response = await fetch(`${corsProxy}${encodeURIComponent(url)}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch RSS feed: ${response.status} ${response.statusText}`);
    }
    
    return await response.text();
  } catch (error) {
    console.error("Error fetching RSS content:", error);
    throw new Error("Failed to fetch RSS feed content");
  }
}

/**
 * Fetch and parse an RSS feed, returning ContentItems
 */
export async function fetchRssFeed(url: string): Promise<Omit<ContentItem, "id" | "createdAt">[]> {
  try {
    // First fetch the raw XML content
    const xmlContent = await fetchRssContent(url);
    
    // Create a new parser instance for each request to avoid issues with event listeners
    // This is important for browser compatibility
    const parser = new Parser<CustomFeed, CustomItem>(parserConfig as Parser.ParserOptions<CustomFeed, CustomItem>);
    
    // Then parse the XML string with rss-parser
    const feed = await parser.parseString(xmlContent);
    
    if (!feed.items || feed.items.length === 0) {
      throw new Error("No items found in feed");
    }
    
    // Convert RSS items to ContentItems
    const contentItems = feed.items.map(rssItemToContentItem);
    
    return contentItems;
  } catch (error) {
    console.error("Error fetching or parsing RSS feed:", error);
    throw new Error(`Failed to fetch or parse RSS feed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Busca resultados de loterias da Caixa
 */
export async function fetchLotteryResults(): Promise<Omit<ContentItem, "id" | "createdAt">[]> {
  try {
    // URLs das APIs da Caixa para diferentes loterias
    const lotteryApis = {
      megaSena: "https://servicebus2.caixa.gov.br/portaldeloterias/api/megasena",
      lotofacil: "https://servicebus2.caixa.gov.br/portaldeloterias/api/lotofacil",
      quina: "https://servicebus2.caixa.gov.br/portaldeloterias/api/quina",
      lotomania: "https://servicebus2.caixa.gov.br/portaldeloterias/api/lotomania",
      timemania: "https://servicebus2.caixa.gov.br/portaldeloterias/api/timemania",
      duplasena: "https://servicebus2.caixa.gov.br/portaldeloterias/api/duplasena",
      federal: "https://servicebus2.caixa.gov.br/portaldeloterias/api/federal",
      diadesorte: "https://servicebus2.caixa.gov.br/portaldeloterias/api/diadesorte",
      supersete: "https://servicebus2.caixa.gov.br/portaldeloterias/api/supersete"
    };

    // Busca resultados de todas as loterias
    const results = await Promise.all(
      Object.entries(lotteryApis).map(async ([lottery, url]) => {
        try {
          const response = await fetch(url);
          if (!response.ok) throw new Error(`Erro ao buscar ${lottery}`);
          const data = await response.json();
          
          // Formata o resultado para exibição
          const contentItem: Omit<ContentItem, "id" | "createdAt"> = {
            type: "image" as ContentType,
            title: `Resultado ${lottery.charAt(0).toUpperCase() + lottery.slice(1)}`,
            source: '/lottery-placeholder.svg',
            duration: 15,
            active: true,
            leftBackgroundImage: undefined,
            rightBackgroundImage: undefined,
            description: `Concurso ${data.numeroConcurso}: ${data.listaDezenas.join(', ')}`
          };
          
          return contentItem;
        } catch (error) {
          console.error(`Erro ao buscar ${lottery}:`, error);
          return null;
        }
      })
    );

    // Filtra resultados nulos e retorna apenas os válidos
    return results.filter((result): result is Omit<ContentItem, "id" | "createdAt"> => result !== null);
  } catch (error) {
    console.error("Erro ao buscar resultados de loterias:", error);
    throw new Error("Falha ao buscar resultados de loterias");
  }
}
