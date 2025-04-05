import Parser from "rss-parser";
import { ContentItem } from "@/lib/store";

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

// Create a custom parser with image extraction support
const parser = new Parser<CustomFeed, CustomItem>({
  customFields: {
    item: [
      "media:content",
      "media:thumbnail",
      "enclosure",
      "guid",
      "creator",
    ],
  },
});

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
 * Fetch and parse an RSS feed, returning ContentItems
 */
export async function fetchRssFeed(url: string): Promise<Omit<ContentItem, "id" | "createdAt">[]> {
  try {
    // Try to get the feed with a CORS proxy if needed
    const feed = await parser.parseURL(`https://corsproxy.io/?${encodeURIComponent(url)}`);
    
    if (!feed.items || feed.items.length === 0) {
      throw new Error("No items found in feed");
    }
    
    // Convert RSS items to ContentItems
    const contentItems = feed.items.map(rssItemToContentItem);
    
    return contentItems;
  } catch (error) {
    console.error("Error fetching RSS feed:", error);
    throw new Error("Failed to fetch or parse RSS feed");
  }
}
